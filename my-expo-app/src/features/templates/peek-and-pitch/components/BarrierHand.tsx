import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { PEEL_RISE, cornerPeel, peekPull } from '../feltPlane';
import { Chip } from './Chip';
import { CHIP_SIZE } from './ChipStack';

const SHIELD = require('../../../../../assets/tables/hero-glove-rest.png');
const SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

const HAND_ASPECT = 0.8444;
/** After scaleX(-1), the old left fingertip sits on the right of the box. */
const CONTACT = { x: 0.92, y: 0.3684 };

type Point = { x: number; y: number };

type BarrierHandProps = {
  contact: Point;
  stackAnchor: Point;
  tableCenter: Point;
  handWidth: number;
  cardHeight?: number;
  chipSize?: number;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  commit: SharedValue<number>;
};

/**
 * Left glove stays off-screen at rest. It enters only to shield a peek
 * or to grab/toss chips on raise (pitch-glove-reach key).
 */
export function BarrierHand({
  contact,
  stackAnchor,
  tableCenter,
  handWidth,
  cardHeight = 80,
  chipSize = CHIP_SIZE,
  deal: _deal,
  peek,
  muck,
  commit,
}: BarrierHandProps) {
  void _deal;
  const handHeight = handWidth * HAND_ASPECT;
  const left = contact.x - CONTACT.x * handWidth;
  const top = contact.y - CONTACT.y * handHeight;
  const hideX = -handWidth * 1.15;
  const hideY = handWidth * 0.2;

  const grabTo = {
    x: stackAnchor.x + handWidth * 0.18 - contact.x,
    y: stackAnchor.y - contact.y - handWidth * 0.06,
  };
  const tossTo = {
    x: (stackAnchor.x + tableCenter.x) * 0.58 - contact.x,
    y: tableCenter.y - contact.y - handWidth * 0.02,
  };

  const motion = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    const pull = peekPull(lift);
    const peel = cornerPeel(0.06, 0.96, pull);
    const follow = peel.rise * cardHeight * PEEL_RISE;
    const shield = interpolate(lift, [0, 0.16], [0, 1], Extrapolation.CLAMP);
    const grab = interpolate(commit.value, [0, 0.22, 0.4, 0.52], [0, 1, 1, 0], Extrapolation.CLAMP);
    const toss = interpolate(commit.value, [0.4, 0.62, 0.88], [0, 1, 0], Extrapolation.CLAMP);
    const reaching = interpolate(commit.value, [0, 0.1, 0.86, 1], [0, 1, 1, 0], Extrapolation.CLAMP);
    const shown = Math.min(1, shield + reaching);
    const size = 0.9 + pull * 0.04 + reaching * 0.08;

    return {
      opacity: interpolate(shown, [0, 0.18], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateX:
            hideX * (1 - shown) + grabTo.x * grab + tossTo.x * toss,
        },
        {
          translateY:
            hideY * (1 - shown) - follow * 0.45 + grabTo.y * grab + tossTo.y * toss,
        },
        {
          rotate: `${
            interpolate(pull, [0, 1], [-14, -22]) + grab * 28 - toss * 36
          }deg`,
        },
        { scaleX: -size },
        { scaleY: size },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    const shield = interpolate(lift, [0, 0.16], [0, 1], Extrapolation.CLAMP);
    const reaching = interpolate(commit.value, [0, 0.1, 0.86, 1], [0, 1, 1, 0], Extrapolation.CLAMP);
    const shown = Math.min(1, shield + reaching);
    return {
      opacity: interpolate(shown, [0, 1], [0, 0.28], Extrapolation.CLAMP),
      transform: [{ translateX: handWidth * 0.03 }, { translateY: handWidth * 0.04 }],
    };
  });

  return (
    <Animated.View
      style={[styles.root, { left, top, width: handWidth, height: handHeight, zIndex: 22 }, motion]}
      pointerEvents="none">
      <Animated.Image source={SHADOW} style={[styles.layer, shadowStyle]} resizeMode="contain" />
      <Animated.Image source={SHIELD} style={styles.layer} resizeMode="contain" />
      <HeldChips commit={commit} chipSize={chipSize} />
    </Animated.View>
  );
}

const HELD = [
  { x: 0.62, y: 0.3, rotate: -10, size: 0.88 },
  { x: 0.7, y: 0.24, rotate: 6, size: 0.94 },
  { x: 0.56, y: 0.22, rotate: 16, size: 0.8 },
];

function HeldChips({
  commit,
  chipSize,
}: {
  commit: SharedValue<number>;
  chipSize: number;
}) {
  const motion = useAnimatedStyle(() => {
    const shown = interpolate(
      commit.value,
      [0.14, 0.26, 0.5, 0.64],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );
    const tuck = interpolate(commit.value, [0.14, 0.28], [10, 0], Extrapolation.CLAMP);
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
          <Chip size={chipSize * chip.size} rotate={chip.rotate} />
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
