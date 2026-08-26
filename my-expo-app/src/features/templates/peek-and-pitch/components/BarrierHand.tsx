import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { PEEL_RISE, cornerPeel, peekPull } from '../feltPlane';

const SHIELD = require('../../../../../assets/tables/hero-glove-rest.png');
const SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

const HAND_ASPECT = 0.8444;
/** After scaleX(-1), the old left fingertip sits on the right of the box. */
const CONTACT = { x: 0.92, y: 0.3684 };

type Point = { x: number; y: number };

type BarrierHandProps = {
  contact: Point;
  handWidth: number;
  cardHeight?: number;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
};

/**
 * Left glove on the near-left corner. Visible at rest so the fingers already
 * touch the stock; it cups harder as the peek arch grows.
 */
export function BarrierHand({
  contact,
  handWidth,
  cardHeight = 80,
  deal,
  peek,
  muck,
}: BarrierHandProps) {
  const handHeight = handWidth * HAND_ASPECT;
  const left = contact.x - CONTACT.x * handWidth;
  const top = contact.y - CONTACT.y * handHeight;
  const hideX = -handWidth * 0.5;
  const hideY = handWidth * 0.22;

  const motion = useAnimatedStyle(() => {
    const entry = interpolate(deal.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    const lift = peek.value * (1 - muck.value);
    const pull = peekPull(lift);
    const peel = cornerPeel(0.06, 0.96, pull);
    const follow = peel.rise * cardHeight * PEEL_RISE;
    const size = 0.88 + pull * 0.04;
    return {
      opacity: interpolate(entry, [0.4, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateX: hideX * (1 - entry) - handWidth * 0.06,
        },
        {
          translateY: hideY * (1 - entry) - follow * 0.45 - cardHeight * 0.08,
        },
        { rotate: `${interpolate(pull, [0, 1], [-14, -22])}deg` },
        { scaleX: -size },
        { scaleY: size },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const cover = peek.value * (1 - muck.value);
    const entry = interpolate(deal.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: interpolate(entry, [0.4, 1], [0, 0.28], Extrapolation.CLAMP) *
        interpolate(cover, [0, 1], [0.7, 1], Extrapolation.CLAMP),
      transform: [{ translateX: handWidth * 0.03 }, { translateY: handWidth * 0.04 }],
    };
  });

  return (
    <Animated.View
      style={[styles.root, { left, top, width: handWidth, height: handHeight, zIndex: 22 }, motion]}
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
