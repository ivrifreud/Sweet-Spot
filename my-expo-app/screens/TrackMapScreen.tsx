import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import { MapAvatar, MAP_AVATAR_SIZE } from '../components/track/MapAvatar';
import { MapCheckpoint } from '../components/track/MapCheckpoint';
import { TrackHud } from '../components/track/TrackHud';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import {
  MAP_NODES,
  MAP_NODE_SIZE,
  canEnterStage,
  canStandOn,
  currentStageNumber,
  fitMap,
  lockReason,
  nodePixels,
  stageStatus,
} from '../lib/track/tree';
import { artStyle } from '../theme/artStyle';

/** Placeholder overworld. Swap this file when the painted map lands; keep node x/y as 0–1. */
const MAP_ART = require('../assets/themes/bennys-garden/light-mobile.png');

type Props = {
  reveal: LevelReveal;
  remainingChips: number;
  goldBars: number;
  streakDays: number;
  completedCount: number;
  onPlayStage: (stageNumber: number) => void;
  onSignOut: () => void;
};

export function TrackMapScreen({
  reveal,
  remainingChips,
  goldBars,
  streakDays,
  completedCount,
  onPlayStage,
  onSignOut,
}: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [standing, setStanding] = useState(() => currentStageNumber(completedCount));
  const [notice, setNotice] = useState<string | null>(
    remainingChips <= 0 ? lockReason(currentStageNumber(completedCount), completedCount, remainingChips) : null
  );

  const map = useMemo(
    () => (area.width > 0 && area.height > 0 ? fitMap(area.width, area.height) : { width: 0, height: 0 }),
    [area.height, area.width]
  );

  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, []);

  useEffect(() => {
    setStanding(currentStageNumber(completedCount));
  }, [completedCount]);

  function handlePress(stageNumber: number) {
    if (playTimer.current) {
      clearTimeout(playTimer.current);
      playTimer.current = null;
    }
    if (!canStandOn(stageNumber, completedCount)) {
      setNotice(lockReason(stageNumber, completedCount, remainingChips));
      return;
    }
    setNotice(null);
    const alreadyThere = standing === stageNumber;
    setStanding(stageNumber);
    if (!canEnterStage(stageNumber, completedCount, remainingChips)) {
      return;
    }
    if (alreadyThere) {
      onPlayStage(stageNumber);
      return;
    }
    playTimer.current = setTimeout(() => onPlayStage(stageNumber), 580);
  }

  const standingNode = MAP_NODES.find((node) => node.number === standing) ?? MAP_NODES[0]!;
  const standingPoint = nodePixels(standingNode, map);
  const avatarX = standingPoint.x - MAP_AVATAR_SIZE / 2;
  const avatarY = standingPoint.y - MAP_AVATAR_SIZE + 10;

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
          <View
            collapsable={false}
            style={[styles.mapBox, { width: map.width, height: map.height }]}>
            <ImageBackground
              source={MAP_ART}
              resizeMode="cover"
              style={{ width: map.width, height: map.height }}
              imageStyle={styles.mapImage}>
              <View collapsable={false} style={styles.mapLayer}>
              <LinearGradient
                colors={['rgba(17,23,20,0.18)', 'rgba(17,23,20,0.28)', 'rgba(17,23,20,0.5)']}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <Svg width={map.width} height={map.height} style={StyleSheet.absoluteFill} pointerEvents="none">
                {MAP_NODES.slice(1).map((node, index) => {
                  const from = nodePixels(MAP_NODES[index]!, map);
                  const to = nodePixels(node, map);
                  const opened = stageStatus(node.number, completedCount) !== 'locked';
                  return (
                    <Line
                      key={`path-${node.id}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={opened ? artStyle.colors.gold : artStyle.colors.tobacco}
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={opened ? undefined : '10 8'}
                      opacity={opened ? 0.95 : 0.55}
                    />
                  );
                })}
              </Svg>

              {MAP_NODES.map((node) => {
                const point = nodePixels(node, map);
                return (
                  <View
                    key={node.id}
                    collapsable={false}
                    style={[
                      styles.nodeAnchor,
                      {
                        left: point.x - MAP_NODE_SIZE / 2,
                        top: point.y - MAP_NODE_SIZE / 2,
                      },
                    ]}>
                    <MapCheckpoint
                      number={node.number}
                      title={node.title}
                      status={stageStatus(node.number, completedCount)}
                      onPress={() => handlePress(node.number)}
                    />
                  </View>
                );
              })}

              <MapAvatar x={avatarX} y={avatarY} />
              </View>
            </ImageBackground>
          </View>
        ) : null}
      </View>

      <View pointerEvents="box-none" style={[styles.hudWrap, { paddingTop: insets.top + 4 }]}>
        <TrackHud remainingChips={remainingChips} goldBars={goldBars} streakDays={streakDays} />
        <Text style={[styles.kicker, display]} accessibilityRole="header">
          {`LEVEL ${reveal.placement}  ·  ${reveal.levelName.toUpperCase()}`}
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
  mapBox: {
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  nodeAnchor: {
    position: 'absolute',
    zIndex: 4,
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
