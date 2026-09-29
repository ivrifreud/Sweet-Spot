import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MAP_HERO_HOP_MS, MAP_HERO_PIN_SIZE } from '../../lib/hud/mapHeroPin';

/** Canonical map avatar — idle front, no walk cycle. */
const HERO = require('../../assets/brand/artstyle/hero-walk/idle-front.png');

export { MAP_HERO_HOP_MS, MAP_HERO_PIN_SIZE } from '../../lib/hud/mapHeroPin';

type Props = {
  x: number;
  y: number;
  /** Bumps to replay the hop when the player advances. */
  hopKey: number;
  size?: number;
  /** Raises the pin so a progress label above the ring stays clear. */
  lift?: number;
};

/**
 * Full hero sprite pinned on the current node (idle pose only).
 * Transparent — no badge plate behind the character.
 */
export function MapHeroPin({ x, y, hopKey, size = MAP_HERO_PIN_SIZE, lift = 0 }: Props) {
  const reducedMotion = useReducedMotion();
  const hop = useSharedValue(0);
  const squash = useSharedValue(1);

  useEffect(() => {
    if (hopKey <= 0) return;
    if (reducedMotion) {
      hop.value = 0;
      squash.value = 1;
      return;
    }
    hop.value = withSequence(
      withTiming(-4, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(-22, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) })
    );
    squash.value = withSequence(
      withTiming(0.92, { duration: 70 }),
      withTiming(1.08, { duration: 160 }),
      withTiming(1, { duration: 220 })
    );
  }, [hop, hopKey, reducedMotion, squash]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: hop.value },
      { scaleX: squash.value },
      { scaleY: 2 - squash.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          left: x - size / 2,
          top: y - size + 6 - lift,
        },
        style,
      ]}
      accessibilityElementsHidden>
      <Image source={HERO} style={styles.image} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 6,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
