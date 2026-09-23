/* eslint-disable react-hooks/set-state-in-effect -- Live hose window follows the shared position, then stays at the neighbor pair. */
import { useCallback, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';
import { SCALE_ART } from '../tableLayout';
import {
  SCALE_FRAME_COUNT,
  frameBlendOpacity,
  mountedScaleFrames,
  scaleLiveWindow,
} from './scaleArmLayout';

type Props = {
  position: SharedValue<number>;
  initialPosition: number;
  outcome: DecisionOutcome | null;
  stagesCorrect?: 0 | 1 | 2 | 3 | null;
  width?: number;
  height?: number;
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
  position,
  initialPosition,
  width = SCALE_ART.width,
  height = SCALE_ART.height,
}: Props) {
  const [mounted, setMounted] = useState(() => scaleLiveWindow(initialPosition));
  const applyWindow = useCallback((lo: number, hi: number) => {
    const next = mountedScaleFrames(lo, hi);
    setMounted((current) => {
      if (current.length === next.length && current.every((index, i) => index === next[i])) {
        return current;
      }
      return next;
    });
  }, []);
  useAnimatedReaction(
    () => {
      const pos = position.value;
      const last = SCALE_FRAME_COUNT - 1;
      const lo = Math.max(0, Math.min(last, Math.floor(pos)));
      const hi = Math.max(0, Math.min(last, Math.ceil(pos)));
      return lo * 1000 + hi;
    },
    (packed, previous) => {
      if (packed === previous) return;
      runOnJS(applyWindow)(Math.floor(packed / 1000), packed % 1000);
    },
    [applyWindow]
  );

  return (
    <View
      style={[styles.scene, { width, height }]}
      pointerEvents="none"
      accessibilityLabel="Equity scale">
      {mounted.map((index) => {
        const source = equityScaleArt.scaleFrames[index];
        if (source == null) return null;
        return (
          <ScaleFrameLayer
            key={index}
            source={source}
            index={index}
            position={position}
            width={width}
            height={height}
          />
        );
      })}
      <View style={[styles.layer, { width, height }]}>
        <Image source={equityScaleArt.scale.body} resizeMode="contain" style={styles.art} />
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
    left: 0,
    top: 0,
    overflow: 'visible',
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
