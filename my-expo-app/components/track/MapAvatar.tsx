import { useEffect, useRef } from 'react';
import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { WALK_FRAME_COUNT, walkFrameIndex } from '../../lib/track/avatarAnimation';
import { playSfx } from '../../lib/audio';
import type { Point } from '../../lib/track/mapPath';

const IDLE_SPRITE = require('../../assets/brand/artstyle/hero-walk/idle-front.png');
const WALK_SPRITES: readonly ImageSourcePropType[] = [
  require('../../assets/brand/artstyle/hero-walk/walk-01.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-02.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-03.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-04.png'),
];

export const MAP_AVATAR_SIZE = 84;

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
  if (t >= 1) return { x: xs[n - 1] ?? 0, y: ys[n - 1] ?? 0 };
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
  const before = pointAlongXY(xs, ys, Math.max(0, t - 0.012));
  const after = pointAlongXY(xs, ys, Math.min(1, t + 0.012));
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
      walkFrameIndex(progress.value, totalFrames.value, WALK_FRAME_COUNT) === index
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
 * Benny sits on the active checkpoint. Motion is replaced (not queued) so a
 * second tap never depends on the previous walk finishing.
 *
 * When `trail` is set, his four-frame cycle follows the winding path. The
 * front-facing idle returns as soon as his shoes reach the checkpoint.
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
    const currentTrail = trailRef.current;
    const usingTrail = Boolean(currentTrail && currentTrail.length >= 2);

    const notify = () => {
      arrivedRef.current?.();
    };

    if (usingTrail && currentTrail) {
      const end = currentTrail[currentTrail.length - 1]!;
      xs.value = currentTrail.map((point) => point.x);
      ys.value = currentTrail.map((point) => point.y);
      usePath.value = 1;
      travelFrames.value = Math.max(WALK_FRAME_COUNT, Math.round(duration / 95));
      if (!placed.current || reducedMotion) {
        const shouldNotify = placed.current && reducedMotion;
        placed.current = true;
        usePath.value = 0;
        progress.value = 1;
        left.value = end.x;
        top.value = end.y;
        if (shouldNotify) notify();
        return;
      }
      progress.value = 0;
      playSfx('step');
      const stepTimer = setInterval(() => playSfx('step'), 240);
      progress.value = withTiming(
        1,
        { duration, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) {
            usePath.value = 0;
            runOnJS(notify)();
          }
        }
      );
      return () => clearInterval(stepTimer);
    }

    usePath.value = 0;
    if (!placed.current || reducedMotion) {
      const shouldNotify = placed.current && reducedMotion;
      placed.current = true;
      left.value = x;
      top.value = y;
      if (shouldNotify) notify();
      return;
    }
    left.value = withTiming(x, { duration, easing: Easing.inOut(Easing.cubic) });
    top.value = withTiming(y, { duration, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(notify)();
    });
  }, [duration, left, progress, reducedMotion, top, trailKey, travelFrames, usePath, x, xs, y, ys]);

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

  const facingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: usePath.value === 1 ? directionAlongXY(xs.value, ys.value, progress.value) : 1,
      },
    ],
  }));

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
    ...StyleSheet.absoluteFillObject,
  },
  sprite: {
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
  },
});
