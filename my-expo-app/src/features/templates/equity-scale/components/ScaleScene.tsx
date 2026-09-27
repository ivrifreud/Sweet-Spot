import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';
import { SCALE_ART } from '../tableLayout';
import { panOffset, rotateAboutPoint } from './scaleArmLayout';
import { SCALE_RIG_LAYERS, SCALE_RIG_PIVOTS, SCALE_RIG_RINGS } from './scaleRigLayout.generated';

type Props = {
  /** Hose tilt in degrees, clockwise positive. Driven on the UI thread by the dial. */
  tilt: SharedValue<number>;
  outcome?: DecisionOutcome | null;
  stagesCorrect?: 0 | 1 | 2 | 3 | null;
  width?: number;
  height?: number;
  resetKey?: number;
};

type Box = (typeof SCALE_RIG_LAYERS)[keyof typeof SCALE_RIG_LAYERS];
type Side = 'left' | 'right';

export const SCALE_SCENE = SCALE_ART;

function boxStyle(box: Box, k: number) {
  return { left: box.x * k, top: box.y * k, width: box.w * k, height: box.h * k };
}

function RigImage({ source }: { source: ImageSourcePropType }) {
  return <Image source={source} fadeDuration={0} resizeMode="stretch" style={styles.fill} />;
}

function Hose({ side, tilt, k }: { side: Side; tilt: SharedValue<number>; k: number }) {
  const box = side === 'left' ? SCALE_RIG_LAYERS.hoseLeft : SCALE_RIG_LAYERS.hoseRight;
  const pivot = SCALE_RIG_PIVOTS[side];
  const style = useAnimatedStyle(() => ({
    transform: rotateAboutPoint(box, pivot, tilt.value, k),
  }));
  return (
    <Animated.View style={[styles.layer, boxStyle(box, k), style]}>
      <RigImage source={side === 'left' ? equityScaleArt.scale.hoseLeft : equityScaleArt.scale.hoseRight} />
    </Animated.View>
  );
}

function Pan({ side, tilt, k }: { side: Side; tilt: SharedValue<number>; k: number }) {
  const box = side === 'left' ? SCALE_RIG_LAYERS.panLeft : SCALE_RIG_LAYERS.panRight;
  const pivot = SCALE_RIG_PIVOTS[side];
  const ring = SCALE_RIG_RINGS[side];
  const style = useAnimatedStyle(() => {
    const { dx, dy } = panOffset(ring, pivot, tilt.value, k);
    return { transform: [{ translateX: dx }, { translateY: dy }] };
  });
  return (
    <Animated.View style={[styles.layer, boxStyle(box, k), style]}>
      <RigImage source={side === 'left' ? equityScaleArt.scale.panLeft : equityScaleArt.scale.panRight} />
    </Animated.View>
  );
}

/**
 * Live scale rig: pans hang from the glove rings, hoses swing from the shoulder
 * collars, and the body sits on top so every hose root stays tucked in its collar.
 * Only transforms animate, so nothing mounts or re-renders while the dial turns.
 */
export function ScaleScene({ tilt, width = SCALE_ART.width, height = SCALE_ART.height }: Props) {
  const k = width / SCALE_ART.width;
  return (
    <View
      style={[styles.scene, { width, height }]}
      pointerEvents="none"
      accessibilityLabel="Equity scale">
      <Pan side="left" tilt={tilt} k={k} />
      <Pan side="right" tilt={tilt} k={k} />
      <Hose side="left" tilt={tilt} k={k} />
      <Hose side="right" tilt={tilt} k={k} />
      <View style={[styles.layer, boxStyle(SCALE_RIG_LAYERS.body, k)]}>
        <RigImage source={equityScaleArt.scale.body} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    alignSelf: 'center',
    overflow: 'visible',
  },
  layer: {
    position: 'absolute',
    overflow: 'visible',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});
