import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { CARD_ASPECT } from './PlayingCard';
import { projectCardPoint, projectedPinchCorner } from '../cardBendMath';
import type { FeltPlaneConfig } from '../feltPlane';
import { fitGloveToViewport } from './gloveLayout';

const REST = require('../../../../../assets/tables/hero-glove-rest.png');
const PINCH = require('../../../../../assets/tables/hero-glove-pinch.png');
const LIFT = require('../../../../../assets/tables/hero-glove-lift.png');

/** Pinch gap (thumb–index opening) on the aligned 900×760 pose canvases. */
const CONTACT = { x: 0.30, y: 0.44 };

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
 * follow the restored card curl. Chip pitch is owned by the left BarrierHand.
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
    const cardWidth = cardHeight / CARD_ASPECT;
    const corner = projectedPinchCorner(lift, cardWidth, cardHeight);
    const tangentFrom = projectCardPoint(1, 0.9, lift, cardWidth, cardHeight, 1);
    const followX = corner.x - cardWidth;
    const followY = corner.y - cardHeight;
    const tangent =
      Math.atan2(corner.y - tangentFrom.y, corner.x - tangentFrom.x) * (180 / Math.PI) - 90;
    const pitch = interpolate(
      muck.value,
      [0, 0.38, 0.72, 1],
      [0, 1, 0.48, 0.06],
      Extrapolation.CLAMP
    );
    const settle = interpolate(commit.value, [0, 0.2, 0.85, 1], [0, 1, 1, 0], Extrapolation.CLAMP);

    return {
      transform: [
        {
          translateX:
            offFrame.x * (1 - entry) +
            followX +
            throwTo.x * pitch +
            settle * fittedWidth * 0.03,
        },
        {
          translateY:
            offFrame.y * (1 - entry) +
            followY +
            throwTo.y * pitch +
            settle * cardHeight * 0.04,
        },
        {
          rotate: `${
            (1 - entry) * 10 +
            interpolate(lift, [0, 0.22, 1], [4, -2, -5]) +
            tangent * 0.45 -
            pitch * 14 +
            settle * 4
          }deg`,
        },
      ],
    };
  });

  const restPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0, 0.18], [1, 0], Extrapolation.CLAMP) };
  });

  const pinchPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(lift, [0.1, 0.2, 0.58, 0.7], [0, 1, 1, 0], Extrapolation.CLAMP),
    };
  });

  const liftPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0.58, 0.7], [0, 1], Extrapolation.CLAMP) };
  });

  return (
    <Animated.View
      style={[
        styles.root,
        {
          left,
          top,
          width: fittedWidth,
          height: handHeight,
          zIndex: 36,
          transformOrigin: `${CONTACT.x * 100}% ${CONTACT.y * 100}%`,
        },
        motion,
      ]}
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
