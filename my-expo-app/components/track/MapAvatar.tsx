import { useEffect, useRef } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Point } from '../../lib/track/mapPath';

const SPRITE = require('../../assets/brand/artstyle/coach-wave-correct.png');

export const MAP_AVATAR_SIZE = 52;

type Props = {
  x: number;
  y: number;
  trail?: Point[];
  trailKey?: string | number;
  duration?: number;
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

/**
 * Walker sits on the active checkpoint. Motion is replaced (not queued) so a
 * second tap never depends on the previous hop finishing.
 *
 * When `trail` is set, the sprite follows the winding path (Mario overworld).
 * Otherwise it hops in a straight line with a small bounce.
 */
export function MapAvatar({ x, y, trail, trailKey, duration = 560, onArrived }: Props) {
  const reducedMotion = useReducedMotion();
  const left = useSharedValue(x);
  const top = useSharedValue(y);
  const progress = useSharedValue(1);
  const usePath = useSharedValue(0);
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
      if (!placed.current || reducedMotion) {
        placed.current = true;
        progress.value = 1;
        left.value = end.x;
        top.value = end.y;
        return;
      }
      progress.value = 0;
      progress.value = withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(notify)();
      });
      return;
    }

    usePath.value = 0;
    if (!placed.current || reducedMotion) {
      placed.current = true;
      left.value = x;
      top.value = y;
      return;
    }
    left.value = withTiming(x, { duration, easing: Easing.inOut(Easing.cubic) });
    top.value = withSequence(
      withTiming(y - 14, { duration: Math.min(180, duration * 0.32), easing: Easing.out(Easing.quad) }),
      withSpring(y, { damping: 13, stiffness: 170 })
    );
  }, [duration, left, progress, reducedMotion, top, trailKey, usePath, x, xs, y, ys]);

  const style = useAnimatedStyle(() => {
    if (usePath.value === 1 && xs.value.length > 0) {
      const point = pointAlongXY(xs.value, ys.value, progress.value);
      const hop = Math.sin(progress.value * Math.PI) * 14;
      return {
        transform: [{ translateX: point.x }, { translateY: point.y - hop }],
      };
    }
    return {
      transform: [{ translateX: left.value }, { translateY: top.value }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      <Image source={SPRITE} style={styles.sprite} resizeMode="contain" accessibilityIgnoresInvertColors />
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
  sprite: {
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
  },
});
