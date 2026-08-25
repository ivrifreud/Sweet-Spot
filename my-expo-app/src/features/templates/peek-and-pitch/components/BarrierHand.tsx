import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type { FeltPlaneConfig } from '../feltPlane';

const SHIELD = require('../../../../../assets/tables/hero-glove-rest.png');
const SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

const HAND_ASPECT = 0.8444;
/** After scaleX(-1), the old left fingertip sits on the right of the box. */
const CONTACT = { x: 0.92, y: 0.3684 };

type Point = { x: number; y: number };

type BarrierHandProps = {
  contact: Point;
  handWidth: number;
  plane: FeltPlaneConfig;
  deal: SharedValue<number>;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
};

/**
 * Left glove that cups above and beside the hole cards while peeking,
 * so the lifted faces stay hidden from opponents across the table.
 */
export function BarrierHand({ contact, handWidth, plane, deal, peek, muck }: BarrierHandProps) {
  const handHeight = handWidth * HAND_ASPECT;
  const left = contact.x - CONTACT.x * handWidth;
  const top = contact.y - CONTACT.y * handHeight;
  const hideX = -handWidth * 0.5;
  const hideY = handWidth * 0.22;

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7582/ingest/188086e2-e435-49ea-98d2-b1b490fd324d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '83e178' },
      body: JSON.stringify({
        sessionId: '83e178',
        runId: 'pre-fix',
        hypothesisId: 'D',
        location: 'BarrierHand.tsx:layout',
        message: 'shield glove box',
        data: {
          left,
          top,
          handWidth,
          handHeight,
          contact,
          opacityAtRest: 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [contact, handHeight, handWidth, left, top]);

  const motion = useAnimatedStyle(() => {
    const entry = interpolate(deal.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    const cover = peek.value * (1 - muck.value);
    const sizeX = 0.9 + cover * 0.08;
    const sizeY = 0.84 + cover * 0.12;
    return {
      opacity: interpolate(cover, [0, 0.18], [0, 1], Extrapolation.CLAMP),
      transform: [
        { perspective: plane.perspective },
        {
          translateX:
            interpolate(cover, [0, 0.4, 1], [hideX, hideX * 0.08, handWidth * 0.02]) +
            handWidth * 0.18 * (1 - entry),
        },
        {
          translateY:
            interpolate(cover, [0, 0.34, 1], [hideY, -handWidth * 0.05, -handWidth * 0.03]) +
            handWidth * 0.1 * (1 - entry),
        },
        { rotateX: `${interpolate(cover, [0, 1], [10, 34])}deg` },
        { rotateY: `${interpolate(cover, [0, 1], [8, -14])}deg` },
        { rotate: `${interpolate(cover, [0, 0.5, 1], [-6, -16, -24])}deg` },
        { scaleX: -sizeX },
        { scaleY: sizeY },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const cover = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(cover, [0, 1], [0, 0.34], Extrapolation.CLAMP),
      transform: [{ translateX: handWidth * 0.03 }, { translateY: handWidth * 0.05 }],
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
