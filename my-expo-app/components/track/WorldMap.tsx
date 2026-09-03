import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
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
import { CAMERA_CLIMB_MS, FOG_PART_MS, MAP_ASPECT } from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import type { WorldMapAsset, WorldMapTemplate } from './worldMapTemplates';

type Props = {
  width: number;
  height: number;
  world: WorldMapTemplate;
  activeChunkIndex: number;
  fogPhase: FogPhase;
  cameraDuration?: number;
  onCameraSettled?: () => void;
  children: ReactNode;
};

type FogProps = {
  width: number;
  height: number;
  leftAsset: WorldMapAsset;
  rightAsset: WorldMapAsset;
  phase: FogPhase;
};

function FogOfWarClouds({ width, height, leftAsset, rightAsset, phase }: FogProps) {
  const reducedMotion = useReducedMotion();
  const reveal = useSharedValue(phase === 'closed' ? 0 : 1);
  const mounted = useRef(false);
  const cloudWidth = width * 0.53;
  const leftHeight = cloudWidth / leftAsset.aspectRatio;
  const rightHeight = cloudWidth / rightAsset.aspectRatio;

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
      easing: Easing.inOut(Easing.cubic),
    });
  }, [phase, reducedMotion, reveal]);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value * 0.12,
    transform: [{ translateX: -reveal.value * width * 0.92 }, { scale: 1 + reveal.value * 0.04 }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value * 0.12,
    transform: [{ translateX: reveal.value * width * 0.92 }, { scale: 1 + reveal.value * 0.04 }],
  }));

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.fog}>
      <Animated.View style={[styles.cloudLayer, leftStyle]}>
        <Image
          source={leftAsset.source}
          resizeMode="contain"
          accessible={false}
          style={[
            styles.cloud,
            {
              left: -width * 0.03,
              top: -height * 0.12,
              width: cloudWidth,
              height: leftHeight,
              aspectRatio: leftAsset.aspectRatio,
            },
          ]}
        />
      </Animated.View>
      <Animated.View style={[styles.cloudLayer, rightStyle]}>
        <Image
          source={rightAsset.source}
          resizeMode="contain"
          accessible={false}
          style={[
            styles.cloud,
            {
              right: -width * 0.03,
              top: -height * 0.11,
              width: cloudWidth,
              height: rightHeight,
              aspectRatio: rightAsset.aspectRatio,
            },
          ]}
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
  fogPhase,
  cameraDuration = CAMERA_CLIMB_MS,
  onCameraSettled,
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

  useEffect(() => {
    const notifySettled = () => {
      onSettledRef.current?.();
    };
    cancelAnimation(cameraY);
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
    if (reducedMotion) {
      cameraY.value = targetY;
      notifySettled();
      return;
    }
    cameraY.value = withTiming(
      targetY,
      {
        duration: Math.max(1, cameraDuration),
        easing: Easing.inOut(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(notifySettled)();
      }
    );
  }, [cameraDuration, cameraY, reducedMotion, safeChunkIndex, targetY]);

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cameraY.value }],
  }));
  const contentHeight = height * world.chunks.length;

  return (
    <View style={[styles.frame, { width, height }]}>
      <Animated.View style={[styles.worldContent, { width, height: contentHeight }, cameraStyle]}>
        {world.chunks.map((chunk) => {
          const top = (world.chunks.length - 1 - chunk.index) * height;
          return (
            <Image
              key={`background-${chunk.id}`}
              source={chunk.background}
              resizeMode="cover"
              accessible={false}
              style={[
                styles.chunkBackground,
                {
                  top,
                  width,
                  height,
                },
              ]}
            />
          );
        })}
        {children}
      </Animated.View>
      <FogOfWarClouds
        width={width}
        height={height}
        leftAsset={world.fogAssets.left}
        rightAsset={world.fogAssets.right}
        phase={fogPhase}
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: MAP_ASPECT,
    overflow: 'hidden',
    backgroundColor: artStyle.colors.projectorBlack,
  },
  worldContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  chunkBackground: {
    position: 'absolute',
    left: 0,
  },
  fog: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  cloudLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  cloud: {
    position: 'absolute',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
  },
});
