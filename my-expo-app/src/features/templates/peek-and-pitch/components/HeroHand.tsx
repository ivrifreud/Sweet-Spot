import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { PEEL_RISE, cornerPeel, peekPull, type FeltPlaneConfig } from '../feltPlane';
import { Chip } from './Chip';
import { CHIP_SIZE } from './ChipStack';

const REST = require('../../../../../assets/tables/hero-glove-rest.png');
const PINCH = require('../../../../../assets/tables/hero-glove-pinch.png');
const LIFT = require('../../../../../assets/tables/hero-glove-lift.png');

const HAND_ASPECT = 0.8444;
/** Pinch tip on the aligned pose canvases — maps onto the near-right card corner. */
const CONTACT = { x: 0.08, y: 0.3684 };

type Point = { x: number; y: number };

type HeroHandProps = {
  contact: Point;
  tableCenter: Point;
  stackAnchor: Point;
  handWidth: number;
  cardHeight: number;
  plane: FeltPlaneConfig;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  commit: SharedValue<number>;
};

/**
 * First-person glove. Rest pose sits on the near corner; pinch then lift
 * follow the card curl so the fingertip never floats off the stock.
 */
export function HeroHand({
  contact,
  tableCenter,
  stackAnchor,
  handWidth,
  cardHeight,
  plane,
  deal,
  peek,
  muck,
  commit,
}: HeroHandProps) {
  const handHeight = handWidth * HAND_ASPECT;
  const left = contact.x - CONTACT.x * handWidth;
  const top = contact.y - CONTACT.y * handHeight;

  const offFrame = { x: handWidth * 0.26, y: handWidth * 0.34 };
  const throwTo = {
    x: (tableCenter.x - contact.x) * 0.48,
    y: (tableCenter.y - contact.y) * 0.46,
  };
  const grabTo = {
    x: stackAnchor.x - contact.x,
    y: stackAnchor.y - contact.y - handWidth * 0.02,
  };
  const tossTo = {
    x: (stackAnchor.x + tableCenter.x) * 0.5 - contact.x,
    y: tableCenter.y - contact.y + handWidth * 0.04,
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
    const grab = interpolate(commit.value, [0, 0.28, 0.46], [0, 1, 0], Extrapolation.CLAMP);
    const toss = interpolate(commit.value, [0.28, 0.55, 0.82], [0, 1, 0], Extrapolation.CLAMP);
    const reaching = interpolate(commit.value, [0, 0.16, 0.86, 1], [0, 1, 1, 0]);

    return {
      transform: [
        {
          translateX:
            offFrame.x * (1 - entry) + throwTo.x * pitch + grabTo.x * grab + tossTo.x * toss,
        },
        {
          translateY:
            2 * (1 - reaching) +
            offFrame.y * (1 - entry) -
            follow * 0.85 +
            throwTo.y * pitch +
            grabTo.y * grab +
            tossTo.y * toss,
        },
        {
          rotate: `${
            (1 - entry) * 10 +
            interpolate(lift, [0, 0.22, 1], [4, -2, -12]) -
            pitch * 14 +
            grab * 10 -
            toss * 18
          }deg`,
        },
        {
          scale: interpolate(lift, [0, 0.45, 1], [1, 1.03, 1.01]) - pitch * 0.05 + reaching * 0.04,
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
      opacity: interpolate(lift, [0.08, 0.28, 0.62, 0.88], [0, 1, 1, 0.15], Extrapolation.CLAMP),
    };
  });

  const liftPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0.48, 0.78], [0, 1], Extrapolation.CLAMP) };
  });

  return (
    <Animated.View
      style={[styles.root, { left, top, width: handWidth, height: handHeight, zIndex: 30 }, motion]}
      pointerEvents="none">
      <Animated.Image source={REST} style={[styles.layer, restPose]} resizeMode="contain" />
      <Animated.Image source={PINCH} style={[styles.layer, pinchPose]} resizeMode="contain" />
      <Animated.Image source={LIFT} style={[styles.layer, liftPose]} resizeMode="contain" />
      <HeldChips commit={commit} />
    </Animated.View>
  );
}

const HELD = [
  { x: 0.04, y: 0.3, rotate: -18, size: 0.82 },
  { x: 0.13, y: 0.24, rotate: 10, size: 0.9 },
  { x: 0.0, y: 0.2, rotate: 22, size: 0.74 },
] as const;

function HeldChips({ commit }: { commit: SharedValue<number> }) {
  const motion = useAnimatedStyle(() => {
    const shown = interpolate(
      commit.value,
      [0.08, 0.2, 0.5, 0.64],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );
    const tuck = interpolate(commit.value, [0.08, 0.22], [10, 0], Extrapolation.CLAMP);
    return {
      opacity: shown,
      transform: [{ translateY: tuck }, { scale: 0.88 + shown * 0.12 }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.held, motion]}>
      {HELD.map((chip, index) => (
        <View
          key={index}
          style={[
            styles.heldChip,
            {
              left: `${chip.x * 100}%`,
              top: `${chip.y * 100}%`,
              zIndex: index + 1,
            },
          ]}>
          <Chip size={CHIP_SIZE * chip.size} rotate={chip.rotate} />
        </View>
      ))}
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
  held: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  heldChip: {
    position: 'absolute',
  },
});
