import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';
import { SCALE_ART } from '../tableLayout';
import { SCALE_ARM_PIVOTS, rotateAroundPivot, scaleArmPose } from './scaleArmLayout';

type Props = {
  tilt: number;
  outcome: DecisionOutcome | null;
  stagesCorrect?: 0 | 1 | 2 | 3 | null;
  width?: number;
  height?: number;
};

export const SCALE_SCENE = SCALE_ART;

export function ScaleScene({ tilt, width = SCALE_ART.width, height = SCALE_ART.height }: Props) {
  const reducedMotion = useReducedMotion();
  const pose = scaleArmPose(tilt);
  const leftAngle = useSharedValue(pose.leftRotateDeg);
  const rightAngle = useSharedValue(pose.rightRotateDeg);

  useEffect(() => {
    if (reducedMotion) {
      leftAngle.value = pose.leftRotateDeg;
      rightAngle.value = pose.rightRotateDeg;
      return;
    }
    const timing = { duration: 140, easing: Easing.out(Easing.cubic) };
    leftAngle.value = withTiming(pose.leftRotateDeg, timing);
    rightAngle.value = withTiming(pose.rightRotateDeg, timing);
  }, [leftAngle, pose.leftRotateDeg, pose.rightRotateDeg, reducedMotion, rightAngle]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: rotateAroundPivot(leftAngle.value, SCALE_ARM_PIVOTS.left, width, height),
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: rotateAroundPivot(rightAngle.value, SCALE_ARM_PIVOTS.right, width, height),
  }));

  return (
    <View
      style={[styles.scene, { width, height }]}
      pointerEvents="none"
      accessibilityLabel="Equity scale">
      <Animated.View style={[styles.layer, { width, height }, leftStyle]}>
        <Image source={equityScaleArt.scale.leftArm} resizeMode="contain" style={styles.art} />
      </Animated.View>
      <Animated.View style={[styles.layer, { width, height }, rightStyle]}>
        <Image source={equityScaleArt.scale.rightArm} resizeMode="contain" style={styles.art} />
      </Animated.View>
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
