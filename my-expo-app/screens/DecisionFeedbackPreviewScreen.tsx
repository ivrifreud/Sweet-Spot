import { useMemo, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DecisionFeedbackOverlay,
  buildDecisionFeedbackCopy,
} from '../src/features/decision-feedback';
import { artStyle } from '../theme/artStyle';
import { brand } from '../theme/brand';

type Step = 'correct' | 'incorrect';

type Props = {
  onClose: () => void;
};

/** Dev-only playground so both overlay states can be judged on any table skin. */
export function DecisionFeedbackPreviewScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('correct');

  const copy = useMemo(
    () =>
      buildDecisionFeedbackCopy({
        correct: step === 'correct',
        chosen: step === 'correct' ? 'fold' : 'call',
        correctAnswer: 'fold',
        lesson: 'UTG, 100bb. Folded to you. You hold 72o. Completing here is a leak.',
        continueLabel: step === 'correct' ? 'Show miss' : 'Close preview',
      }),
    [step]
  );

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../assets/themes/bennys-garden/light.png')}
        style={styles.table}
        resizeMode="cover">
        <View style={[styles.hint, { top: insets.top + 12 }]} pointerEvents="none">
          <Text style={styles.hintText}>Decision feedback preview</Text>
        </View>
      </ImageBackground>

      <DecisionFeedbackOverlay
        visible
        outcome={copy.outcome}
        title={copy.title}
        kicker={copy.kicker}
        explanation={copy.explanation}
        continueLabel={copy.continueLabel}
        feedbackKey={step}
        onContinue={() => {
          if (step === 'correct') {
            setStep('incorrect');
            return;
          }
          onClose();
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={[styles.skip, { top: insets.top + 10 }]}
        hitSlop={8}>
        <Text style={styles.skipText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.feltGreen,
  },
  table: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  hintText: {
    color: artStyle.colors.cream,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  skip: {
    position: 'absolute',
    right: 16,
    zIndex: 90,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(8,10,14,0.72)',
  },
  skipText: {
    color: brand.goldBright,
    fontSize: 13,
    fontWeight: '800',
  },
});
