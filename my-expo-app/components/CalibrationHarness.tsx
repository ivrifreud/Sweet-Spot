import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { signOut } from '../lib/auth';
import { nextCalibrationAction } from '../lib/calibration/flow';
import {
  finalizeSession,
  getOrCreateSession,
  loadCalibrationSpots,
  submitAnswer,
  type FinalizeResult,
  type LoadedSpots,
} from '../lib/calibration/session';
import type { CalibrationSpot, PokerAction, SpotAnswer } from '../lib/calibration/types';

type Props = {
  userId: string;
};

function ActionButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.actionBtn, disabled && styles.actionBtnDisabled]}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

export function CalibrationHarness({ userId }: Props) {
  const [spots, setSpots] = useState<LoadedSpots | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SpotAnswer[]>([]);
  const [current, setCurrent] = useState<CalibrationSpot | null>(null);
  const [result, setResult] = useState<FinalizeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

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
          return;
        }

        setAnswers(session.answers);
        const shouldFinalize = applyAnswers(loaded, session.answers);
        if (shouldFinalize) {
          const placed = await finalizeSession(session.sessionId);
          if (!cancelled) setResult(placed);
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
  }, [applyAnswers, userId]);

  async function onChoose(chosen: PokerAction) {
    if (!spots || !sessionId || !current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const nextAnswers = await submitAnswer({
        sessionId,
        userId,
        spot: current,
        chosen,
        stage1: spots.stage1,
        answersSoFar: answers,
      });
      setAnswers(nextAnswers);
      const shouldFinalize = applyAnswers(spots, nextAnswers);
      if (shouldFinalize) {
        const placed = await finalizeSession(sessionId);
        setResult(placed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save answer');
    } finally {
      setBusy(false);
    }
  }

  const stageLabel =
    current?.spotType === 'calibration_stage1' ? 'Stage 1 · Pre-flop' : 'Stage 2 · Post-flop';
  const progress = current
    ? `${current.sequenceOrder} / 6`
    : result
      ? 'Done'
      : '…';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calibration</Text>
        <Text style={styles.headerMeta}>
          {result ? `Placed · Level ${result.placement}` : `${stageLabel} · ${progress}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {booting ? (
          <ActivityIndicator size="large" color="#111111" />
        ) : result ? (
          <>
            <Text style={styles.kicker}>Your placement</Text>
            <Text style={styles.level}>Level {result.placement}</Text>
            <Text style={styles.bodyText}>Starting Elo {result.startingElo}</Text>
            <Text style={styles.muted}>{result.reason}</Text>
          </>
        ) : current ? (
          <>
            <Text style={styles.kicker}>
              {current.heroPosition} · {progress}
            </Text>
            <Text style={styles.prompt}>{current.prompt}</Text>
            <Text style={styles.cards}>
              Hole {current.holeCards.join('  ')}
              {current.board.length > 0 ? `\nBoard ${current.board.join('  ')}` : ''}
            </Text>
            {current.potSize != null ? (
              <Text style={styles.bodyText}>Pot {current.potSize}bb</Text>
            ) : null}
            <View style={styles.actions}>
              <ActionButton label="Fold" onPress={() => void onChoose('fold')} disabled={busy} />
              <ActionButton label="Call" onPress={() => void onChoose('call')} disabled={busy} />
              <ActionButton label="Raise" onPress={() => void onChoose('raise')} disabled={busy} />
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color="#111111" />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <Pressable onPress={() => void signOut()} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111111',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerMeta: {
    color: '#d4d4d8',
    marginTop: 4,
    fontSize: 14,
  },
  body: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525b',
    textTransform: 'uppercase',
  },
  prompt: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: '#18181b',
  },
  cards: {
    fontSize: 18,
    lineHeight: 26,
    color: '#18181b',
    fontVariant: ['tabular-nums'],
  },
  bodyText: {
    fontSize: 16,
    color: '#27272a',
  },
  muted: {
    fontSize: 14,
    color: '#71717a',
  },
  level: {
    fontSize: 48,
    fontWeight: '800',
    color: '#18181b',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#18181b',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#dc2626',
    fontSize: 15,
    marginTop: 8,
  },
  signOut: {
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#52525b',
    fontSize: 15,
  },
});
