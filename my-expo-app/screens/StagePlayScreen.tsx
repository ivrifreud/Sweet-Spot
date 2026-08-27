import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TrackHud } from '../components/track/TrackHud';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import { isAnswerCorrect } from '../lib/calibration/routing';
import { pokerActionForDecision } from '../lib/calibration/presentation';
import { stageContent } from '../lib/track/stageSpot';
import {
  DecisionFeedbackOverlay,
  ScreenShakeHost,
  buildDecisionFeedbackCopy,
  type DecisionFeedbackCopy,
  type FeedbackTempo,
} from '../src/features/decision-feedback';
import { PeekAndPitchTemplate } from '../src/features/templates/peek-and-pitch';
import type { SpotDecision } from '../src/features/templates/peek-and-pitch/types';
import { artStyle } from '../theme/artStyle';

type Props = {
  reveal: LevelReveal;
  stageNumber: number;
  remainingChips: number;
  goldBars: number;
  streakDays: number;
  onResolved: (correct: boolean) => void;
  onBack: () => void;
};

type Pending = {
  copy: DecisionFeedbackCopy;
  key: string;
  tempo: FeedbackTempo;
};

function tempoForDecision(decision: SpotDecision): FeedbackTempo {
  if (decision === 'fold') return 'fold';
  if (decision === 'raise') return 'raise';
  return 'default';
}

function feedbackRevealMs(decision: SpotDecision): number {
  if (decision === 'fold') return 0;
  if (decision === 'raise') return 920;
  return 220;
}

export function StagePlayScreen({
  reveal,
  stageNumber,
  remainingChips,
  goldBars,
  streakDays,
  onResolved,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const { calibration, table } = useMemo(
    () => stageContent(reveal.placement, stageNumber),
    [reveal.placement, stageNumber]
  );
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [feedback, setFeedback] = useState<Pending | null>(null);
  const [settled, setSettled] = useState<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleDecision = useCallback(
    (decision: SpotDecision) => {
      if (busy || feedback) return;
      setBusy(true);
      const chosen = pokerActionForDecision(decision, calibration);
      const correct = isAnswerCorrect(calibration, chosen);
      const copy = buildDecisionFeedbackCopy({
        correct,
        chosen,
        correctAnswer: calibration.correctAnswer,
        lesson: calibration.prompt,
        continueLabel: 'Back to the tree',
      });
      const pending: Pending = {
        copy,
        key: `${calibration.id}-${chosen}-${Date.now()}`,
        tempo: tempoForDecision(decision),
      };

      const revealOverlay = () => {
        onResolved(correct);
        setSettled(correct);
        setFeedback(pending);
        setBusy(false);
      };

      const delay = feedbackRevealMs(decision);
      if (delay <= 0) {
        revealOverlay();
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(revealOverlay, delay);
    },
    [busy, calibration, feedback, onResolved]
  );

  return (
    <ScreenShakeHost
      outcome={feedback?.copy.outcome ?? null}
      restartKey={feedback?.key}
      tempo={feedback?.tempo ?? 'default'}
      style={styles.root}>
      <PeekAndPitchTemplate
        spot={table}
        onDecision={(decision) => handleDecision(decision)}
        showAuthoringControls={false}
        showNextHandControl={false}
        disabled={busy || Boolean(feedback)}
        resetKey={resetKey}
      />

      <View pointerEvents="box-none" style={[styles.hud, { paddingTop: insets.top + 4 }]}>
        <TrackHud remainingChips={remainingChips} goldBars={goldBars} streakDays={streakDays} />
      </View>

      <Pressable
        onPress={() => {
          if (timer.current) clearTimeout(timer.current);
          setResetKey((value) => value + 1);
          onBack();
        }}
        hitSlop={10}
        style={[styles.back, { top: insets.top + 72 }]}
        accessibilityRole="button"
        accessibilityLabel="Back to the tree">
        <Text style={styles.backText}>Tree</Text>
      </Pressable>

      <DecisionFeedbackOverlay
        visible={Boolean(feedback)}
        outcome={feedback?.copy.outcome ?? 'correct'}
        title={feedback?.copy.title ?? ''}
        kicker={feedback?.copy.kicker ?? ''}
        explanation={
          settled === false && remainingChips <= 0
            ? `${feedback?.copy.explanation ?? ''} Chips are spent — the stage is locked until they refill.`
            : (feedback?.copy.explanation ?? '')
        }
        continueLabel={feedback?.copy.continueLabel ?? 'Back to the tree'}
        feedbackKey={feedback?.key}
        tempo={feedback?.tempo ?? 'default'}
        shakeScreen={false}
        onContinue={onBack}
      />
    </ScreenShakeHost>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  hud: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 40,
  },
  back: {
    position: 'absolute',
    left: 14,
    zIndex: 41,
    minHeight: 44,
    minWidth: 44,
    borderRadius: 999,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(17,23,20,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(200,155,60,0.45)',
  },
  backText: {
    color: artStyle.colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
});
