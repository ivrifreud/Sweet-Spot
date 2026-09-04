import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { ChipSprite } from './ChipSprite';
import { CHIP_SIZE } from './ChipStack';
import { fitGloveToViewport } from './gloveLayout';

const SHIELD = require('../../../../../assets/tables/hero-glove-rest.png');
const SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

/** After scaleX(-1), the old left fingertip sits on the right of the box. */
const CONTACT = { x: 0.92, y: 0.3684 };

type Point = { x: number; y: number };

type BarrierHandProps = {
  contact: Point;
  stackAnchor: Point;
  tableCenter: Point;
  handWidth: number;
  chipSize?: number;
  viewportHeight: number;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  commit: SharedValue<number>;
};

/**
 * Left glove stays off-screen at rest and enters from the bottom rail
 * to shield a peek or grab chips. Peek exit retracts down, not sideways.
 */
export function BarrierHand({
  contact,
  stackAnchor,
  tableCenter,
  handWidth,
  chipSize = CHIP_SIZE,
  viewportHeight,
  deal: _deal,
  peek,
  muck,
  commit,
}: BarrierHandProps) {
  void _deal;
  const frame = fitGloveToViewport(contact, handWidth, viewportHeight, CONTACT);
  const { left, top, width: fittedWidth, height: handHeight } = frame;
  const hideX = fittedWidth * 0.04;
  const hideY = viewportHeight - top + handHeight * 0.12;

  const grabTo = {
    x: stackAnchor.x + fittedWidth * 0.18 - contact.x,
    y: stackAnchor.y - contact.y - fittedWidth * 0.06,
  };
  const tossTo = {
    x: (stackAnchor.x + tableCenter.x) * 0.58 - contact.x,
    y: tableCenter.y - contact.y - fittedWidth * 0.02,
  };

  const motion = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    const shield = interpolate(lift, [0, 0.16], [0, 1], Extrapolation.CLAMP);
    const grab = interpolate(commit.value, [0, 0.22, 0.4, 0.52], [0, 1, 1, 0], Extrapolation.CLAMP);
    const toss = interpolate(commit.value, [0.4, 0.62, 0.88], [0, 1, 0], Extrapolation.CLAMP);
    const reaching = interpolate(
      commit.value,
      [0, 0.1, 0.86, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );
    const shown = Math.min(1, shield + reaching);
    const size = 0.9 + reaching * 0.08;

    return {
      opacity: interpolate(shown, [0, 0.18], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateX: hideX * (1 - shown) + grabTo.x * grab + tossTo.x * toss,
        },
        {
          translateY: hideY * (1 - shown) + grabTo.y * grab + tossTo.y * toss,
        },
        {
          rotate: `${-18 + grab * 28 - toss * 36}deg`,
        },
        { scaleX: -size },
        { scaleY: size },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    const shield = interpolate(lift, [0, 0.16], [0, 1], Extrapolation.CLAMP);
    const reaching = interpolate(
      commit.value,
      [0, 0.1, 0.86, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );
    const shown = Math.min(1, shield + reaching);
    return {
      opacity: interpolate(shown, [0, 1], [0, 0.28], Extrapolation.CLAMP),
      transform: [{ translateX: fittedWidth * 0.03 }, { translateY: fittedWidth * 0.04 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.root,
        { left, top, width: fittedWidth, height: handHeight, zIndex: 22 },
        motion,
      ]}
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

function HeldChips({ commit, chipSize }: { commit: SharedValue<number>; chipSize: number }) {
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
          <ChipSprite size={chipSize * chip.size} view="threeQuarter" rotate={chip.rotate} />
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
