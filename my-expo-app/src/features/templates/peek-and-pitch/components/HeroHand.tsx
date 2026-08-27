import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { PEEL_RISE, cornerPeel, peekPull, type FeltPlaneConfig } from '../feltPlane';
import { fitGloveToViewport } from './gloveLayout';

const REST = require('../../../../../assets/tables/hero-glove-rest.png');
const PINCH = require('../../../../../assets/tables/hero-glove-pinch.png');
const LIFT = require('../../../../../assets/tables/hero-glove-lift.png');

/** Pinch tip on the aligned pose canvases — maps onto the near-right card corner. */
const CONTACT = { x: 0.08, y: 0.3684 };

type Point = { x: number; y: number };

type HeroHandProps = {
  contact: Point;
  tableCenter: Point;
  handWidth: number;
  cardHeight: number;
  viewportHeight: number;
  plane: FeltPlaneConfig;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  commit: SharedValue<number>;
};

/**
 * First-person right glove. Rest pose sits on the near corner; pinch then lift
 * follow the card curl. Chip pitch is owned by the left BarrierHand.
 */
export function HeroHand({
  contact,
  tableCenter,
  handWidth,
  cardHeight,
  viewportHeight,
  plane: _plane,
  deal,
  peek,
  muck,
  commit,
}: HeroHandProps) {
  void _plane;
  const frame = fitGloveToViewport(contact, handWidth, viewportHeight, CONTACT);
  const { left, top, width: fittedWidth, height: handHeight } = frame;

  const offFrame = { x: fittedWidth * 0.26, y: fittedWidth * 0.34 };
  const throwTo = {
    x: (tableCenter.x - contact.x) * 0.48,
    y: (tableCenter.y - contact.y) * 0.46,
  };

  const motion = useAnimatedStyle(() => {
    const entry = interpolate(deal.value, [0.4, 1], [0, 1], Extrapolation.CLAMP);
    const lift = peek.value * (1 - muck.value);
    const pull = peekPull(lift);
    const peel = cornerPeel(1, 1, pull);
    const follow = peel.rise * cardHeight * PEEL_RISE;
    const pitch = interpolate(
      muck.value,
      [0, 0.38, 0.72, 1],
      [0, 1, 0.48, 0.06],
      Extrapolation.CLAMP
    );
    // Slight settle while the left hand pitches chips — stay glued to the cards.
    const settle = interpolate(commit.value, [0, 0.2, 0.85, 1], [0, 1, 1, 0], Extrapolation.CLAMP);

    return {
      transform: [
        {
          translateX: offFrame.x * (1 - entry) + throwTo.x * pitch + settle * fittedWidth * 0.03,
        },
        {
          translateY:
            offFrame.y * (1 - entry) - follow * 0.85 + throwTo.y * pitch + settle * cardHeight * 0.04,
        },
        {
          rotate: `${
            (1 - entry) * 10 +
            interpolate(lift, [0, 0.22, 1], [4, -2, -6]) -
            pitch * 14 +
            settle * 4
          }deg`,
        },
        {
          scale: interpolate(lift, [0, 0.45, 1], [1, 1.03, 1.01]) - pitch * 0.05,
        },
      ],
    };
  });

  const restPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0, 0.22], [1, 0], Extrapolation.CLAMP) };
  });

  const pinchPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(lift, [0.08, 0.28], [0, 1], Extrapolation.CLAMP),
    };
  });

  const liftPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0.72, 1], [0, 0.35], Extrapolation.CLAMP) };
  });

  return (
    <Animated.View
      style={[styles.root, { left, top, width: fittedWidth, height: handHeight, zIndex: 30 }, motion]}
      pointerEvents="none">
      <Animated.Image source={REST} style={[styles.layer, restPose]} resizeMode="contain" />
      <Animated.Image source={PINCH} style={[styles.layer, pinchPose]} resizeMode="contain" />
      <Animated.Image source={LIFT} style={[styles.layer, liftPose]} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    overflow: 'visible',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
