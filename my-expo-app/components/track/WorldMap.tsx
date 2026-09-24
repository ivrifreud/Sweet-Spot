/* eslint-disable react-hooks/refs -- Camera settle callback is stored in a ref. */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { FogPhase } from '../../lib/track/fogCycle';
import {
  fogCloudBox,
  fogCloudLayout,
  fogPartDrift,
  fogPartTremble,
} from '../../lib/track/fogCycle';
import { agentDebugLog } from '../../lib/agentDebugLog';
import { markPerf } from '../../lib/performance/marks';
import { visibleChunkWindow } from '../../lib/track/visibleChunkWindow';
import { CAMERA_CLIMB_MS, FOG_PART_MS, WORLD_MAP_LAYER_STACK } from '../../lib/track/tree';
import { shouldApplyFilmTreatment } from '../../lib/track/worldProgression';
import { artStyle } from '../../theme/artStyle';
import { WorldMapArtLayer } from './WorldMapArtLayer';
import type { WorldMapAsset, WorldMapTemplate } from './worldMapTemplates';

type Props = {
  width: number;
  height: number;
  world: WorldMapTemplate;
  activeChunkIndex: number;
  completedCount: number;
  fogPhase: FogPhase;
  cameraDuration?: number;
  onCameraSettled?: () => void;
  mapActive?: boolean;
  children: ReactNode;
};

type FogProps = {
  width: number;
  height: number;
  worldId: string;
  leftAsset: WorldMapAsset;
  rightAsset: WorldMapAsset;
  phase: FogPhase;
};

function FogOfWarClouds({ width, height, worldId, leftAsset, rightAsset, phase }: FogProps) {
  const reducedMotion = useReducedMotion();
  const reveal = useSharedValue(phase === 'closed' ? 0 : 1);
  const mounted = useRef(false);
  const layout = fogCloudLayout(worldId);
  const map = { width, height };
  const leftBox = fogCloudBox('left', map, leftAsset.aspectRatio, layout);
  const rightBox = fogCloudBox('right', map, rightAsset.aspectRatio, layout);

  useEffect(() => {
    cancelAnimation(reveal);
    const target = phase === 'closed' ? 0 : 1;
    if (!mounted.current || reducedMotion || phase === 'closed') {
      mounted.current = true;
      reveal.value = target;
      return;
    }
    reveal.value = withTiming(target, {
      duration: FOG_PART_MS,
      easing: Easing.bezier(0.22, 0.68, 0.28, 1),
    });
  }, [phase, reducedMotion, reveal]);

  const leftStyle = useAnimatedStyle(() => {
    const tremble = fogPartTremble(reveal.value, 'left');
    const drift = fogPartDrift(reveal.value);
    return {
      opacity: 1 - drift * 0.2,
      transform: [
        { translateX: drift * width * layout.partLeftFraction + tremble.x * width },
        { translateY: tremble.y * 18 },
        { rotate: `${tremble.rotate}deg` },
      ],
    };
  });
  const rightStyle = useAnimatedStyle(() => {
    const tremble = fogPartTremble(reveal.value, 'right');
    const drift = fogPartDrift(reveal.value);
    return {
      opacity: 1 - drift * 0.2,
      transform: [
        { translateX: drift * width * layout.partRightFraction + tremble.x * width },
        { translateY: tremble.y * 18 },
        { rotate: `${tremble.rotate}deg` },
      ],
    };
  });

  return (
    <View
      collapsable={false}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.fog}>
      <Animated.View
        collapsable={false}
        style={[
          leftStyle,
          styles.cloudBox,
          {
            left: leftBox.left,
            top: leftBox.top,
            width: leftBox.width,
            height: leftBox.height,
            elevation: WORLD_MAP_LAYER_STACK.fog.elevation,
          },
        ]}>
        <Image
          source={leftAsset.source}
          resizeMode="contain"
          accessible={false}
          style={{ width: leftBox.width, height: leftBox.height }}
          onLoad={() => {
            // #region agent log
            agentDebugLog({
              hypothesisId: 'D',
              location: 'WorldMap.tsx:fog-onLoad',
              message: 'fog image loaded',
              data: { worldId, phase, box: leftBox },
            });
            // #endregion
          }}
          onError={(event) => {
            // #region agent log
            agentDebugLog({
              hypothesisId: 'D',
              location: 'WorldMap.tsx:fog-onError',
              message: 'fog image failed',
              data: { worldId, phase, error: event.nativeEvent.error },
            });
            // #endregion
          }}
        />
      </Animated.View>
      <Animated.View
        collapsable={false}
        style={[
          rightStyle,
          styles.cloudBox,
          {
            right: rightBox.right,
            top: rightBox.top,
            width: rightBox.width,
            height: rightBox.height,
            elevation: WORLD_MAP_LAYER_STACK.fog.elevation,
          },
        ]}>
        <Image
          source={rightAsset.source}
          resizeMode="contain"
          accessible={false}
          style={{ width: rightBox.width, height: rightBox.height }}
        />
      </Animated.View>
    </View>
  );
}

/** 9:16 camera viewport over a vertically expandable stack of world chunks. */
export function WorldMap({
  width,
  height,
  world,
  activeChunkIndex,
  completedCount,
  fogPhase,
  cameraDuration = CAMERA_CLIMB_MS,
  onCameraSettled,
  mapActive = true,
  children,
}: Props) {
  const reducedMotion = useReducedMotion();
  const safeChunkIndex = Math.max(0, Math.min(activeChunkIndex, world.chunks.length - 1));
  const targetY = -(world.chunks.length - 1 - safeChunkIndex) * height;
  const cameraY = useSharedValue(targetY);
  const mounted = useRef(false);
  const prevChunk = useRef(safeChunkIndex);
  const onSettledRef = useRef(onCameraSettled);
  onSettledRef.current = onCameraSettled;
  const [artIndexes, setArtIndexes] = useState(() =>
    visibleChunkWindow({
      chunkCount: world.chunks.length,
      activeChunkIndex: safeChunkIndex,
    })
  );

  useEffect(() => {
    const settleArt = () => {
      setArtIndexes(
        visibleChunkWindow({
          chunkCount: world.chunks.length,
          activeChunkIndex: safeChunkIndex,
        })
      );
      markPerf(`map-chunk-settled-${safeChunkIndex}`);
      onSettledRef.current?.();
    };
    cancelAnimation(cameraY);
    setArtIndexes(
      visibleChunkWindow({
        chunkCount: world.chunks.length,
        activeChunkIndex: safeChunkIndex,
        travelChunkIndex: mounted.current ? prevChunk.current : null,
      })
    );
    if (!mounted.current) {
      mounted.current = true;
      prevChunk.current = safeChunkIndex;
      cameraY.value = targetY;
      return;
    }
    if (prevChunk.current === safeChunkIndex) {
      cameraY.value = targetY;
      return;
    }
    prevChunk.current = safeChunkIndex;
    markPerf('map-camera-start');
    if (reducedMotion) {
      cameraY.value = targetY;
      settleArt();
      return;
    }
    cameraY.value = withTiming(
      targetY,
      {
        duration: Math.max(1, cameraDuration),
        easing: Easing.inOut(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(settleArt)();
      }
    );
  }, [cameraDuration, cameraY, reducedMotion, safeChunkIndex, targetY, world.chunks.length]);

  const mountedArtIndexes = mapActive
    ? artIndexes
    : visibleChunkWindow({
        chunkCount: world.chunks.length,
        activeChunkIndex: safeChunkIndex,
      });

  const cameraStyle = useAnimatedStyle(() => ({
    top: cameraY.value,
  }));
  const contentHeight = height * world.chunks.length;
  const film = shouldApplyFilmTreatment(world.id) && world.filmGrain
    ? { grain: world.filmGrain }
    : undefined;
  // #region agent log
  agentDebugLog({
    hypothesisId: 'C',
    location: 'WorldMap.tsx:render',
    message: 'world camera frame',
    data: {
      worldId: world.id,
      width,
      height,
      contentHeight,
      safeChunkIndex,
      targetY,
      chunkCount: world.chunks.length,
      fogPhase,
      film: Boolean(film),
      cameraAnim: 'top',
      fogOverflow: Platform.OS === 'web' ? 'hidden' : 'visible',
      fogElevationTarget: 'cloud-boxes',
    },
  });
  // #endregion

  return (
    <View
      style={[styles.frame, { width, height }]}
      onLayout={(event) => {
        // #region agent log
        agentDebugLog({
          hypothesisId: 'G',
          location: 'WorldMap.tsx:frame-onLayout',
          message: 'world frame laid out',
          data: { worldId: world.id, props: { width, height }, layout: event.nativeEvent.layout },
        });
        // #endregion
      }}>
      <View collapsable={false} style={styles.cameraClip}>
        <Animated.View
          collapsable={false}
          style={[styles.worldContent, { width, height: contentHeight }, cameraStyle]}>
          {world.chunks
            .filter((chunk) => mountedArtIndexes.includes(chunk.index))
            .map((chunk) => {
            const top = (world.chunks.length - 1 - chunk.index) * height;
            return (
              <WorldMapArtLayer
                key={`art-${chunk.id}`}
                width={width}
                height={height}
                top={top}
                chunk={chunk}
                completedCount={completedCount}
                film={film}
                effectsActive={mapActive}
              />
            );
          })}
          <View pointerEvents="box-none" style={styles.playLayer}>
            {children}
          </View>
        </Animated.View>
      </View>
      {film ? null : (
        <LinearGradient
          colors={[
            `${artStyle.colors.projectorBlack}14`,
            `${artStyle.colors.projectorBlack}00`,
            `${artStyle.colors.projectorBlack}47`,
          ]}
          locations={[0, 0.5, 1]}
          pointerEvents="none"
          style={styles.vignette}
        />
      )}
      <FogOfWarClouds
        width={width}
        height={height}
        worldId={world.id}
        leftAsset={world.fogAssets.left}
        rightAsset={world.fogAssets.right}
        phase={fogPhase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: Platform.OS === 'web' ? 'hidden' : 'visible',
    backgroundColor: artStyle.colors.projectorBlack,
  },
  cameraClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: Platform.OS === 'web' ? 'hidden' : 'visible',
    zIndex: WORLD_MAP_LAYER_STACK.camera.zIndex,
    elevation: WORLD_MAP_LAYER_STACK.camera.elevation,
  },
  worldContent: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  playLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: WORLD_MAP_LAYER_STACK.play.zIndex,
  },
  fog: {
    ...StyleSheet.absoluteFillObject,
    overflow: Platform.OS === 'web' ? 'hidden' : 'visible',
    zIndex: WORLD_MAP_LAYER_STACK.fog.zIndex,
    backgroundColor: 'transparent',
  },
  cloudBox: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: WORLD_MAP_LAYER_STACK.vignette.zIndex,
    backgroundColor: 'transparent',
  },
});
