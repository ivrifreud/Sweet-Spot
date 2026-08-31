import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MAP_ASPECT } from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import type { WorldMapAsset, WorldMapTemplate } from './worldMapTemplates';

type Props = {
  width: number;
  height: number;
  world: WorldMapTemplate;
  activeChunkIndex: number;
  cameraDuration?: number;
  children: ReactNode;
};

type FogProps = {
  top: number;
  width: number;
  height: number;
  leftAsset: WorldMapAsset;
  rightAsset: WorldMapAsset;
  revealed: boolean;
};

function FogOfWarClouds({ top, width, height, leftAsset, rightAsset, revealed }: FogProps) {
  const reducedMotion = useReducedMotion();
  const reveal = useSharedValue(revealed ? 1 : 0);
  const mounted = useRef(false);

  useEffect(() => {
    cancelAnimation(reveal);
    const target = revealed ? 1 : 0;
    if (!mounted.current || reducedMotion) {
      mounted.current = true;
      reveal.value = target;
      return;
    }
    reveal.value = withTiming(target, {
      duration: target === 1 ? 920 : 260,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [reducedMotion, reveal, revealed]);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value,
    transform: [{ translateX: -reveal.value * width * 0.72 }, { scale: 1 + reveal.value * 0.08 }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value,
    transform: [{ translateX: reveal.value * width * 0.72 }, { scale: 1 + reveal.value * 0.08 }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: (1 - reveal.value) * 0.42,
  }));

  const cloudWidth = width * 0.82;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.fog, { top, width, height }]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: artStyle.colors.cream }, scrimStyle]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, leftStyle]}>
        <Image
          source={leftAsset.source}
          resizeMode="contain"
          accessible={false}
          style={[
            styles.cloud,
            {
              left: -width * 0.17,
              top: height * 0.08,
              width: cloudWidth,
              aspectRatio: leftAsset.aspectRatio,
            },
          ]}
        />
        <Image
          source={leftAsset.source}
          resizeMode="contain"
          accessible={false}
          style={[
            styles.cloud,
            {
              left: -width * 0.08,
              top: height * 0.49,
              width: cloudWidth,
              aspectRatio: leftAsset.aspectRatio,
            },
          ]}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, rightStyle]}>
        <Image
          source={rightAsset.source}
          resizeMode="contain"
          accessible={false}
          style={[
            styles.cloud,
            {
              right: -width * 0.17,
              top: height * 0.18,
              width: cloudWidth,
              aspectRatio: rightAsset.aspectRatio,
            },
          ]}
        />
        <Image
          source={rightAsset.source}
          resizeMode="contain"
          accessible={false}
          style={[
            styles.cloud,
            {
              right: -width * 0.08,
              top: height * 0.58,
              width: cloudWidth,
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
  cameraDuration = 980,
  children,
}: Props) {
  const reducedMotion = useReducedMotion();
  const safeChunkIndex = Math.max(0, Math.min(activeChunkIndex, world.chunks.length - 1));
  const targetY = -(world.chunks.length - 1 - safeChunkIndex) * height;
  const cameraY = useSharedValue(targetY);
  const mounted = useRef(false);

  useEffect(() => {
    cancelAnimation(cameraY);
    if (!mounted.current || reducedMotion) {
      mounted.current = true;
      cameraY.value = targetY;
      return;
    }
    cameraY.value = withTiming(targetY, {
      duration: Math.max(1, cameraDuration),
      easing: Easing.inOut(Easing.cubic),
    });
  }, [cameraDuration, cameraY, reducedMotion, targetY]);

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
              source={world.background}
              resizeMode="cover"
              accessible={false}
              style={[
                styles.chunkBackground,
                {
                  top,
                  width,
                  height,
                  transform: [{ scaleX: chunk.index % 2 === 1 ? -1 : 1 }],
                },
              ]}
            />
          );
        })}
        {children}
        {world.chunks.map((chunk) => (
          <FogOfWarClouds
            key={`fog-${chunk.id}`}
            top={(world.chunks.length - 1 - chunk.index) * height}
            width={width}
            height={height}
            leftAsset={world.fogAssets.left}
            rightAsset={world.fogAssets.right}
            revealed={chunk.index <= safeChunkIndex}
          />
        ))}
      </Animated.View>
      <LinearGradient
        colors={[
          `${artStyle.colors.projectorBlack}14`,
          `${artStyle.colors.projectorBlack}00`,
          `${artStyle.colors.projectorBlack}47`,
        ]}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
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
  },
  chunkBackground: {
    position: 'absolute',
    left: 0,
  },
  fog: {
    position: 'absolute',
    left: 0,
    zIndex: 30,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
  },
});
