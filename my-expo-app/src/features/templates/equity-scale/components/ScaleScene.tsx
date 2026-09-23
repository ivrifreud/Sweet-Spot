/* eslint-disable react-hooks/set-state-in-effect -- Frame window syncs from tilt/reset, then settles after the crossfade. */
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { markPerf } from '../../../../../lib/performance/marks';
import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';
import { SCALE_ART } from '../tableLayout';
import {
  frameBlendOpacity,
  mergeScaleFrameWindow,
  scaleFramePosition,
  scaleFrameWindow,
} from './scaleArmLayout';

type Props = {
  tilt: number;
  outcome: DecisionOutcome | null;
  stagesCorrect?: 0 | 1 | 2 | 3 | null;
  width?: number;
  height?: number;
  resetKey?: number;
};

export const SCALE_SCENE = SCALE_ART;

function ScaleFrameLayer({
  source,
  index,
  position,
  width,
  height,
}: {
  source: ImageSourcePropType;
  index: number;
  position: SharedValue<number>;
  width: number;
  height: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: frameBlendOpacity(position.value, index),
  }));
  return (
    <Animated.View style={[styles.layer, { width, height }, style]}>
      <Image source={source} resizeMode="contain" style={styles.art} />
    </Animated.View>
  );
}

export function ScaleScene({
  tilt,
  width = SCALE_ART.width,
  height = SCALE_ART.height,
  resetKey = 0,
}: Props) {
  const start = scaleFramePosition(tilt);
  const position = useSharedValue(start);
  const [mounted, setMounted] = useState(() => scaleFrameWindow(start));

  useEffect(() => {
    const next = scaleFrameWindow(scaleFramePosition(tilt));
    setMounted((current) => mergeScaleFrameWindow(current, next));
    markPerf(`scale-frame-${resetKey}-${next.join('-')}`);
    cancelAnimation(position);
    position.value = withTiming(scaleFramePosition(tilt), { duration: 120 }, (finished) => {
      if (finished) {
        runOnJS(setMounted)(next);
      }
    });
  }, [position, resetKey, tilt]);

  return (
    <View
      style={[styles.scene, { width, height }]}
      pointerEvents="none"
      accessibilityLabel="Equity scale">
      <View style={[styles.layer, { width, height }]}>
        <Image source={equityScaleArt.scale.body} resizeMode="contain" style={styles.art} />
      </View>
      {mounted.map((index) => (
        <ScaleFrameLayer
          key={index}
          source={equityScaleArt.scaleFrames[index]!}
          index={index}
          position={position}
          width={width}
          height={height}
        />
      ))}
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
    left: 0,
    top: 0,
    overflow: 'visible',
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
