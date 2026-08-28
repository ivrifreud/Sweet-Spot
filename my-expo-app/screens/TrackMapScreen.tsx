import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LevelProgressionMap,
  trailForWalk,
  walkDurationMs,
} from '../components/track/LevelProgressionMap';
import { TrackHud } from '../components/track/TrackHud';
import { BENNYS_GARDEN_WORLD, type WorldMapTemplate } from '../components/track/worldMapTemplates';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import type { Point } from '../lib/track/mapPath';
import {
  canEnterStage,
  canStandOn,
  currentStageNumber,
  fitMap,
  lockReason,
  MAP_NODES_PER_CHUNK,
  progressChunkIndex,
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
  onPlayStage: (stageNumber: number) => void;
  onSignOut: () => void;
};

export function TrackMapScreen({
  reveal,
  remainingChips,
  goldBars,
  streakDays,
  completedCount,
  currentWorld,
  avatarSource,
  onPlayStage,
  onSignOut,
}: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const world = currentWorld ?? BENNYS_GARDEN_WORLD;
  const progressionChunk = progressChunkIndex(completedCount, world.chunks);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [standing, setStanding] = useState(() => {
    const current = currentStageNumber(completedCount, world.nodes.length);
    // After a stage clears the screen remounts — start on the cleared node so
    // the walker can hop forward along the path (Mario overworld beat).
    if (completedCount > 0 && completedCount < current) return completedCount;
    return current;
  });
  const [trail, setTrail] = useState<Point[]>([]);
  const [trailKey, setTrailKey] = useState(0);
  const [walkDuration, setWalkDuration] = useState(560);
  const [cameraChunkIndex, setCameraChunkIndex] = useState(() => {
    const shouldRevealNext =
      completedCount > 0 &&
      completedCount % MAP_NODES_PER_CHUNK === 0 &&
      completedCount < world.nodes.length;
    return shouldRevealNext ? Math.max(0, progressionChunk - 1) : progressionChunk;
  });
  const [notice, setNotice] = useState<string | null>(
    remainingChips <= 0
      ? lockReason(
          currentStageNumber(completedCount, world.nodes.length),
          completedCount,
          remainingChips
        )
      : null
  );

  const map = useMemo(
    () =>
      area.width > 0 && area.height > 0 ? fitMap(area.width, area.height) : { width: 0, height: 0 },
    [area.height, area.width]
  );

  const standingRef = useRef(standing);
  const pendingPlay = useRef<number | null>(null);
  const worldIdRef = useRef(world.id);

  useEffect(() => {
    if (worldIdRef.current === world.id) return;
    worldIdRef.current = world.id;
    const next = currentStageNumber(completedCount, world.nodes.length);
    standingRef.current = next;
    pendingPlay.current = null;
    setStanding(next);
    setTrail([]);
    setTrailKey((key) => key + 1);
    setCameraChunkIndex(progressChunkIndex(completedCount, world.chunks));
  }, [completedCount, world.chunks, world.id, world.nodes.length]);

  useEffect(() => {
    if (map.width <= 0) return;
    setCameraChunkIndex(progressionChunk);
  }, [map.width, progressionChunk]);

  function clearPendingPlay() {
    pendingPlay.current = null;
  }

  function walkTo(stageNumber: number): number {
    if (map.width <= 0 || standingRef.current === stageNumber) {
      standingRef.current = stageNumber;
      setStanding(stageNumber);
      setTrail([]);
      return 0;
    }
    const nextTrail = trailForWalk(
      standingRef.current,
      stageNumber,
      map,
      world.nodes,
      world.chunks.length
    );
    const duration = walkDurationMs(nextTrail);
    standingRef.current = stageNumber;
    setStanding(stageNumber);
    setTrail(nextTrail);
    setWalkDuration(duration);
    setTrailKey((key) => key + 1);
    return duration;
  }

  useEffect(() => {
    const next = currentStageNumber(completedCount, world.nodes.length);
    if (map.width <= 0 || next === standingRef.current) return;
    pendingPlay.current = null;
    const nextTrail = trailForWalk(
      standingRef.current,
      next,
      map,
      world.nodes,
      world.chunks.length
    );
    const duration = walkDurationMs(nextTrail);
    standingRef.current = next;
    setStanding(next);
    setTrail(nextTrail);
    setWalkDuration(duration);
    setTrailKey((key) => key + 1);
  }, [completedCount, map, world.chunks.length, world.nodes]);

  function handlePress(stageNumber: number) {
    clearPendingPlay();
    if (!canStandOn(stageNumber, completedCount)) {
      setNotice(lockReason(stageNumber, completedCount, remainingChips));
      return;
    }
    setNotice(null);
    const alreadyThere = standingRef.current === stageNumber;
    if (!canEnterStage(stageNumber, completedCount, remainingChips)) {
      if (!alreadyThere) walkTo(stageNumber);
      return;
    }
    if (alreadyThere) {
      onPlayStage(stageNumber);
      return;
    }
    pendingPlay.current = stageNumber;
    walkTo(stageNumber);
  }

  function handleArrived() {
    const stageNumber = pendingPlay.current;
    if (stageNumber === null) return;
    pendingPlay.current = null;
    onPlayStage(stageNumber);
  }

  return (
    <View style={styles.root}>
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
        {notice ? (
          <View accessible accessibilityRole="alert" style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
      </View>

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
    zIndex: 8,
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
