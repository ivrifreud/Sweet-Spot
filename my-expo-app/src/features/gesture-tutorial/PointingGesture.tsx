import { useEffect } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import {
  approxQuadLength,
  horizonHeadingForSwipe,
  quadPathD,
  visualMotionForHand,
  warmthTrailLayers,
  type GestureTutorialHand,
  type TutorialPoint,
  type WarmthTrailLayer,
} from '../../../lib/gesture-tutorial';
import { artStyle } from '../../../theme/artStyle';

const GLOVE = require('../../../assets/tables/tutorial-point-glove.png');
const LOOP_MS = 1680;
const SOURCE_W = 159;
const SOURCE_H = 126;
const GLOVE_W = 148;
const GLOVE_H = Math.round((GLOVE_W * SOURCE_H) / SOURCE_W);
const TIP_X = (155 / SOURCE_W) * GLOVE_W;
const TIP_Y = (11 / SOURCE_H) * GLOVE_H;
const PALM_X = GLOVE_W * 0.28;
const PALM_Y = GLOVE_H * 0.7;
const NATURAL_ANGLE = Math.atan2(TIP_Y - PALM_Y, TIP_X - PALM_X);
const TIP_ORIGIN = `${TIP_X}px ${TIP_Y}px`;

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  hand: GestureTutorialHand;
  from: TutorialPoint;
  control: TutorialPoint;
  to: TutorialPoint;
  success: boolean;
};

export function PointingGesture({ hand, from, control, to, success }: Props) {
  const { width, height } = useWindowDimensions();
  const motion = visualMotionForHand(hand);
  const heading = horizonHeadingForSwipe(from, to);
  const rotate = `${((heading - NATURAL_ANGLE) * 180) / Math.PI}deg`;
  const loop = useSharedValue(0);
  const settle = useSharedValue(1);
  const fromX = useSharedValue(from.x);
  const fromY = useSharedValue(from.y);
  const controlX = useSharedValue(control.x);
  const controlY = useSharedValue(control.y);
  const toX = useSharedValue(to.x);
  const toY = useSharedValue(to.y);
  const pathLength = Math.max(24, approxQuadLength(from, control, to));
  const pathD = quadPathD(from, control, to);
  const trailLayers = warmthTrailLayers(pathLength);

  useEffect(() => {
    fromX.value = from.x;
    fromY.value = from.y;
    controlX.value = control.x;
    controlY.value = control.y;
    toX.value = to.x;
    toY.value = to.y;
  }, [control.x, control.y, controlX, controlY, from.x, from.y, fromX, fromY, to.x, to.y, toX, toY]);

  useEffect(() => {
    loop.value = 0;
    loop.value = withRepeat(
      withTiming(1, { duration: LOOP_MS, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false
    );
  }, [hand, from.x, from.y, to.x, to.y, loop]);

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

  const gloveMotion = useAnimatedStyle(() => {
    const phase = loop.value;
    if (motion.kind === 'tap') {
      const contact = tapContact(phase, motion.tapCount);
      return {
        opacity: interpolate(phase, [0, 0.08, 0.88, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
        transform: [
          { translateX: fromX.value - TIP_X },
          { translateY: fromY.value + contact * 14 - TIP_Y },
          { rotate },
          { scale: settle.value },
        ],
      };
    }

    const travel = heldTravel(phase);
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
      opacity: interpolate(phase, [0, 0.08, 0.84, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: point.x - TIP_X },
        { translateY: point.y - TIP_Y },
        { rotate },
        { scale: settle.value },
      ],
    };
  });

  const smudgeStyle = useAnimatedStyle(() => {
    if (motion.kind === 'tap') {
      const contact = tapContact(loop.value, motion.tapCount);
      return {
        opacity: contact * interpolate(loop.value, [0, 0.08, 0.9, 1], [0, 1, 1, 0]),
        transform: [
          { translateX: fromX.value - 26 },
          { translateY: fromY.value - 26 },
          { scale: interpolate(contact, [0, 1], [0.35, 1.05]) },
        ],
      };
    }
    const travel = heldTravel(loop.value);
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
      opacity: interpolate(loop.value, [0, 0.12, 0.8, 0.92, 1], [0, 0.85, 0.7, 0.2, 0]),
      transform: [{ translateX: point.x - 26 }, { translateY: point.y - 26 }, { scale: 1 }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {motion.kind === 'swipe' ? (
        <TouchTrail
          d={pathD}
          loop={loop}
          pathLength={pathLength}
          layers={trailLayers}
          width={width}
          height={height}
        />
      ) : (
        <TapRipples count={motion.tapCount} loop={loop} origin={from} />
      )}
      <Animated.View style={[styles.contactGlow, smudgeStyle]}>
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
      <AnimatedImage source={GLOVE} resizeMode="contain" style={[styles.glove, gloveMotion]} />
    </View>
  );
}

function heldTravel(phase: number) {
  'worklet';
  return interpolate(phase, [0, 0.12, 0.8, 0.9, 1], [0, 0, 1, 1, 1], Extrapolation.CLAMP);
}

function tapContact(phase: number, count: 1 | 2) {
  'worklet';
  if (count === 1) {
    return interpolate(phase, [0, 0.18, 0.3, 0.44, 1], [0, 0, 1, 0, 0]);
  }
  return interpolate(phase, [0, 0.12, 0.22, 0.35, 0.45, 0.58, 1], [0, 0, 1, 0, 1, 0, 0]);
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

function TouchTrail({
  d,
  loop,
  pathLength,
  layers,
  width,
  height,
}: {
  d: string;
  loop: SharedValue<number>;
  pathLength: number;
  layers: WarmthTrailLayer[];
  width: number;
  height: number;
}) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {layers.map((layer) => (
        <TrailLayer
          key={layer.role}
          d={d}
          loop={loop}
          pathLength={pathLength}
          layer={layer}
        />
      ))}
    </Svg>
  );
}

function TrailLayer({
  d,
  loop,
  pathLength,
  layer,
}: {
  d: string;
  loop: SharedValue<number>;
  pathLength: number;
  layer: WarmthTrailLayer;
}) {
  const animatedProps = useAnimatedProps(() => {
    const travel = heldTravel(loop.value);
    return {
      strokeDashoffset: layer.length - travel * pathLength,
      opacity: interpolate(
        loop.value,
        [0, 0.1, 0.8, 0.93, 1],
        [0, layer.opacity, layer.opacity, layer.opacity * 0.18, 0]
      ),
    };
  });
  const color =
    layer.role === 'vapor'
      ? artStyle.colors.tealFaded
      : layer.role === 'warmth'
        ? artStyle.colors.cream
        : artStyle.colors.goldBright;

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={layer.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${layer.length} ${pathLength + layer.length}`}
      strokeDashoffset={layer.length}
    />
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
  glove: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: GLOVE_W,
    height: GLOVE_H,
    transformOrigin: TIP_ORIGIN,
  },
  contactGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 52,
    height: 52,
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
