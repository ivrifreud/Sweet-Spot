import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { PEEL_RISE, cornerPeel, type FeltPlaneConfig } from '../feltPlane';
import { Chip } from './Chip';
import { CHIP_SIZE } from './ChipStack';

const REST = require('../../../../../assets/tables/hero-glove-rest.png');
const PINCH = require('../../../../../assets/tables/hero-glove-pinch.png');
const LIFT = require('../../../../../assets/tables/hero-glove-lift.png');

const HAND_ASPECT = 0.8444;
/** Shared pinch tip on the aligned pose canvases. */
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
 * First-person glove. Rest → pinch → lift so the fingers close on the near
 * corner, then rise with the peel. Three aligned pose sheets, two visible
 * at a time.
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

  const rest = { x: handWidth * 0.08, y: handWidth * 0.14 };
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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7582/ingest/188086e2-e435-49ea-98d2-b1b490fd324d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '83e178' },
      body: JSON.stringify({
        sessionId: '83e178',
        runId: 'pre-fix',
        hypothesisId: 'D',
        location: 'HeroHand.tsx:layout',
        message: 'peek glove box',
        data: {
          left,
          top,
          handWidth,
          handHeight,
          contact,
          rotateX: plane.nearRotateX * 0.35,
          poses: ['rest', 'pinch', 'lift'],
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [contact, handHeight, handWidth, left, plane.nearRotateX, top]);

  const motion = useAnimatedStyle(() => {
    const entry = interpolate(deal.value, [0.4, 1], [0, 1], Extrapolation.CLAMP);
    const lift = peek.value * (1 - muck.value);
    const peel = cornerPeel(1, 1, lift);
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
        { perspective: plane.perspective },
        { rotateX: `${plane.nearRotateX * 0.35}deg` },
        {
          translateX:
            interpolate(lift, [0, 0.42, 1], [rest.x, rest.x * 0.12, follow * 0.08]) *
              (1 - reaching) +
            offFrame.x * (1 - entry) +
            throwTo.x * pitch +
            grabTo.x * grab +
            tossTo.x * toss,
        },
        {
          translateY:
            interpolate(lift, [0, 0.35, 1], [rest.y, rest.y * 0.28, -follow * 0.72]) *
              (1 - reaching) +
            offFrame.y * (1 - entry) +
            throwTo.y * pitch +
            grabTo.y * grab +
            tossTo.y * toss,
        },
        {
          rotate: `${
            (1 - entry) * 10 +
            interpolate(lift, [0, 0.4, 1], [8, 1, -10]) -
            pitch * 14 +
            grab * 10 -
            toss * 18
          }deg`,
        },
        {
          scale:
            interpolate(lift, [0, 0.45, 1], [0.97, 1.05, 1.02]) - pitch * 0.05 + reaching * 0.04,
        },
      ],
    };
  });

  const restPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0, 0.26], [1, 0], Extrapolation.CLAMP) };
  });

  const pinchPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(lift, [0.1, 0.32, 0.68, 0.92], [0, 1, 1, 0.2], Extrapolation.CLAMP),
    };
  });

  const liftPose = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return { opacity: interpolate(lift, [0.5, 0.82], [0, 1], Extrapolation.CLAMP) };
  });

  return (
    <Animated.View
      style={[styles.root, { left, top, width: handWidth, height: handHeight }, motion]}
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

/** Chips sit in the glove palm while it grabs the stack and flicks toward the pot. */
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
