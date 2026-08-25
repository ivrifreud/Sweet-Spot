import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

const SHIELD = require('../../../../../assets/tables/hero-glove-rest.png');
const SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

const HAND_ASPECT = 0.8444;
/** After scaleX(-1), the old left fingertip sits on the right of the box. */
const CONTACT = { x: 0.92, y: 0.3684 };

type Point = { x: number; y: number };

type BarrierHandProps = {
  contact: Point;
  handWidth: number;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
};

/**
 * Left glove that cups the far edge of the hole cards while peeking,
 * so the lifted faces stay hidden from opponents across the table.
 */
export function BarrierHand({ contact, handWidth, deal, peek, muck }: BarrierHandProps) {
  const handHeight = handWidth * HAND_ASPECT;
  const left = contact.x - CONTACT.x * handWidth;
  const top = contact.y - CONTACT.y * handHeight;
  const hideX = -handWidth * 0.42;
  const hideY = handWidth * 0.18;

  const motion = useAnimatedStyle(() => {
    const entry = interpolate(deal.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    const cover = peek.value * (1 - muck.value);
    const size = 0.92 + cover * 0.06;
    return {
      opacity: interpolate(cover, [0, 0.28], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: hideX * (1 - cover) + handWidth * 0.22 * (1 - entry) },
        { translateY: hideY * (1 - cover) + handWidth * 0.12 * (1 - entry) },
        { rotate: `${-12 - cover * 10}deg` },
        { scaleX: -size },
        { scaleY: size },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const cover = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(cover, [0, 1], [0, 0.28], Extrapolation.CLAMP),
      transform: [{ translateX: handWidth * 0.03 }, { translateY: handWidth * 0.04 }],
    };
  });

  return (
    <Animated.View
      style={[styles.root, { left, top, width: handWidth, height: handHeight }, motion]}
      pointerEvents="none">
      <Animated.Image source={SHADOW} style={[styles.layer, shadowStyle]} resizeMode="contain" />
      <Animated.Image source={SHIELD} style={styles.layer} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
