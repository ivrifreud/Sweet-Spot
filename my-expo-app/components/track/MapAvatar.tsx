import { useEffect, useRef } from 'react';
import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { playSfx } from '../../lib/audio';
import { WALK_FRAME_COUNT, walkFrameIndex } from '../../lib/track/avatarAnimation';
import type { Point } from '../../lib/track/mapPath';

const IDLE_SPRITE = require('../../assets/brand/artstyle/hero-walk/idle-front.png');
const WALK_SPRITES: readonly ImageSourcePropType[] = [
  require('../../assets/brand/artstyle/hero-walk/walk-01.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-02.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-03.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-04.png'),
];

export const MAP_AVATAR_SIZE = 84;
/** Rubber-hose settle: Benny overshoots the chip, then steps back onto it. */
const WALK_OVERSHOOT = 1.08;

type Props = {
  x: number;
  y: number;
  trail?: Point[];
  trailKey?: string | number;
  duration?: number;
  source?: ImageSourcePropType;
  onArrived?: () => void;
};

function pointAlongXY(xs: number[], ys: number[], t: number) {
  'worklet';
  const n = xs.length;
  if (n === 0) return { x: 0, y: 0 };
  if (n === 1 || t <= 0) return { x: xs[0] ?? 0, y: ys[0] ?? 0 };
  const lastX = xs[n - 1] ?? 0;
  const lastY = ys[n - 1] ?? 0;
  if (t >= 1) {
    if (n < 2 || t === 1) return { x: lastX, y: lastY };
    const prevX = xs[n - 2] ?? lastX;
    const prevY = ys[n - 2] ?? lastY;
    const dx = lastX - prevX;
    const dy = lastY - prevY;
    const len = Math.hypot(dx, dy) || 1;
    const extra = Math.min(14, len * 2) * Math.min(1, (t - 1) / 0.08);
    return { x: lastX + (dx / len) * extra, y: lastY + (dy / len) * extra };
  }
  const scaled = t * (n - 1);
  const i = Math.min(Math.floor(scaled), n - 2);
  const f = scaled - i;
  const x0 = xs[i] ?? 0;
  const y0 = ys[i] ?? 0;
  const x1 = xs[i + 1] ?? x0;
  const y1 = ys[i + 1] ?? y0;
  return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f };
}

function directionAlongXY(xs: number[], ys: number[], t: number) {
  'worklet';
  if (xs.length < 2) return 1;
  const clamped = Math.max(0, Math.min(t, 1));
  const before = pointAlongXY(xs, ys, Math.max(0, clamped - 0.012));
  const after = pointAlongXY(xs, ys, Math.min(1, clamped + 0.012));
  return after.x < before.x ? -1 : 1;
}

type WalkFrameProps = {
  index: number;
  moving: SharedValue<number>;
  progress: SharedValue<number>;
  source: ImageSourcePropType;
  totalFrames: SharedValue<number>;
};

function WalkFrame({ index, moving, progress, source, totalFrames }: WalkFrameProps) {
  const visibility = useAnimatedStyle(() => ({
    opacity:
      moving.value === 1 &&
      walkFrameIndex(Math.min(progress.value, 0.999999), totalFrames.value, WALK_FRAME_COUNT) ===
        index
        ? 1
        : 0,
  }));

  return (
    <Animated.View style={[styles.spriteFrame, visibility]}>
      <Image
        source={source}
        style={styles.sprite}
        resizeMode="contain"
        accessible={false}
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

/**
 * Benny's on-screen shoes live in Reanimated shared values, not in the active
 * stage number. A trailKey change queues a walk from the current physical
 * position; level entry waits for `onArrived`.
 */
export function MapAvatar({
  x,
  y,
  trail,
  trailKey,
  duration = 560,
  source = IDLE_SPRITE,
  onArrived,
}: Props) {
  const reducedMotion = useReducedMotion();
  const left = useSharedValue(x);
  const top = useSharedValue(y);
  const progress = useSharedValue(1);
  const usePath = useSharedValue(0);
  const travelFrames = useSharedValue(WALK_FRAME_COUNT);
  const xs = useSharedValue<number[]>([]);
  const ys = useSharedValue<number[]>([]);
  const placed = useRef(false);
  const trailRef = useRef(trail);
  const arrivedRef = useRef(onArrived);
  trailRef.current = trail;
  arrivedRef.current = onArrived;

  useEffect(() => {
    cancelAnimation(left);
    cancelAnimation(top);
    cancelAnimation(progress);

    if (!placed.current) {
      left.value = x;
      top.value = y;
      placed.current = true;
    }

    const currentTrail = trailRef.current;
    const usingTrail = Boolean(currentTrail && currentTrail.length >= 2);

    const notify = () => {
      arrivedRef.current?.();
    };

    if (!usingTrail || !currentTrail) {
      usePath.value = 0;
      return;
    }

    const from = { x: left.value, y: top.value };
    const points =
      Math.hypot(from.x - currentTrail[0]!.x, from.y - currentTrail[0]!.y) > 1.5
        ? [from, ...currentTrail]
        : [...currentTrail];
    const end = points[points.length - 1]!;
    const endX = end.x;
    const endY = end.y;
    xs.value = points.map((point) => point.x);
    ys.value = points.map((point) => point.y);

    if (reducedMotion) {
      left.value = endX;
      top.value = endY;
      usePath.value = 0;
      progress.value = 1;
      notify();
      return;
    }

    usePath.value = 1;
    travelFrames.value = Math.max(WALK_FRAME_COUNT, Math.round(duration / 95));
    progress.value = 0;
    playSfx('step');
    const stepTimer = setInterval(() => playSfx('step'), 240);
    const rush = Math.max(1, Math.round(duration * 0.86));
    const settle = Math.max(1, duration - rush);
    progress.value = withSequence(
      withTiming(WALK_OVERSHOOT, { duration: rush, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: settle, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (!finished) return;
        left.value = endX;
        top.value = endY;
        usePath.value = 0;
        progress.value = 1;
        runOnJS(notify)();
      })
    );
    return () => clearInterval(stepTimer);
  }, [duration, left, progress, reducedMotion, top, trailKey, travelFrames, usePath, xs, ys]);

  const positionStyle = useAnimatedStyle(() => {
    if (usePath.value === 1 && xs.value.length > 0) {
      const point = pointAlongXY(xs.value, ys.value, progress.value);
      return {
        transform: [{ translateX: point.x }, { translateY: point.y }],
      };
    }
    return {
      transform: [{ translateX: left.value }, { translateY: top.value }],
    };
  });

  const facingStyle = useAnimatedStyle(() => {
    const moving = usePath.value === 1;
    const wave = moving ? Math.sin(Math.min(progress.value, 1) * Math.PI * 8) : 0;
    return {
      transform: [
        {
          scaleX:
            (moving ? directionAlongXY(xs.value, ys.value, progress.value) : 1) * (1 - wave * 0.05),
        },
        { scaleY: 1 + wave * 0.08 },
      ],
    };
  });

  const idleVisibility = useAnimatedStyle(() => ({
    opacity: usePath.value === 1 ? 0 : 1,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, positionStyle]}>
      <Animated.View style={[styles.spriteStage, facingStyle]}>
        <Animated.View style={[styles.spriteFrame, idleVisibility]}>
          <Image
            source={source}
            style={styles.sprite}
            resizeMode="contain"
            accessible={false}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
        {WALK_SPRITES.map((walkSource, index) => (
          <WalkFrame
            key={index}
            index={index}
            moving={usePath}
            progress={progress}
            source={walkSource}
            totalFrames={travelFrames}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
    zIndex: 8,
  },
  spriteStage: {
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
  },
  spriteFrame: {
    ...StyleSheet.absoluteFill,
  },
  sprite: {
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
  },
});
