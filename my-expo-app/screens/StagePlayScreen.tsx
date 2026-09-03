import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TrackHud } from '../components/track/TrackHud';
import { StreakModal } from '../components/track/StreakModal';
import { formatRegenCountdown, submitStageAnswer, type ChipCount } from '../lib/chip-stack';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import { isAnswerCorrect } from '../lib/calibration/routing';
import { pokerActionForDecision } from '../lib/calibration/presentation';
import { markStreakActivity, toLocalDay } from '../lib/streak';
import { burnChip } from '../lib/track/chips';
import { stageSpots } from '../lib/track/stageSpot';
import { SPOTS_PER_STAGE, nextSpotIndex, recordSpotAttempt } from '../lib/track/tree';
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

export type StagePlayResolved = {
  correct: boolean;
  remainingChips: ChipCount;
  lockedOut: boolean;
  regenAt: string | null;
  stageComplete: boolean;
  spotsCompleted: number;
  streakCurrent?: number;
  streakBest?: number;
};

type Props = {
  reveal: LevelReveal;
  stageNumber: number;
  remainingChips: ChipCount;
  goldBars: number;
  streakDays: number;
  streakBestDays: number;
  initialSpotsCompleted?: number;
  stageProgressId?: string | null;
  onResolved: (update: StagePlayResolved) => void;
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

export function StagePlayScreen({
  reveal,
  stageNumber,
  remainingChips,
  goldBars,
  streakDays,
  streakBestDays,
  initialSpotsCompleted = 0,
  stageProgressId = null,
  onResolved,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const bundle = useMemo(
    () => stageSpots(reveal.placement, stageNumber),
    [reveal.placement, stageNumber]
  );
  const [spotIndex, setSpotIndex] = useState(() => nextSpotIndex(initialSpotsCompleted));
  const [spotsCompleted, setSpotsCompleted] = useState(() =>
    Math.min(SPOTS_PER_STAGE, Math.max(0, initialSpotsCompleted))
  );
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [feedback, setFeedback] = useState<Pending | null>(null);
  const [settled, setSettled] = useState<boolean | null>(null);
  const [stageComplete, setStageComplete] = useState(
    () => initialSpotsCompleted >= SPOTS_PER_STAGE
  );
  const [playError, setPlayError] = useState<string | null>(null);
  const [hudChips, setHudChips] = useState<ChipCount>(remainingChips);
  const [regenAt, setRegenAt] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(remainingChips === 0);
  const [now, setNow] = useState(() => new Date());
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    setHudChips(remainingChips);
    setLockedOut(remainingChips === 0);
  }, [remainingChips]);

  useEffect(() => {
    if (!feedback || hudChips > 0 || !regenAt) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [feedback, hudChips, regenAt]);

  const calibration = bundle.calibration[spotIndex]!;
  const table = bundle.tables[spotIndex]!;

  const handleDecision = useCallback(
    (decision: SpotDecision) => {
      if (busy || feedback) return;
      const chosen = pokerActionForDecision(decision, calibration);
      const live =
        Boolean(stageProgressId) && stageNumber === 1 && calibration.spotType === 'level1_stage1';

      void (async () => {
        setBusy(true);
        setPlayError(null);
        try {
          let correct = isAnswerCorrect(calibration, chosen);
          let nextChips: ChipCount = remainingChips;
          let nextLockedOut = remainingChips === 0;
          let nextRegenAt = regenAt;
          let progress = recordSpotAttempt(spotsCompleted);
          let streakCurrent: number | undefined;
          let streakBest: number | undefined;

          if (live && stageProgressId) {
            const result = await submitStageAnswer({
              stageProgressId,
              spotId: calibration.id,
              chosenAnswer: chosen,
            });
            correct = result.isCorrect;
            nextChips = result.chips;
            nextLockedOut = result.lockedOut;
            nextRegenAt = result.regenAt;
            if (!result.alreadySubmitted) {
              try {
                const streak = await markStreakActivity(toLocalDay());
                streakCurrent = streak.currentStreak;
                streakBest = streak.bestStreak;
              } catch {
                // Do not block answer resolution if streak sync fails.
              }
            }
            if (result.alreadySubmitted) {
              progress = {
                spotsCompleted,
                stageComplete:
                  result.stageStatus === 'completed' || spotsCompleted >= SPOTS_PER_STAGE,
              };
            } else {
              progress = recordSpotAttempt(spotsCompleted);
              if (result.stageStatus === 'completed') {
                progress = { ...progress, stageComplete: true };
              }
            }
          } else if (!correct) {
            nextChips = burnChip(remainingChips) as ChipCount;
            nextLockedOut = nextChips === 0;
          }

          setHudChips(nextChips);
          setLockedOut(nextLockedOut);
          setRegenAt(nextRegenAt);
          onResolved({
            correct,
            remainingChips: nextChips,
            lockedOut: nextLockedOut,
            regenAt: nextRegenAt,
            stageComplete: progress.stageComplete,
            spotsCompleted: progress.spotsCompleted,
            ...(live && stageProgressId
              ? {
                  streakCurrent: typeof streakCurrent === 'number' ? streakCurrent : undefined,
                  streakBest: typeof streakBest === 'number' ? streakBest : undefined,
                }
              : {}),
          });
          setSpotsCompleted(progress.spotsCompleted);
          setStageComplete(progress.stageComplete);

          const lastHand = progress.stageComplete || nextLockedOut;
          const copy = buildDecisionFeedbackCopy({
            correct,
            chosen,
            correctAnswer: calibration.correctAnswer,
            lesson: calibration.prompt,
            continueLabel: lastHand ? 'Back to the tree' : 'Deal me the next hand',
          });
          setSettled(correct);
          setFeedback({
            copy,
            key: `${calibration.id}-${chosen}-${Date.now()}`,
            tempo: tempoForDecision(decision),
          });
        } catch (err) {
          setPlayError(err instanceof Error ? err.message : 'Could not save that hand');
        } finally {
          setBusy(false);
        }
      })();
    },
    [
      busy,
      calibration,
      feedback,
      onResolved,
      remainingChips,
      regenAt,
      spotsCompleted,
      stageNumber,
      stageProgressId,
    ]
  );

  const continueAfterFeedback = useCallback(() => {
    if (!feedback) return;
    setFeedback(null);
    setSettled(null);
    if (stageComplete || lockedOut) {
      onBack();
      return;
    }
    setSpotIndex((index) => nextSpotIndex(index + 1));
    setResetKey((value) => value + 1);
  }, [feedback, lockedOut, onBack, stageComplete]);

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
        <TrackHud
          remainingChips={hudChips}
          goldBars={goldBars}
          streakDays={streakDays}
          onPressStreak={() => setShowStreak(true)}
          onPressBack={() => {
            setResetKey((value) => value + 1);
            onBack();
          }}
        />
      </View>

      <DecisionFeedbackOverlay
        visible={Boolean(feedback)}
        outcome={feedback?.copy.outcome ?? 'correct'}
        title={feedback?.copy.title ?? ''}
        kicker={feedback?.copy.kicker ?? ''}
        explanation={
          settled === false && hudChips <= 0
            ? `${feedback?.copy.explanation ?? ''} Chips are spent. Refills in ${
                regenAt ? formatRegenCountdown(regenAt, now) : '12 hours'
              }.`
            : (feedback?.copy.explanation ?? '')
        }
        continueLabel={feedback?.copy.continueLabel ?? 'Deal me the next hand'}
        feedbackKey={feedback?.key}
        tempo={feedback?.tempo ?? 'default'}
        shakeScreen={false}
        celebrateJackpot={feedback?.copy.outcome === 'correct'}
        onContinue={continueAfterFeedback}
      />

      {playError ? (
        <View style={styles.errorBanner} pointerEvents="none">
          <Text style={styles.errorBannerText}>{playError}</Text>
          <Text style={styles.errorBannerHint}>The hand was not saved. Try again.</Text>
        </View>
      ) : null}

      <StreakModal
        visible={showStreak}
        currentStreak={streakDays}
        bestStreak={streakBestDays}
        onClose={() => setShowStreak(false)}
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
  errorBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 72,
    zIndex: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f87171',
    backgroundColor: 'rgba(90,20,20,0.94)',
    padding: 12,
  },
  errorBannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBannerHint: {
    color: '#fecaca',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
  },
});
