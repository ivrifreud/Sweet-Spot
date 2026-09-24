import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LifeChips } from '../components/track/LifeChips';
import { formatRegenCountdown, submitStageAnswer, type ChipCount } from '../lib/chip-stack';
import { createExclusiveLock } from '../lib/exclusiveLock';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import { isAnswerCorrect } from '../lib/calibration/routing';
import { pokerActionForDecision } from '../lib/calibration/presentation';
import { markPerf } from '../lib/performance/marks';
import {
  canAcceptStageDecision,
  phaseAfterDecision,
  resolveContinueAfterFeedback,
  resolvePostEquityReveal,
  type StagePlayPhase,
} from '../lib/track/stagePlayPhase';
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
import {
  buildEquityFeedbackCopy,
  gradeEquitySubmission,
} from '../src/features/templates/equity-scale';
import type {
  EquityDecision,
  EquityGrade,
  EquityScaleSubmission,
} from '../src/features/templates/equity-scale/types';
import type { SpotDecision } from '../src/features/templates/peek-and-pitch/types';
import { StageTemplateRenderer } from '../src/features/templates/StageTemplateRenderer';
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
  /** GY / calibration bypass: force Equity Scale coach on the first hand. */
  forceTutorial?: boolean;
  onResolved: (update: StagePlayResolved) => void;
  onBack: () => void;
};

type Pending = {
  copy: DecisionFeedbackCopy;
  key: string;
  tempo: FeedbackTempo;
};

function tempoForDecision(decision: SpotDecision | EquityDecision): FeedbackTempo {
  if (decision === 'fold') return 'fold';
  if (decision === 'raise') return 'raise';
  return 'default';
}

export function StagePlayScreen({
  reveal,
  stageNumber,
  remainingChips,
  initialSpotsCompleted = 0,
  stageProgressId = null,
  forceTutorial = false,
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
  const submitLock = useRef(createExclusiveLock());
  const [playPhase, setPlayPhase] = useState<StagePlayPhase>('interactive');
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [feedback, setFeedback] = useState<Pending | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<Pending | null>(null);
  const [equityOutcome, setEquityOutcome] = useState<'correct' | 'incorrect' | null>(null);
  const [equityGrade, setEquityGrade] = useState<EquityGrade | null>(null);
  const [settled, setSettled] = useState<boolean | null>(null);
  const [stageComplete, setStageComplete] = useState(
    () => initialSpotsCompleted >= SPOTS_PER_STAGE
  );
  const [playError, setPlayError] = useState<string | null>(null);
  const [hudChips, setHudChips] = useState<ChipCount>(remainingChips);
  const [regenAt, setRegenAt] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(remainingChips === 0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror authoritative parent state
    setHudChips(remainingChips);
    setLockedOut(remainingChips === 0);
  }, [remainingChips]);

  useEffect(() => {
    if (!feedback || hudChips > 0 || !regenAt) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [feedback, hudChips, regenAt]);

  const item = bundle.items[spotIndex]!;
  const calibration = item.grading;

  const handleDecision = useCallback(
    (decision: SpotDecision | EquityDecision, equity?: EquityScaleSubmission) => {
      if (!canAcceptStageDecision(playPhase, busy) || feedback || pendingFeedback) return;
      if (!submitLock.current.tryAcquire()) return;
      setPlayPhase('submitting');
      markPerf('stage-decision-start');
      const chosen = pokerActionForDecision(decision, calibration);
      const live =
        Boolean(stageProgressId) && stageNumber === 1 && calibration.spotType === 'level1_stage1';

      void (async () => {
        setBusy(true);
        setPlayError(null);
        try {
          let correct = isAnswerCorrect(calibration, chosen);
          let grade: EquityGrade | null = null;
          if (equity && item.templateId === 2) {
            grade = gradeEquitySubmission(item.table, equity);
            correct = grade.decisionCorrect;
          }
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
              answerMetadata: equity
                ? { selectedOuts: equity.selectedOuts, selectedEquity: equity.selectedEquity }
                : undefined,
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
          const nextFeedback = {
            copy:
              grade && item.templateId === 2
                ? buildEquityFeedbackCopy({
                    spot: item.table,
                    grade,
                    continueLabel: lastHand ? 'Back to the tree' : 'Deal me the next hand',
                  })
                : buildDecisionFeedbackCopy({
                    correct,
                    chosen,
                    correctAnswer: calibration.correctAnswer,
                    lesson: calibration.prompt,
                    continueLabel: lastHand ? 'Back to the tree' : 'Deal me the next hand',
                  }),
            key: `${calibration.id}-${chosen}-${Date.now()}`,
            tempo: tempoForDecision(decision),
          };
          setSettled(correct);
          setPlayPhase(phaseAfterDecision(item.templateId));
          if (item.templateId === 2) {
            setPendingFeedback(nextFeedback);
            setEquityGrade(grade);
            setEquityOutcome(grade && grade.decisionCorrect ? 'correct' : 'incorrect');
          } else {
            setFeedback(nextFeedback);
          }
        } catch (err) {
          setPlayError(err instanceof Error ? err.message : 'Could not save that hand');
          setPlayPhase('interactive');
          setResetKey((value) => value + 1);
        } finally {
          submitLock.current.release();
          setBusy(false);
        }
      })();
    },
    [
      busy,
      calibration,
      playPhase,
      feedback,
      item,
      onResolved,
      pendingFeedback,
      remainingChips,
      regenAt,
      spotsCompleted,
      stageNumber,
      stageProgressId,
    ]
  );

  const continueAfterFeedback = useCallback(() => {
    if (!feedback) return;
    const next = resolveContinueAfterFeedback({ stageComplete, lockedOut });
    setPlayPhase('resetting');
    setFeedback(null);
    setPendingFeedback(null);
    setEquityOutcome(null);
    setEquityGrade(null);
    setSettled(null);
    if (next.leaveStage) {
      onBack();
      return;
    }
    markPerf('stage-next-spot');
    setSpotIndex((index) => nextSpotIndex(index + 1));
    setResetKey((value) => value + 1);
    setPlayPhase('interactive');
  }, [feedback, lockedOut, onBack, stageComplete]);

  return (
    <ScreenShakeHost
      outcome={feedback?.copy.outcome ?? null}
      restartKey={feedback?.key}
      tempo={feedback?.tempo ?? 'default'}
      style={styles.root}>
      <StageTemplateRenderer
        item={item}
        outcome={equityOutcome}
        grade={equityGrade}
        onPeekDecision={(decision) => handleDecision(decision)}
        onEquitySubmit={(submission) => handleDecision(submission.decision, submission)}
        onOutcomeAnimationComplete={() => {
          const next = resolvePostEquityReveal({
            grade: equityGrade,
            hasPendingFeedback: Boolean(pendingFeedback),
            stageComplete,
            lockedOut,
          });
          if (!pendingFeedback) return;
          if (!next.showDecisionOverlay) {
            setPendingFeedback(null);
            setEquityOutcome(null);
            setEquityGrade(null);
            setSettled(null);
            if (next.leaveStage) {
              onBack();
              return;
            }
            if (next.advanceSpot) {
              markPerf('stage-next-spot');
              setSpotIndex((index) => nextSpotIndex(index + 1));
              setResetKey((value) => value + 1);
              setPlayPhase('interactive');
            }
            return;
          }
          setPlayPhase('feedback');
          setFeedback(pendingFeedback);
        }}
        disabled={busy || Boolean(feedback)}
        resetKey={resetKey}
        forceTutorial={
          forceTutorial && item.templateId === 2 && spotIndex === nextSpotIndex(initialSpotsCompleted)
        }
      />

      <View
        pointerEvents="none"
        style={[styles.chipHud, { top: insets.top + 10 }]}
        accessibilityLabel="Chip lives">
        <LifeChips remaining={hudChips} size={22} />
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
        celebrateJackpot={feedback?.copy.title === 'SWEET SPOT!'}
        onContinue={continueAfterFeedback}
      />

      {playError ? (
        <View style={styles.errorBanner} pointerEvents="none">
          <Text style={styles.errorBannerText}>{playError}</Text>
          <Text style={styles.errorBannerHint}>The hand was not saved. Try again.</Text>
        </View>
      ) : null}
    </ScreenShakeHost>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  chipHud: {
    position: 'absolute',
    right: 12,
    zIndex: 90,
    elevation: 90,
    minHeight: 38,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'rgba(17,23,20,0.88)',
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
