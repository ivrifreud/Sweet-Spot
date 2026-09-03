import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DecisionFeedbackOverlay,
  ScreenShakeHost,
  buildDecisionFeedbackCopy,
  type DecisionFeedbackCopy,
  type FeedbackTempo,
} from '../src/features/decision-feedback';
import { PeekAndPitchTemplate } from '../src/features/templates/peek-and-pitch';
import type { SpotDecision } from '../src/features/templates/peek-and-pitch/types';
import { CalibrationWelcomeScreen } from '../screens/CalibrationWelcomeScreen';
import { LevelRevealScreen } from '../screens/LevelRevealScreen';
import { StagePlayScreen } from '../screens/StagePlayScreen';
import { TrackMapScreen } from '../screens/TrackMapScreen';
import { signOut } from '../lib/auth';
import {
  applyLocalRegen,
  formatRegenCountdown,
  getChipStack,
  type ChipStackState,
} from '../lib/chip-stack';
import { getOrCreateStageProgress, loadStageProgress } from '../lib/track/stageProgress';
import { nextCalibrationAction } from '../lib/calibration/flow';
import { toLevelReveal } from '../lib/calibration/levelReveal';
import { hasSeenPlacement, markPlacementSeen } from '../lib/calibration/placementAck';
import { pokerActionForDecision, toPeekAndPitchSpot } from '../lib/calibration/presentation';
import { isAnswerCorrect, routeCalibration, startingEloForLevel } from '../lib/calibration/routing';
import { STAGE1_SPOTS, STAGE2_SPOTS } from '../lib/calibration/spots';
import {
  finalizeSession,
  getOrCreateSession,
  loadCalibrationSpots,
  submitAnswer,
  type FinalizeResult,
  type LoadedSpots,
} from '../lib/calibration/session';
import type { CalibrationSpot, SpotAnswer } from '../lib/calibration/types';

type Props = {
  userId: string;
  devMode?: boolean;
  onSignOut?: () => void;
};

type PendingFeedback = {
  copy: DecisionFeedbackCopy;
  nextAnswers: SpotAnswer[];
  key: string;
  tempo: FeedbackTempo;
};

function tempoForDecision(decision: SpotDecision): FeedbackTempo {
  if (decision === 'fold') return 'fold';
  if (decision === 'raise') return 'raise';
  return 'default';
}

const FULL_CHIP_STACK: ChipStackState = {
  chips: 3,
  lockedOut: false,
  regenAt: null,
};

async function readChipStack(): Promise<ChipStackState> {
  try {
    return await getChipStack();
  } catch {
    return FULL_CHIP_STACK;
  }
}

/** The Peek and Pitch template waits for toss/muck before calling onDecision. */
function feedbackRevealMs(_decision: SpotDecision): number {
  return 0;
}

export function CalibrationHarness({ userId, devMode = false, onSignOut }: Props) {
  const [spots, setSpots] = useState<LoadedSpots | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SpotAnswer[]>([]);
  const [current, setCurrent] = useState<CalibrationSpot | null>(null);
  const [result, setResult] = useState<FinalizeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [continued, setContinued] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  const [chipStack, setChipStack] = useState<ChipStackState>(FULL_CHIP_STACK);
  const [now, setNow] = useState(() => new Date());
  const [completedCount, setCompletedCount] = useState(0);
  const [playingStage, setPlayingStage] = useState<number | null>(null);
  const [stageProgressId, setStageProgressId] = useState<string | null>(null);
  const [stageSpotsCompleted, setStageSpotsCompleted] = useState(0);
  const [feedback, setFeedback] = useState<PendingFeedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmingRegen = useRef(false);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  const refreshChipStack = useCallback(async () => {
    const stack = await readChipStack();
    setChipStack(stack);
    return stack;
  }, []);

  useEffect(() => {
    if (!chipStack.lockedOut || playingStage != null) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [chipStack.lockedOut, playingStage]);

  useEffect(() => {
    if (!chipStack.lockedOut || !chipStack.regenAt) return;
    if (Date.parse(chipStack.regenAt) > now.getTime()) return;
    setChipStack((current) => applyLocalRegen(current, now));
    if (confirmingRegen.current) return;
    confirmingRegen.current = true;
    void refreshChipStack().finally(() => {
      confirmingRegen.current = false;
    });
  }, [chipStack.lockedOut, chipStack.regenAt, now, refreshChipStack]);

  const applyAnswers = useCallback((loaded: LoadedSpots, nextAnswers: SpotAnswer[]) => {
    const action = nextCalibrationAction(loaded.stage1, loaded.stage2, nextAnswers);
    if (action.type === 'spot') {
      setCurrent(action.spot);
      return false;
    }
    setCurrent(null);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        if (devMode) {
          const loaded = { stage1: STAGE1_SPOTS, stage2: STAGE2_SPOTS };
          if (cancelled) return;
          setSpots(loaded);
          setSessionId('dev-session');
          applyAnswers(loaded, []);
          return;
        }

        const loaded = await loadCalibrationSpots();
        if (loaded.stage1.length === 0 || loaded.stage2.length === 0) {
          throw new Error('Calibration spots are not seeded. Run supabase db push.');
        }
        const session = await getOrCreateSession(userId);
        if (cancelled) return;

        setSpots(loaded);
        setSessionId(session.sessionId);

        if (session.kind === 'placed') {
          setResult({
            placement: session.placement,
            startingElo: session.startingElo,
            reason: 'already_placed',
          });
          const seen = await hasSeenPlacement(userId);
          const stack = await readChipStack();
          const progress = await loadStageProgress(userId, 1);
          if (!cancelled) {
            setContinued(seen);
            setChipStack(stack);
            setCompletedCount(progress.completedCount);
          }
          return;
        }

        setAnswers(session.answers);
        const shouldFinalize = applyAnswers(loaded, session.answers);
        if (shouldFinalize) {
          const placed = await finalizeSession(session.sessionId);
          const seen = await hasSeenPlacement(userId);
          const stack = await readChipStack();
          const progress = await loadStageProgress(userId, 1);
          if (!cancelled) {
            setResult(placed);
            setContinued(seen);
            setChipStack(stack);
            setCompletedCount(progress.completedCount);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to start calibration');
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [applyAnswers, devMode, userId]);

  async function handleSignOut() {
    if (devMode) {
      onSignOut?.();
      return;
    }
    await signOut();
  }

  function skipToTree(placement: 1 | 2 = 1) {
    setResult({
      placement,
      startingElo: startingEloForLevel(placement),
      reason: 'already_placed',
    });
    setCurrent(null);
    setContinued(true);
    setChipStack(FULL_CHIP_STACK);
    setPlayingStage(null);
    setStageProgressId(null);
    setStageSpotsCompleted(0);
    setCompletedCount(0);
  }

  async function openStage(stageNumber: number) {
    setError(null);
    if (devMode || stageNumber !== 1) {
      setStageProgressId(null);
      setStageSpotsCompleted(0);
      setPlayingStage(stageNumber);
      return;
    }

    try {
      const stack = await getChipStack();
      setChipStack(stack);
      if (stack.lockedOut) {
        const copy = stack.regenAt
          ? `Chips are spent. Refills in ${formatRegenCountdown(stack.regenAt)}.`
          : 'Chips are spent. They refill in 12 hours.';
        setError(copy);
        return;
      }
      const row = await getOrCreateStageProgress({
        userId,
        level: 1,
        stageNumber: 1,
      });
      setStageProgressId(row.id);
      setStageSpotsCompleted(row.spotsCompleted);
      setPlayingStage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the stage');
    }
  }

  function leavePlacement() {
    setContinued(true);
    void markPlacementSeen(userId);
  }

  async function onChoose(decision: SpotDecision) {
    if (!spots || !sessionId || !current || busy || feedback) return;
    setBusy(true);
    setError(null);
    try {
      const chosen = pokerActionForDecision(decision, current);
      const copy = buildDecisionFeedbackCopy({
        correct: isAnswerCorrect(current, chosen),
        chosen,
        correctAnswer: current.correctAnswer,
        lesson: current.prompt,
        continueLabel: 'Next hand',
      });

      const nextAnswers = devMode
        ? [
            ...answers.filter((answer) => answer.spotId !== current.id),
            { spotId: current.id, chosen },
          ]
        : await submitAnswer({
            sessionId,
            userId,
            spot: current,
            chosen,
            stage1: spots.stage1,
            answersSoFar: answers,
          });

      setAnswers(nextAnswers);
      const pending: PendingFeedback = {
        copy,
        nextAnswers,
        key: `${current.id}-${chosen}`,
        tempo: tempoForDecision(decision),
      };
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = null;
      }
      const delay = feedbackRevealMs(decision);
      if (delay <= 0) {
        setFeedback(pending);
        setBusy(false);
      } else {
        feedbackTimer.current = setTimeout(() => {
          feedbackTimer.current = null;
          setFeedback(pending);
          setBusy(false);
        }, delay);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save answer');
      setResetKey((value) => value + 1);
      setBusy(false);
    }
  }

  function placeFromAnswers(nextAnswers: SpotAnswer[]) {
    if (!spots) return;
    const stage1Ids = new Set(spots.stage1.map((spot) => spot.id));
    const stage1Answers = nextAnswers.filter((answer) => stage1Ids.has(answer.spotId));
    const stage2Answers = nextAnswers.filter((answer) => !stage1Ids.has(answer.spotId));
    const routed = routeCalibration({
      stage1: { spots: spots.stage1, answers: stage1Answers },
      stage2: { spots: spots.stage2, answers: stage2Answers },
    });
    setResult({
      placement: routed.placement,
      startingElo: routed.startingElo,
      reason: routed.reason,
    });
  }

  function finishFeedback() {
    if (!feedback || !spots) return;
    const pending = feedback;
    setFeedback(null);

    const action = nextCalibrationAction(spots.stage1, spots.stage2, pending.nextAnswers);
    if (action.type === 'spot') {
      setCurrent(action.spot);
      return;
    }

    if (devMode) {
      placeFromAnswers(pending.nextAnswers);
      setCurrent(null);
      return;
    }

    if (!sessionId) return;
    void (async () => {
      setBusy(true);
      try {
        const placed = await finalizeSession(sessionId);
        setResult(placed);
        setCurrent(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not finish calibration');
      } finally {
        setBusy(false);
      }
    })();
  }

  const stageLabel =
    current?.spotType === 'calibration_stage1' ? 'Stage 1 · Pre-flop' : 'Stage 2 · Post-flop';
  const progress = current ? `${current.sequenceOrder} / 6` : result ? 'Done' : '…';
  const tableSpot = useMemo(
    () => (current ? toPeekAndPitchSpot(current, `${stageLabel} · ${progress}`) : null),
    [current, progress, stageLabel]
  );

  if (booting) {
    return (
      <SafeAreaView style={styles.statusScreen}>
        <ActivityIndicator size="large" color="#E6C46A" />
        <Text style={styles.statusText}>Loading calibration…</Text>
      </SafeAreaView>
    );
  }

  if (result) {
    const reveal = toLevelReveal(result);

    if (!continued) {
      return (
        <LevelRevealScreen
          reveal={reveal}
          error={error}
          onContinue={leavePlacement}
          onSignOut={() => void signOut()}
        />
      );
    }

    return (
      <View style={styles.treeStack}>
        <TrackMapScreen
          reveal={reveal}
          remainingChips={chipStack.chips}
          lockMessage={
            chipStack.lockedOut && chipStack.regenAt
              ? `Chips are spent. Refills in ${formatRegenCountdown(chipStack.regenAt, now)}.`
              : chipStack.lockedOut
                ? 'Chips are spent. They refill in 12 hours.'
                : null
          }
          goldBars={0}
          streakDays={0}
          completedCount={completedCount}
          isActive={playingStage == null}
          onPlayStage={(stageNumber) => void openStage(stageNumber)}
          onSignOut={() => void handleSignOut()}
        />
        {error ? (
          <View style={styles.treeError} pointerEvents="none">
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}
        {playingStage != null ? (
          <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
            <StagePlayScreen
              reveal={reveal}
              stageNumber={playingStage}
              remainingChips={chipStack.chips}
              goldBars={0}
              streakDays={0}
              initialSpotsCompleted={stageSpotsCompleted}
              stageProgressId={stageProgressId}
              onResolved={(update) => {
                setChipStack({
                  chips: update.remainingChips,
                  lockedOut: update.lockedOut,
                  regenAt: update.regenAt,
                });
                if (update.stageComplete) {
                  setCompletedCount((count) => Math.max(count, playingStage));
                }
              }}
              onBack={() => {
                setPlayingStage(null);
                setStageProgressId(null);
              }}
            />
          </View>
        ) : null}
      </View>
    );
  }

  if (!current || !tableSpot) {
    return (
      <SafeAreaView style={styles.statusScreen}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <ActivityIndicator size="large" color="#111111" />
        )}
      </SafeAreaView>
    );
  }

  if (!welcomeSeen) {
    return <CalibrationWelcomeScreen onBegin={() => setWelcomeSeen(true)} />;
  }

  return (
    <ScreenShakeHost
      outcome={feedback?.copy.outcome ?? null}
      restartKey={feedback?.key}
      tempo={feedback?.tempo ?? 'default'}
      style={styles.tableScreen}>
      <PeekAndPitchTemplate
        spot={tableSpot}
        onDecision={(decision) => void onChoose(decision)}
        showAuthoringControls={false}
        showNextHandControl={false}
        disabled={busy || Boolean(feedback)}
        resetKey={resetKey}
      />

      <View style={styles.tableControls} pointerEvents="box-none">
        <View style={styles.calibrationPill}>
          <Text style={styles.calibrationPillText}>Calibration</Text>
        </View>
        {devMode ? (
          <Pressable
            onPress={() => skipToTree(1)}
            style={styles.tableSignOut}
            accessibilityRole="button"
            accessibilityLabel="Skip to the level tree">
            <Text style={styles.tableSignOutText}>Skip to tree</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => void handleSignOut()} style={styles.tableSignOut}>
          <Text style={styles.tableSignOutText}>Sign out</Text>
        </Pressable>
      </View>

      {busy && !feedback ? (
        <View style={styles.savingPill} pointerEvents="none">
          <ActivityIndicator size="small" color="#111714" />
          <Text style={styles.savingText}>Saving…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner} pointerEvents="none">
          <Text style={styles.errorBannerText}>{error}</Text>
          <Text style={styles.errorBannerHint}>The hand was reset. Try again.</Text>
        </View>
      ) : null}

      <DecisionFeedbackOverlay
        visible={Boolean(feedback)}
        outcome={feedback?.copy.outcome ?? 'correct'}
        title={feedback?.copy.title ?? ''}
        kicker={feedback?.copy.kicker ?? ''}
        explanation={feedback?.copy.explanation ?? ''}
        continueLabel={feedback?.copy.continueLabel ?? 'Next hand'}
        feedbackKey={feedback?.key}
        tempo={feedback?.tempo ?? 'default'}
        shakeScreen={false}
        onContinue={finishFeedback}
      />
    </ScreenShakeHost>
  );
}

const styles = StyleSheet.create({
  tableScreen: {
    flex: 1,
    backgroundColor: '#111714',
  },
  treeStack: {
    flex: 1,
    backgroundColor: '#111714',
  },
  treeError: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    zIndex: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f87171',
    backgroundColor: 'rgba(90,20,20,0.94)',
    padding: 12,
  },
  statusScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#111714',
  },
  statusText: {
    color: '#E8D7A7',
    fontSize: 16,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E6C46A',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bodyText: {
    fontSize: 16,
    color: '#E8D7A7',
  },
  muted: {
    fontSize: 14,
    color: 'rgba(232,215,167,0.65)',
  },
  level: {
    fontSize: 48,
    fontWeight: '800',
    color: '#E6C46A',
  },
  error: {
    color: '#fca5a5',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  signOut: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  signOutText: {
    color: '#E8D7A7',
    fontSize: 15,
  },
  tableControls: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 60,
    elevation: 60,
  },
  calibrationPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.55)',
    backgroundColor: 'rgba(8,10,14,0.76)',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  calibrationPillText: {
    color: '#E6C46A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tableSignOut: {
    borderRadius: 999,
    backgroundColor: 'rgba(8,10,14,0.76)',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  tableSignOutText: {
    color: 'rgba(232,215,167,0.82)',
    fontSize: 12,
    fontWeight: '700',
  },
  savingPill: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: '#E6C46A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    transform: [{ translateX: -54 }, { translateY: -20 }],
  },
  savingText: {
    color: '#111714',
    fontSize: 13,
    fontWeight: '800',
  },
  errorBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 72,
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
