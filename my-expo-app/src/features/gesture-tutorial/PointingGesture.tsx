/* eslint-disable react-hooks/immutability -- Reanimated SharedValues are mutable animation state. */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import {
  POINTING_GLOVE_H,
  POINTING_GLOVE_TIP_X,
  POINTING_GLOVE_TIP_Y,
  POINTING_GLOVE_W,
  approxQuadLength,
  glovePoseDeg,
  heldTravelProgress,
  horizonHeadingForDial,
  rightHandEdgeLift,
  pairTapProgress,
  pointingGloveFrame,
  rotateTravelProgress,
  visualMotionForHand,
  type GestureTutorialHand,
  type TutorialPoint,
} from '../../../lib/gesture-tutorial';
import { artStyle } from '../../../theme/artStyle';
import { WarmthTearTrail } from './WarmthTearTrail';

const LOOP_MS = 1680;
const ROTATE_MS = 3200;
const PAIR_MS = 3200;
const GLOVE_W = POINTING_GLOVE_W;
const GLOVE_H = POINTING_GLOVE_H;
const TIP_X = POINTING_GLOVE_TIP_X;
const TIP_Y = POINTING_GLOVE_TIP_Y;
/** Artwork already points left, so a heading of π is zero rotation. */
const NATURAL_ANGLE = Math.PI;
/** Pixels, not a percent string. iOS rejects a decimal percent as the z origin. */
const TIP_ORIGIN: [number, number, number] = [TIP_X, TIP_Y, 0];
const GUIDE_HAND = require('../../../assets/tables/tutorial-guide-hand.png');

type Props = {
  hand: GestureTutorialHand;
  from: TutorialPoint;
  control: TutorialPoint;
  to: TutorialPoint;
  success: boolean;
  width: number;
  height: number;
};

export function PointingGesture(props: Props) {
  const motion = visualMotionForHand(props.hand);
  if (motion.kind === 'rotate') {
    return <RotatePointingGesture {...props} />;
  }
  if (motion.kind === 'tapPair') {
    return <PairTapPointingGesture {...props} />;
  }
  return <SwipeTapPointingGesture {...props} tapCount={motion.kind === 'tap' ? motion.tapCount : 1} />;
}

function SwipeTapPointingGesture({
  hand,
  from,
  control,
  to,
  success,
  tapCount,
  width,
  height,
}: Props & { tapCount: 1 | 2 }) {
  const motion = visualMotionForHand(hand);
  const isTap = motion.kind === 'tap';
  const fixedPose = glovePoseDeg(hand);
  const rotateDeg = fixedPose ?? ((horizonHeadingForDial() - NATURAL_ANGLE) * 180) / Math.PI;
  const loop = useSharedValue(0);
  const settle = useSharedValue(1);
  const fromX = useSharedValue(from.x);
  const fromY = useSharedValue(from.y);
  const controlX = useSharedValue(control.x);
  const controlY = useSharedValue(control.y);
  const toX = useSharedValue(to.x);
  const toY = useSharedValue(to.y);
  const pathLength = Math.max(24, approxQuadLength(from, control, to));

  useEffect(() => {
    fromX.value = from.x;
    fromY.value = from.y;
    controlX.value = control.x;
    controlY.value = control.y;
    toX.value = to.x;
    toY.value = to.y;
  }, [control.x, control.y, controlX, controlY, from.x, from.y, fromX, fromY, to.x, to.y, toX, toY]);

  useEffect(() => {
    loop.value = withRepeat(
      withTiming(1, { duration: LOOP_MS, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false
    );
    return () => {
      cancelAnimation(loop);
    };
  }, [hand, loop]);

  useSuccessSettle(settle, success);

  const gloveMotion = useAnimatedStyle(() => {
    const phase = loop.value;
    if (isTap) {
      const contact = tapContact(phase, tapCount);
      return {
        transform: [
          { translateY: contact * 14 },
          { rotate: `${rotateDeg + (fixedPose == null ? rightHandEdgeLift(fromX.value, width) : 0)}deg` },
          { scale: settle.value },
        ],
      };
    }

    const travel = heldTravelProgress(phase);
    const point = pointOnQuadWorklet(
      fromX.value,
      fromY.value,
      controlX.value,
      controlY.value,
      toX.value,
      toY.value,
      travel
    );
    return {
      transform: [
        { translateX: point.x - TIP_X - (fromX.value - TIP_X) },
        { translateY: point.y - TIP_Y - (fromY.value - TIP_Y) },
        { rotate: `${rotateDeg + (fixedPose == null ? rightHandEdgeLift(point.x, width) : 0)}deg` },
        { scale: settle.value },
      ],
    };
  });

  const smudgeStyle = useAnimatedStyle(() => {
    if (isTap) {
      const contact = tapContact(loop.value, tapCount);
      return {
        opacity: Math.max(0.35, contact),
        transform: [
          { translateX: fromX.value - 26 },
          { translateY: fromY.value - 26 },
          { scale: interpolate(contact, [0, 1], [0.35, 1.05]) },
        ],
      };
    }
    const travel = heldTravelProgress(loop.value);
    const point = pointOnQuadWorklet(
      fromX.value,
      fromY.value,
      controlX.value,
      controlY.value,
      toX.value,
      toY.value,
      travel
    );
    return {
      opacity: interpolate(loop.value, [0, 0.12, 0.8, 0.92, 1], [0.85, 0.85, 0.7, 0.2, 0.85]),
      transform: [{ translateX: point.x - 26 }, { translateY: point.y - 26 }, { scale: 1 }],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.fingerLayer]} pointerEvents="none">
      {isTap ? (
        <TapRipples count={tapCount} loop={loop} origin={from} />
      ) : (
        <WarmthTearTrail
          kind="quad"
          loop={loop}
          pathLength={pathLength}
          fromX={fromX}
          fromY={fromY}
          controlX={controlX}
          controlY={controlY}
          toX={toX}
          toY={toY}
          width={width}
          height={height}
        />
      )}
      <ContactGlow style={smudgeStyle} />
      <TutorialGlove tip={from} motion={gloveMotion} />
    </View>
  );
}

function RotatePointingGesture({ hand, from, control, to, success, width, height }: Props) {
  const loop = useSharedValue(0);
  const settle = useSharedValue(1);
  const centerX = useSharedValue(control.x);
  const centerY = useSharedValue(control.y);
  const radius = Math.max(24, Math.hypot(from.x - control.x, from.y - control.y));
  const pathLength = Math.max(24, Math.PI * radius);
  const rotateDeg = ((horizonHeadingForDial() - NATURAL_ANGLE) * 180) / Math.PI;

  useEffect(() => {
    centerX.value = control.x;
    centerY.value = control.y;
  }, [centerX, centerY, control.x, control.y]);

  useEffect(() => {
    loop.value = withRepeat(
      withTiming(2, { duration: ROTATE_MS * 2, easing: Easing.linear }),
      -1,
      false
    );
    return () => {
      cancelAnimation(loop);
    };
  }, [hand, loop]);

  useSuccessSettle(settle, success);

  const gloveMotion = useAnimatedStyle(() => {
    const travel = rotateTravelProgress(loop.value);
    const point = pointOnDialArcWorklet(centerX.value, centerY.value, radius, travel);
    return {
      transform: [
        { translateX: point.x - from.x },
        { translateY: point.y - from.y },
        { rotate: `${rotateDeg + rightHandEdgeLift(point.x, width)}deg` },
        { scale: settle.value },
      ],
    };
  });

  const smudgeStyle = useAnimatedStyle(() => {
    const travel = rotateTravelProgress(loop.value);
    const point = pointOnDialArcWorklet(centerX.value, centerY.value, radius, travel);
    return {
      opacity: interpolate(travel, [0, 0.08, 1], [0.35, 0.85, 0.85]),
      transform: [{ translateX: point.x - 26 }, { translateY: point.y - 26 }, { scale: 1 }],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.fingerLayer]} pointerEvents="none">
      <WarmthTearTrail
        kind="dial"
        loop={loop}
        pathLength={pathLength}
        centerX={centerX}
        centerY={centerY}
        radius={radius}
        width={width}
        height={height}
        travel="rotate"
      />
      <ContactGlow style={smudgeStyle} />
      <TutorialGlove tip={from} motion={gloveMotion} />
    </View>
  );
}

function PairTapPointingGesture({ from, to, success, hand, width }: Props) {
  const loop = useSharedValue(0);
  const settle = useSharedValue(1);
  const fromX = useSharedValue(from.x);
  const fromY = useSharedValue(from.y);
  const toX = useSharedValue(to.x);
  const toY = useSharedValue(to.y);
  const fixedPose = glovePoseDeg(hand);
  const rotateDeg = fixedPose ?? ((horizonHeadingForDial() - NATURAL_ANGLE) * 180) / Math.PI;

  useEffect(() => {
    fromX.value = from.x;
    fromY.value = from.y;
    toX.value = to.x;
    toY.value = to.y;
  }, [from.x, from.y, fromX, fromY, to.x, to.y, toX, toY]);

  useEffect(() => {
    loop.value = withRepeat(
      withTiming(1, { duration: PAIR_MS, easing: Easing.linear }),
      -1,
      false
    );
    return () => {
      cancelAnimation(loop);
    };
  }, [hand, loop]);

  useSuccessSettle(settle, success);

  const gloveMotion = useAnimatedStyle(() => {
    const progress = pairTapProgress(loop.value);
    const contact = pairTapContact(loop.value);
    const x = fromX.value + (toX.value - fromX.value) * progress;
    const y = fromY.value + (toY.value - fromY.value) * progress;
    return {
      transform: [
        { translateX: x - fromX.value },
        { translateY: y - fromY.value + contact * 14 },
        { rotate: `${rotateDeg + (fixedPose == null ? rightHandEdgeLift(x, width) : 0)}deg` },
        { scale: settle.value },
      ],
    };
  });

  const smudgeStyle = useAnimatedStyle(() => {
    const progress = pairTapProgress(loop.value);
    const contact = pairTapContact(loop.value);
    const x = fromX.value + (toX.value - fromX.value) * progress;
    const y = fromY.value + (toY.value - fromY.value) * progress;
    return {
      opacity: Math.max(0.2, contact),
      transform: [
        { translateX: x - 26 },
        { translateY: y - 26 },
        { scale: interpolate(contact, [0, 1], [0.35, 1.05]) },
      ],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.fingerLayer]} pointerEvents="none">
      <PairTapRipples loop={loop} from={from} to={to} />
      <ContactGlow style={smudgeStyle} />
      <TutorialGlove tip={from} motion={gloveMotion} />
    </View>
  );
}

function TutorialGlove({
  tip,
  motion,
}: {
  tip: TutorialPoint;
  motion: ReturnType<typeof useAnimatedStyle>;
}) {
  const frame = pointingGloveFrame(tip);
  return (
    <Animated.View
      pointerEvents="none"
      collapsable={false}
      style={[
        styles.gloveDock,
        {
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          transformOrigin: TIP_ORIGIN,
        },
        motion,
      ]}>
      <Animated.Image
        source={GUIDE_HAND}
        fadeDuration={0}
        resizeMode="stretch"
        style={{ width: frame.width, height: frame.height }}
      />
    </Animated.View>
  );
}

function useSuccessSettle(settle: SharedValue<number>, success: boolean) {
  useEffect(() => {
    if (!success) {
      settle.value = 1;
      return;
    }
    settle.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1.06, { duration: 100 }),
      withTiming(1, { duration: 110 })
    );
  }, [settle, success]);
}

function ContactGlow({ style }: { style: ReturnType<typeof useAnimatedStyle> }) {
  return (
    <Animated.View style={[styles.contactGlow, style]}>
      <Svg width={52} height={52}>
        <Defs>
          <RadialGradient id="contactHeat" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={artStyle.colors.goldBright} stopOpacity={1} />
            <Stop offset="0.28" stopColor={artStyle.colors.gold} stopOpacity={0.84} />
            <Stop offset="0.62" stopColor={artStyle.colors.cream} stopOpacity={0.34} />
            <Stop offset="1" stopColor={artStyle.colors.tealFaded} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={26} cy={26} r={26} fill="url(#contactHeat)" />
      </Svg>
    </Animated.View>
  );
}

function tapContact(phase: number, count: 1 | 2) {
  'worklet';
  if (count === 1) {
    return interpolate(phase, [0, 0.18, 0.3, 0.44, 1], [0, 0, 1, 0, 0]);
  }
  return interpolate(phase, [0, 0.12, 0.22, 0.35, 0.45, 0.58, 1], [0, 0, 1, 0, 1, 0, 0]);
}

function pairTapContact(phase: number) {
  'worklet';
  if (phase < 0.5) {
    return interpolate(phase, [0, 0.08, 0.16, 0.28], [0, 1, 0, 0]);
  }
  return interpolate(phase, [0.5, 0.58, 0.66, 0.78], [0, 1, 0, 0]);
}

function pointOnDialArcWorklet(centerX: number, centerY: number, radius: number, t: number) {
  'worklet';
  const rad = ((90 - t * 180) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY - radius * Math.sin(rad),
  };
}

function pointOnQuadWorklet(
  fromX: number,
  fromY: number,
  controlX: number,
  controlY: number,
  toX: number,
  toY: number,
  t: number
) {
  'worklet';
  const inverse = 1 - t;
  return {
    x: inverse * inverse * fromX + 2 * inverse * t * controlX + t * t * toX,
    y: inverse * inverse * fromY + 2 * inverse * t * controlY + t * t * toY,
  };
}

function PairTapRipples({
  loop,
  from,
  to,
}: {
  loop: SharedValue<number>;
  from: TutorialPoint;
  to: TutorialPoint;
}) {
  const first = useAnimatedStyle(() => {
    const pulse = pairTapContact(loop.value);
    const onLeft = pairTapProgress(loop.value) < 0.5;
    return {
      opacity: onLeft ? pulse * 0.9 : 0,
      transform: [{ scale: interpolate(pulse, [0, 1], [0.18, 2.1]) }],
    };
  });
  const second = useAnimatedStyle(() => {
    const pulse = pairTapContact(loop.value);
    const onRight = pairTapProgress(loop.value) > 0.5;
    return {
      opacity: onRight ? pulse * 0.9 : 0,
      transform: [{ scale: interpolate(pulse, [0, 1], [0.18, 2.1]) }],
    };
  });

  return (
    <>
      <Animated.View style={[styles.ripple, { left: from.x - 24, top: from.y - 24 }, first]} />
      <Animated.View style={[styles.ripple, { left: to.x - 24, top: to.y - 24 }, second]} />
    </>
  );
}

function TapRipples({
  count,
  loop,
  origin,
}: {
  count: 1 | 2;
  loop: SharedValue<number>;
  origin: TutorialPoint;
}) {
  return (
    <>
      <Ripple loop={loop} start={0.18} origin={origin} />
      {count === 2 ? <Ripple loop={loop} start={0.43} origin={origin} /> : null}
    </>
  );
}

function Ripple({
  loop,
  start,
  origin,
}: {
  loop: SharedValue<number>;
  start: number;
  origin: TutorialPoint;
}) {
  const style = useAnimatedStyle(() => {
    const local = Math.min(1, Math.max(0, (loop.value - start) / 0.34));
    return {
      opacity: local <= 0 ? 0 : interpolate(local, [0, 0.15, 1], [0, 0.9, 0]),
      transform: [{ scale: interpolate(local, [0, 1], [0.18, 2.1]) }],
    };
  });

  return (
    <Animated.View
      style={[styles.ripple, { left: origin.x - 24, top: origin.y - 24 }, style]}
    />
  );
}

const styles = StyleSheet.create({
  gloveDock: {
    position: 'absolute',
    overflow: 'visible',
    zIndex: 50,
    elevation: 50,
    opacity: 1,
  },
  fingerLayer: {
    zIndex: 50,
    elevation: 50,
  },
  contactGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 52,
    height: 52,
    zIndex: 40,
    elevation: 40,
  },
  ripple: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: artStyle.colors.cream,
    backgroundColor: 'transparent',
  },
});
