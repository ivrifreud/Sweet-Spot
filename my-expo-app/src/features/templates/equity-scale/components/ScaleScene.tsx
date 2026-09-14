import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';
import { SCALE_ART } from '../tableLayout';

type Props = {
  tilt: number;
  outcome: DecisionOutcome | null;
  stagesCorrect?: 0 | 1 | 2 | 3 | null;
  width?: number;
  height?: number;
};

export const SCALE_SCENE = SCALE_ART;

export function ScaleScene({
  tilt,
  outcome,
  stagesCorrect = null,
  width = SCALE_ART.width,
  height = SCALE_ART.height,
}: Props) {
  const reducedMotion = useReducedMotion();
  const beamAngle = useSharedValue(tilt);
  const outcomeProgress = useSharedValue(0);

  useEffect(() => {
    if (stagesCorrect === 2) {
      beamAngle.value = withTiming(0, {
        duration: reducedMotion ? 120 : 320,
        easing: Easing.out(Easing.cubic),
      });
      outcomeProgress.value = withTiming(1, { duration: reducedMotion ? 180 : 500 });
      return;
    }
    if (outcome === 'correct' || stagesCorrect === 3) {
      beamAngle.value = reducedMotion
        ? 0
        : withSequence(
            withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }),
            withTiming(-6, { duration: 150 }),
            withTiming(4, { duration: 150 }),
            withTiming(0, { duration: 210 })
          );
      outcomeProgress.value = withTiming(1, { duration: reducedMotion ? 180 : 700 });
      return;
    }
    if (outcome === 'incorrect' || stagesCorrect === 0 || stagesCorrect === 1) {
      outcomeProgress.value = withTiming(1, {
        duration: reducedMotion ? 240 : 1500,
        easing: Easing.in(Easing.quad),
      });
      return;
    }
    beamAngle.value = withTiming(tilt, { duration: 100, easing: Easing.out(Easing.quad) });
    outcomeProgress.value = 0;
  }, [beamAngle, outcome, outcomeProgress, reducedMotion, stagesCorrect, tilt]);

  const scaleStyle = useAnimatedStyle(() => {
    const miss = outcome === 'incorrect' || stagesCorrect === 0 || stagesCorrect === 1;
    if (miss) {
      if (reducedMotion) {
        return {
          transform: [{ rotate: `${beamAngle.value}deg` }],
          opacity: interpolate(outcomeProgress.value, [0, 0.6, 1], [1, 1, 0.2]),
        };
      }
      const f = Math.max(0, (outcomeProgress.value - 0.12) / 0.88);
      return {
        transform: [
          { translateY: f * f * 160 },
          { rotate: `${beamAngle.value + f * 10}deg` },
        ],
        opacity: interpolate(f, [0, 0.7, 1], [1, 1, 0]),
      };
    }
    return { transform: [{ rotate: `${beamAngle.value}deg` }], opacity: 1 };
  });

  return (
    <View
      style={[styles.scene, { width, height }]}
      pointerEvents="none"
      accessibilityLabel="Equity scale">
      <Animated.View style={[styles.artWrap, { width, height }, scaleStyle]}>
        <Image source={equityScaleArt.scale} resizeMode="contain" style={styles.art} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    alignSelf: 'center',
    overflow: 'visible',
  },
  artWrap: {
    transformOrigin: '50% 68%',
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
