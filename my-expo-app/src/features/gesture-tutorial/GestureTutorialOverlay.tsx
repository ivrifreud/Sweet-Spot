import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  fallbackTableRects,
  fingerPathForStep,
  overlayViewport,
  rectCenter,
  spotlightForTarget,
  type GestureTutorialAction,
  type GestureTutorialConfig,
  type GestureTutorialStep,
  type TutorialControlHits,
  type TutorialPoint,
  type TutorialRect,
} from '../../../lib/gesture-tutorial';
import { artStyle } from '../../../theme/artStyle';
import { PointingGesture } from './PointingGesture';

export type HitRect = TutorialRect;

type Props = {
  config: GestureTutorialConfig;
  step: GestureTutorialStep;
  stepIndex: number;
  cardHit?: HitRect;
  stackHit?: HitRect;
  tableCenter?: TutorialPoint;
  dialHit?: HitRect;
  lockInHit?: HitRect;
  foldHit?: HitRect;
  callHit?: HitRect;
  success: boolean;
  rejectTick: number;
  onSkip?: () => void;
  onGesture?: (action: GestureTutorialAction) => void;
  onReject?: () => void;
};

export function GestureTutorialOverlay({
  config,
  step,
  stepIndex,
  cardHit,
  stackHit,
  tableCenter,
  dialHit,
  lockInHit,
  foldHit,
  callHit,
  success,
  rejectTick,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();
  const windowSize = useWindowDimensions();
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
  const shake = useSharedValue(0);
  const viewport = overlayViewport(layout, windowSize);
  const { width, height } = viewport;
  const fallback = fallbackTableRects(viewport);
  const cards = cardHit ?? fallback.cardHit;
  const stack = stackHit ?? fallback.stackHit;
  const pot = tableCenter ?? fallback.tableCenter;
  const extras: TutorialControlHits = {
    dial: dialHit,
    lockIn: lockInHit,
    fold: foldHit,
    call: callHit,
  };
  const spotlight =
    step.hand === 'tapPair' && foldHit && callHit
      ? {
          origin: {
            x: (rectCenter(foldHit).x + rectCenter(callHit).x) / 2,
            y: (rectCenter(foldHit).y + rectCenter(callHit).y) / 2,
          },
          radius: Math.max(
            Math.hypot(
              rectCenter(callHit).x - rectCenter(foldHit).x,
              rectCenter(callHit).y - rectCenter(foldHit).y
            ) * 0.62,
            120
          ),
        }
      : spotlightForTarget(step.target, cards, stack, viewport, extras);
  const { from, control, to } = fingerPathForStep(step, cards, stack, pot, viewport, extras);

  useEffect(() => {
    if (rejectTick <= 0) {
      return;
    }
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 70 }),
      withTiming(-5, { duration: 60 }),
      withTiming(0, { duration: 70 })
    );
  }, [rejectTick, shake]);

  const rootStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      collapsable={false}
      onLayout={(event) => {
        const next = event.nativeEvent.layout;
        setLayout((current) =>
          current && current.width === next.width && current.height === next.height
            ? current
            : { width: next.width, height: next.height }
        );
      }}
      style={styles.root}>
      <SoftSpotlight origin={spotlight.origin} radius={spotlight.radius} />

      <PointingGesture
        key={step.id}
        hand={step.hand}
        from={from}
        control={control}
        to={to}
        success={success}
        width={width}
        height={height}
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.copy, { paddingTop: insets.top + 10 }, rootStyle]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={step.copy}>
        <Text style={styles.index}>
          {stepIndex + 1} / {config.steps.length}
        </Text>
        <Text style={styles.instruction}>{step.copy}</Text>
      </Animated.View>

      {__DEV__ && onSkip ? (
        <Pressable
          onPress={onSkip}
          style={[styles.skip, { bottom: insets.bottom + 18 }]}
          accessibilityRole="button"
          accessibilityLabel="Skip tutorial">
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SoftSpotlight({ origin, radius }: { origin: TutorialPoint; radius: number }) {
  const fadeRadius = Math.max(radius * 2.35, 160);

  return (
    <Svg pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
      <Defs>
        <RadialGradient
          id="tutorialSpotlight"
          gradientUnits="userSpaceOnUse"
          r={fadeRadius}
          cx={origin.x}
          cy={origin.y}>
          <Stop offset="0" stopColor={artStyle.colors.projectorBlack} stopOpacity={0} />
          <Stop offset="0.34" stopColor={artStyle.colors.projectorBlack} stopOpacity={0.16} />
          <Stop offset="0.7" stopColor={artStyle.colors.projectorBlack} stopOpacity={0.58} />
          <Stop offset="1" stopColor={artStyle.colors.projectorBlack} stopOpacity={0.76} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#tutorialSpotlight)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
    overflow: 'visible',
  },
  copy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  index: {
    color: artStyle.colors.goldBright,
    fontSize: 18,
    letterSpacing: 3,
    marginBottom: 8,
    fontWeight: '800',
  },
  instruction: {
    color: artStyle.colors.cream,
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '800',
    textShadowColor: 'rgba(17, 23, 20, 0.92)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  skip: {
    position: 'absolute',
    right: 18,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  skipLabel: {
    color: 'rgba(232, 215, 167, 0.85)',
    fontSize: 16,
    fontWeight: '700',
  },
});
