import { useEffect } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';
import { SCALE_ART } from '../tableLayout';
import { frameBlendOpacity, scaleFramePosition } from './scaleArmLayout';

type Props = {
  tilt: number;
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

export function ScaleScene({ tilt, width = SCALE_ART.width, height = SCALE_ART.height }: Props) {
  const position = useSharedValue(scaleFramePosition(tilt));

  useEffect(() => {
    position.value = withTiming(scaleFramePosition(tilt), { duration: 120 });
  }, [position, tilt]);

  return (
    <View
      style={[styles.scene, { width, height }]}
      pointerEvents="none"
      accessibilityLabel="Equity scale">
      <View style={[styles.layer, { width, height }]}>
        <Image source={equityScaleArt.scale.body} resizeMode="contain" style={styles.art} />
      </View>
      {equityScaleArt.scaleFrames.map((source, index) => (
        <ScaleFrameLayer
          key={index}
          source={source}
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
