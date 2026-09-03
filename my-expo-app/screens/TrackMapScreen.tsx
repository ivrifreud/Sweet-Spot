import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LevelProgressionMap,
  trailForWalk,
  walkDurationMs,
} from '../components/track/LevelProgressionMap';
import { ChipLockoutCard } from '../components/track/ChipLockoutCard';
import { FogClimbPreviewButton } from '../components/track/FogClimbPreviewButton';
import { StreakModal } from '../components/track/StreakModal';
import { TrackHud } from '../components/track/TrackHud';
import {
  createBennysGardenWorld,
  type WorldMapTemplate,
} from '../components/track/worldMapTemplates';
import { playSfx, startAmbience, stopAmbience } from '../lib/audio';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import { initialFogPhase, reduceFog, type FogPhase } from '../lib/track/fogCycle';
import type { Point } from '../lib/track/mapPath';
import {
  FOG_PART_MS,
  MAP_NODES_PER_CHUNK,
  canEnterStage,
  canStandOn,
  chunkIndexForStage,
  currentStageNumber,
  fitMap,
  lockReason,
  shouldAutoWalkOnFocus,
} from '../lib/track/tree';
import { artStyle } from '../theme/artStyle';

type Props = {
  reveal: LevelReveal;
  remainingChips: number;
  goldBars: number;
  streakDays: number;
  streakBestDays: number;
  completedCount: number;
  spotsByStage?: Record<number, number>;
  currentWorld?: WorldMapTemplate;
  avatarSource?: ImageSourcePropType;
  /** False while a level covers the map so Benny's shoes stay put until focus. */
  isActive?: boolean;
  lockMessage?: string | null;
  onPlayStage: (stageNumber: number) => void;
  onSignOut: () => void;
};

function initialStanding(completedCount: number, nodeCount: number): number {
  const current = currentStageNumber(completedCount, nodeCount);
  if (completedCount > 0 && completedCount < current) return completedCount;
  return current;
}

export function TrackMapScreen({
  reveal,
  remainingChips,
  goldBars,
  streakDays,
  streakBestDays,
  completedCount,
  spotsByStage = {},
  currentWorld,
  avatarSource,
  isActive = true,
  lockMessage = null,
  onPlayStage,
  onSignOut,
}: Props) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const [sessionWorld] = useState(() => currentWorld ?? createBennysGardenWorld());
  const world = currentWorld ?? sessionWorld;
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [standing, setStanding] = useState(() =>
    initialStanding(completedCount, world.nodes.length)
  );
  const [trail, setTrail] = useState<Point[]>([]);
  const [trailKey, setTrailKey] = useState(0);
  const [walkDuration, setWalkDuration] = useState(560);
  const [cameraChunkIndex, setCameraChunkIndex] = useState(() =>
    chunkIndexForStage(initialStanding(completedCount, world.nodes.length), world.chunks)
  );
  const [fogPhase, setFogPhase] = useState<FogPhase>(() =>
    initialFogPhase(Math.floor(completedCount / MAP_NODES_PER_CHUNK), world.chunks.length)
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [showStreak, setShowStreak] = useState(false);

  const map = useMemo(
    () =>
      area.width > 0 && area.height > 0 ? fitMap(area.width, area.height) : { width: 0, height: 0 },
    [area.height, area.width]
  );

  const physicalStandingRef = useRef(standing);
  const destinationRef = useRef<number | null>(null);
  const walkQueueRef = useRef<number[]>([]);
  const pendingPlay = useRef<number | null>(null);
  const worldIdRef = useRef(world.id);
  const mapRef = useRef(map);
  const worldRef = useRef(world);
  const playStageRef = useRef(onPlayStage);
  const fogPhaseRef = useRef(fogPhase);
  const fogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fogPendingRef = useRef(false);
  const reducedMotionRef = useRef(reducedMotion);
  const requestTravelRef = useRef<(stageNumber: number) => void>(() => {});
  const pendingAfterCamera = useRef<(() => void) | null>(null);
  const cameraChunkIndexRef = useRef(cameraChunkIndex);
  mapRef.current = map;
  worldRef.current = world;
  playStageRef.current = onPlayStage;
  fogPhaseRef.current = fogPhase;
  reducedMotionRef.current = reducedMotion;
  cameraChunkIndexRef.current = cameraChunkIndex;

  function finishArrival(stageNumber: number) {
    physicalStandingRef.current = stageNumber;
    destinationRef.current = null;
    setStanding(stageNumber);
    setTrail([]);
    const queued = walkQueueRef.current[0];
    walkQueueRef.current = [];
    if (queued != null && queued !== stageNumber) {
      requestTravel(queued);
      return;
    }
    const play = pendingPlay.current;
    if (play === null) return;
    pendingPlay.current = null;
    if (play === stageNumber) playStageRef.current(play);
  }

  function startWalk(stageNumber: number): boolean {
    const mapNow = mapRef.current;
    const worldNow = worldRef.current;
    if (mapNow.width <= 0) return false;
    if (physicalStandingRef.current === stageNumber) return false;
    const nextTrail = trailForWalk(physicalStandingRef.current, stageNumber, mapNow, worldNow);
    destinationRef.current = stageNumber;
    const duration = walkDurationMs(nextTrail);
    setTrail(nextTrail);
    setWalkDuration(duration);
    setTrailKey((key) => key + 1);
    return true;
  }

  function queueWalk(stageNumber: number) {
    if (destinationRef.current != null || fogTimerRef.current || fogPendingRef.current) {
      walkQueueRef.current = [stageNumber];
      return;
    }
    if (!startWalk(stageNumber)) {
      finishArrival(stageNumber);
    }
  }

  function applyFog(next: FogPhase) {
    fogPhaseRef.current = next;
    setFogPhase(next);
  }

  function climbThenWalk(stageNumber: number) {
    const destChunk = chunkIndexForStage(stageNumber, worldRef.current.chunks);
    applyFog(reduceFog(fogPhaseRef.current, { type: 'parting-finished' }));
    if (destChunk === cameraChunkIndexRef.current) {
      fogPendingRef.current = false;
      applyFog('closed');
      queueWalk(stageNumber);
      return;
    }
    pendingAfterCamera.current = () => {
      fogPendingRef.current = false;
      applyFog('closed');
      queueWalk(stageNumber);
    };
    setCameraChunkIndex(destChunk);
  }

  function partFogThenWalk(stageNumber: number) {
    if (destinationRef.current != null || fogTimerRef.current || fogPendingRef.current) {
      walkQueueRef.current = [stageNumber];
      return;
    }
    const next = reduceFog(fogPhaseRef.current, {
      type: 'chunk-cleared',
      nextChunkExists: true,
      reducedMotion: Boolean(reducedMotionRef.current),
    });
    applyFog(next);
    fogPendingRef.current = true;
    playSfx('clouds');
    const afterPart = () => {
      fogTimerRef.current = null;
      climbThenWalk(stageNumber);
    };
    if (next === 'hidden' || reducedMotionRef.current) {
      afterPart();
      return;
    }
    fogTimerRef.current = setTimeout(afterPart, FOG_PART_MS);
  }

  function requestTravel(stageNumber: number) {
    const destChunk = chunkIndexForStage(stageNumber, worldRef.current.chunks);
    const fromChunk = chunkIndexForStage(physicalStandingRef.current, worldRef.current.chunks);
    if (destChunk > fromChunk) {
      partFogThenWalk(stageNumber);
      return;
    }
    if (destChunk !== fromChunk) {
      setCameraChunkIndex(destChunk);
    }
    queueWalk(stageNumber);
  }

  /**
   * TEMPORARY DEV PREVIEW — delete with `FogClimbPreviewButton.tsx`.
   * Plays fog parting, then camera climb, then restores closed clouds.
   * Does not complete stages, move Benny, or change progression.
   */
  function previewFogAndClimb() {
    if (
      !isActive ||
      destinationRef.current != null ||
      fogTimerRef.current ||
      fogPendingRef.current
    ) {
      return;
    }
    const chunkCount = worldRef.current.chunks.length;
    if (chunkCount < 2) return;
    const from = cameraChunkIndexRef.current;
    const destChunk = from >= chunkCount - 1 ? 0 : from + 1;
    fogPendingRef.current = true;
    applyFog(
      reduceFog('closed', {
        type: 'chunk-cleared',
        nextChunkExists: true,
        reducedMotion: Boolean(reducedMotionRef.current),
      })
    );
    playSfx('clouds');
    const afterPart = () => {
      fogTimerRef.current = null;
      applyFog(reduceFog(fogPhaseRef.current, { type: 'parting-finished' }));
      if (destChunk === cameraChunkIndexRef.current) {
        fogPendingRef.current = false;
        applyFog('closed');
        return;
      }
      pendingAfterCamera.current = () => {
        fogPendingRef.current = false;
        applyFog('closed');
      };
      setCameraChunkIndex(destChunk);
    };
    if (reducedMotionRef.current) {
      afterPart();
      return;
    }
    fogTimerRef.current = setTimeout(afterPart, FOG_PART_MS);
  }

  requestTravelRef.current = requestTravel;

  useEffect(() => {
    if (worldIdRef.current === world.id) return;
    worldIdRef.current = world.id;
    const next = currentStageNumber(completedCount, world.nodes.length);
    physicalStandingRef.current = next;
    destinationRef.current = null;
    walkQueueRef.current = [];
    pendingPlay.current = null;
    if (fogTimerRef.current) {
      clearTimeout(fogTimerRef.current);
      fogTimerRef.current = null;
    }
    fogPendingRef.current = false;
    pendingAfterCamera.current = null;
    const chunk = chunkIndexForStage(next, world.chunks);
    setStanding(next);
    setTrail([]);
    setTrailKey((key) => key + 1);
    setCameraChunkIndex(chunk);
    applyFog(
      initialFogPhase(Math.floor(completedCount / MAP_NODES_PER_CHUNK), world.chunks.length)
    );
  }, [completedCount, world.chunks, world.id, world.nodes.length]);

  useEffect(() => {
    return () => {
      if (fogTimerRef.current) clearTimeout(fogTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopAmbience();
      return;
    }
    startAmbience(world.id, 'light');
    return () => stopAmbience();
  }, [isActive, world.id]);

  useEffect(() => {
    if (!isActive || map.width <= 0) return;
    const dest = shouldAutoWalkOnFocus(
      physicalStandingRef.current,
      completedCount,
      world.nodes.length
    );
    if (dest == null) {
      if (completedCount >= world.nodes.length) {
        applyFog('hidden');
      }
      return;
    }
    if (destinationRef.current === dest || fogPendingRef.current) return;
    pendingPlay.current = null;
    requestTravelRef.current(dest);
  }, [completedCount, isActive, map, world.chunks.length, world.nodes, world.nodes.length]);

  function handlePress(stageNumber: number) {
    if (!canStandOn(stageNumber, completedCount)) {
      setNotice(lockReason(stageNumber, completedCount, remainingChips));
      return;
    }
    setNotice(null);
    const canEnter = canEnterStage(stageNumber, completedCount, remainingChips);
    const walking = destinationRef.current != null || fogPendingRef.current;
    const alreadyThere = !walking && physicalStandingRef.current === stageNumber;

    if (walking) {
      walkQueueRef.current = [stageNumber];
      pendingPlay.current = canEnter ? stageNumber : null;
      return;
    }

    if (!canEnter) {
      if (!alreadyThere) requestTravel(stageNumber);
      return;
    }

    if (alreadyThere) {
      onPlayStage(stageNumber);
      return;
    }

    pendingPlay.current = stageNumber;
    requestTravel(stageNumber);
  }

  function handleArrived() {
    playSfx('arrive');
    const dest = destinationRef.current ?? physicalStandingRef.current;
    finishArrival(dest);
  }

  function handleCameraSettled() {
    const cb = pendingAfterCamera.current;
    if (!cb) return;
    pendingAfterCamera.current = null;
    cb();
  }

  return (
    <View
      style={styles.root}
      pointerEvents={isActive ? 'auto' : 'none'}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}>
      <View
        style={styles.mapArea}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setArea((current) =>
            current.width === width && current.height === height ? current : { width, height }
          );
        }}>
        {map.width > 0 ? (
          <LevelProgressionMap
            width={map.width}
            height={map.height}
            currentWorld={world}
            activeChunkIndex={cameraChunkIndex}
            fogPhase={fogPhase}
            completedCount={completedCount}
            spotsByStage={spotsByStage}
            standing={standing}
            trail={trail}
            trailKey={trailKey}
            walkDuration={walkDuration}
            avatarSource={avatarSource}
            onPressNode={handlePress}
            onArrived={handleArrived}
            onCameraSettled={handleCameraSettled}
          />
        ) : null}
      </View>

      <View pointerEvents="box-none" style={[styles.hudWrap, { paddingTop: insets.top + 4 }]}>
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(17,23,20,0.72)', 'rgba(17,23,20,0.28)', 'rgba(17,23,20,0)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <TrackHud
          remainingChips={remainingChips}
          goldBars={goldBars}
          streakDays={streakDays}
          onPressStreak={() => setShowStreak(true)}
        />
        <Text style={[styles.kicker, display]} accessibilityRole="header" numberOfLines={1}>
          {`${world.name.toUpperCase()}  ·  LEVEL ${reveal.placement}  ·  ${reveal.levelName.toUpperCase()}`}
        </Text>
        {!lockMessage && notice ? (
          <View
            accessible
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
      </View>

      {lockMessage ? <ChipLockoutCard countdown={lockMessage} /> : null}

      {/* TEMPORARY DEV PREVIEW — delete this JSX with FogClimbPreviewButton.tsx */}
      <FogClimbPreviewButton
        onPress={previewFogAndClimb}
        bottom={insets.bottom + 48}
        left={12}
      />

      <Pressable
        onPress={onSignOut}
        hitSlop={12}
        style={[styles.signOut, { bottom: insets.bottom + 8 }]}
        accessibilityRole="button"
        accessibilityLabel="Sign out">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <StreakModal
        visible={showStreak}
        currentStreak={streakDays}
        bestStreak={streakBestDays}
        onClose={() => setShowStreak(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  mapArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 12,
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 4,
  },
  kicker: {
    color: artStyle.colors.goldBright,
    fontSize: 11,
    letterSpacing: 1.4,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  notice: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: artStyle.colors.oxblood,
    backgroundColor: 'rgba(164,62,50,0.22)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  noticeText: {
    color: artStyle.colors.cream,
    fontSize: 14,
    textAlign: 'center',
  },
  signOut: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    zIndex: 8,
  },
  signOutText: {
    color: 'rgba(232,215,167,0.78)',
    fontSize: 14,
  },
});
