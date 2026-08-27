import { useEffect, useRef } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SPRITE = require('../../assets/brand/artstyle/coach-wave-correct.png');

export const MAP_AVATAR_SIZE = 52;

type Props = {
  x: number;
  y: number;
};

/**
 * Walker sits on the active checkpoint. Motion is replaced (not queued) so a
 * second tap never depends on the previous hop finishing.
 */
export function MapAvatar({ x, y }: Props) {
  const reducedMotion = useReducedMotion();
  const left = useSharedValue(x);
  const top = useSharedValue(y);
  const placed = useRef(false);

  useEffect(() => {
    cancelAnimation(left);
    cancelAnimation(top);
    if (!placed.current || reducedMotion) {
      placed.current = true;
      left.value = x;
      top.value = y;
      return;
    }
    left.value = withTiming(x, { duration: 560, easing: Easing.inOut(Easing.cubic) });
    top.value = withSequence(
      withTiming(y - 14, { duration: 180, easing: Easing.out(Easing.quad) }),
      withSpring(y, { damping: 13, stiffness: 170 })
    );
  }, [left, reducedMotion, top, x, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: left.value }, { translateY: top.value }],
  }));

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
