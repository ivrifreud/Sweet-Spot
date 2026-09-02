import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LevelProgressionMap,
  trailForWalk,
  walkDurationMs,
} from '../components/track/LevelProgressionMap';
import { ChipLockoutCard } from '../components/track/ChipLockoutCard';
import { TrackHud } from '../components/track/TrackHud';
import { BENNYS_GARDEN_WORLD, type WorldMapTemplate } from '../components/track/worldMapTemplates';
import { playSfx, startAmbience, stopAmbience } from '../lib/audio';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import type { Point } from '../lib/track/mapPath';
import {
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
  completedCount: number;
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
  completedCount,
  currentWorld,
  avatarSource,
  isActive = true,
  lockMessage = null,
  onPlayStage,
  onSignOut,
}: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const world = currentWorld ?? BENNYS_GARDEN_WORLD;
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
  const [notice, setNotice] = useState<string | null>(null);

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
  mapRef.current = map;
  worldRef.current = world;
  playStageRef.current = onPlayStage;

  function finishArrival(stageNumber: number) {
    physicalStandingRef.current = stageNumber;
    destinationRef.current = null;
    setStanding(stageNumber);
    setTrail([]);
    const queued = walkQueueRef.current[0];
    walkQueueRef.current = [];
    if (queued != null && queued !== stageNumber) {
      queueWalk(queued);
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
    const nextTrail = trailForWalk(
      physicalStandingRef.current,
      stageNumber,
      mapNow,
      worldNow.nodes,
      worldNow.chunks.length
    );
    destinationRef.current = stageNumber;
    const duration = walkDurationMs(nextTrail);
    setTrail(nextTrail);
    setWalkDuration(duration);
    setTrailKey((key) => key + 1);
    setCameraChunkIndex(chunkIndexForStage(stageNumber, worldNow.chunks));
    return true;
  }

  function queueWalk(stageNumber: number) {
    if (destinationRef.current != null) {
      walkQueueRef.current = [stageNumber];
      return;
    }
    if (!startWalk(stageNumber)) {
      finishArrival(stageNumber);
    }
  }

  useEffect(() => {
    if (worldIdRef.current === world.id) return;
    worldIdRef.current = world.id;
    const next = currentStageNumber(completedCount, world.nodes.length);
    physicalStandingRef.current = next;
    destinationRef.current = null;
    walkQueueRef.current = [];
    pendingPlay.current = null;
    setStanding(next);
    setTrail([]);
    setTrailKey((key) => key + 1);
    setCameraChunkIndex(chunkIndexForStage(next, world.chunks));
  }, [completedCount, world.chunks, world.id, world.nodes.length]);

  const prevReveal = useRef(cameraChunkIndex);
  useEffect(() => {
    if (cameraChunkIndex > prevReveal.current) playSfx('clouds');
    prevReveal.current = cameraChunkIndex;
  }, [cameraChunkIndex]);

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
    if (dest == null || destinationRef.current === dest) return;
    pendingPlay.current = null;
    queueWalk(dest);
  }, [completedCount, isActive, map, world.chunks.length, world.nodes, world.nodes.length]);

  function handlePress(stageNumber: number) {
    if (!canStandOn(stageNumber, completedCount)) {
      setNotice(lockReason(stageNumber, completedCount, remainingChips));
      return;
    }
    setNotice(null);
    const canEnter = canEnterStage(stageNumber, completedCount, remainingChips);
    const walking = destinationRef.current != null;
    const alreadyThere = !walking && physicalStandingRef.current === stageNumber;

    if (walking) {
      walkQueueRef.current = [stageNumber];
      pendingPlay.current = canEnter ? stageNumber : null;
      return;
    }

    if (!canEnter) {
      if (!alreadyThere) queueWalk(stageNumber);
      return;
    }

    if (alreadyThere) {
      onPlayStage(stageNumber);
      return;
    }

    pendingPlay.current = stageNumber;
    queueWalk(stageNumber);
  }

  function handleArrived() {
    playSfx('arrive');
    const dest = destinationRef.current ?? physicalStandingRef.current;
    finishArrival(dest);
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
            completedCount={completedCount}
            standing={standing}
            trail={trail}
            trailKey={trailKey}
            walkDuration={walkDuration}
            avatarSource={avatarSource}
            onPressNode={handlePress}
            onArrived={handleArrived}
          />
        ) : null}
      </View>

      <View pointerEvents="box-none" style={[styles.hudWrap, { paddingTop: insets.top + 4 }]}>
        <TrackHud remainingChips={remainingChips} goldBars={goldBars} streakDays={streakDays} />
        <Text style={[styles.kicker, display]} accessibilityRole="header">
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

      <Pressable
        onPress={onSignOut}
        hitSlop={12}
        style={[styles.signOut, { bottom: insets.bottom + 8 }]}
        accessibilityRole="button"
        accessibilityLabel="Sign out">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
    zIndex: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 6,
    backgroundColor: 'rgba(17,23,20,0.35)',
  },
  kicker: {
    color: artStyle.colors.goldBright,
    fontSize: 13,
    letterSpacing: 1.8,
    textAlign: 'center',
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
