import { useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { tempoScale, type FeedbackTempo } from './tempo';
import type { DecisionOutcome } from './types';

type Props = {
  outcome: DecisionOutcome | null;
  restartKey?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  tempo?: FeedbackTempo;
};

/**
 * Horizontal jolt on both outcomes. A hit also stretches up once, matching
 * the rubber-hose beat: miss = shake, correct = shake + ring upward.
 * Reduced motion skips the transform entirely.
 */
export function ScreenShakeHost({
  outcome,
  restartKey,
  children,
  style,
  pointerEvents,
  tempo = 'default',
}: Props) {
  const reducedMotion = useReducedMotion();
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const pace = tempoScale(tempo);

  useEffect(() => {
    cancelAnimation(shakeX);
    cancelAnimation(shakeY);
    shakeX.value = 0;
    shakeY.value = 0;

    if (!outcome || reducedMotion) {
      return;
    }

    const ampX = outcome === 'correct' ? 6 : 10;
    shakeX.value = withSequence(
      withTiming(ampX, { duration: 45 * pace }),
      withTiming(-ampX, { duration: 55 * pace }),
      withTiming(ampX * 0.5, { duration: 50 * pace }),
      withTiming(0, { duration: 90 * pace, easing: Easing.out(Easing.quad) })
    );

    if (outcome === 'correct') {
      shakeY.value = withSequence(
        withTiming(-10, { duration: 90 * pace, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 180 * pace, easing: Easing.out(Easing.quad) })
      );
    }
  }, [outcome, pace, reducedMotion, restartKey, shakeX, shakeY]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { translateY: shakeY.value }],
  }));

  return (
    <Animated.View
      testID="decision-screen-shake"
      pointerEvents={pointerEvents}
      style={[style, shakeStyle]}>
      {children}
    </Animated.View>
  );
}
