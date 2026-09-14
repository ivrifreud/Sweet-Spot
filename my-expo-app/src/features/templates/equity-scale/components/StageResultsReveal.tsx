import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GravityFallingChips } from '../../../../../components/effects';
import { playDecisionSfx, playSfx } from '../../../../../lib/audio';
import { artStyle } from '../../../../../theme/artStyle';
import { REVEAL_STAMP_MS } from '../config';
import { EQUITY_STRINGS } from '../strings';
import type { EquityGrade } from '../types';

type Props = {
  grade: EquityGrade | null;
};

const STAMPS = [
  { key: 'outs', label: EQUITY_STRINGS.stampOuts },
  { key: 'equity', label: EQUITY_STRINGS.stampEquity },
  { key: 'decision', label: EQUITY_STRINGS.stampDecision },
] as const;

export function StageResultsReveal({ grade }: Props) {
  const reducedMotion = useReducedMotion();
  if (!grade) return null;

  const hits = [grade.outsCorrect, grade.equityCorrect, grade.decisionCorrect];

  return (
    <View pointerEvents="none" style={styles.overlay} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        {STAMPS.map((stamp, index) => (
          <Stamp
            key={stamp.key}
            label={stamp.label}
            correct={hits[index]!}
            delay={index * REVEAL_STAMP_MS}
            reducedMotion={Boolean(reducedMotion)}
            jackpot={index === 2 && grade.stagesCorrect === 3}
            finale={index === 2}
            missFinale={index === 2 && grade.stagesCorrect <= 1}
          />
        ))}
      </View>
      {grade.stagesCorrect === 3 ? (
        <GravityFallingChips count={8} minSize={28} baseDuration={2400} zIndex={1} />
      ) : null}
      <Text style={styles.caption}>
        {grade.stagesCorrect === 3
          ? EQUITY_STRINGS.revealPerfect
          : grade.stagesCorrect === 2
            ? EQUITY_STRINGS.revealClose
            : EQUITY_STRINGS.revealMiss}
      </Text>
    </View>
  );
}

function Stamp({
  label,
  correct,
  delay,
  reducedMotion,
  jackpot,
  finale,
  missFinale,
}: {
  label: string;
  correct: boolean;
  delay: number;
  reducedMotion: boolean;
  jackpot: boolean;
  finale: boolean;
  missFinale: boolean;
}) {
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    const fire = () => {
      if (correct) playSfx('uiClick');
      if (jackpot) playSfx('jackpot');
      else if (missFinale) playDecisionSfx('incorrect');
      else if (finale && correct) playDecisionSfx('correct');
    };
    if (reducedMotion) {
      progress.value = 1;
      fire();
      return;
    }
    const timer = setTimeout(fire, delay);
    progress.value = withDelay(
      delay,
      withSequence(
        withTiming(1.12, { duration: 90, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 12, stiffness: 220 })
      )
    );
    return () => clearTimeout(timer);
  }, [correct, delay, finale, jackpot, missFinale, progress, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2, 1], [0, 1, 1]),
    transform: [
      { scale: Math.max(progress.value, 0.01) },
      { rotate: `${(1 - Math.min(progress.value, 1)) * -8}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.stamp, correct ? styles.stampHit : styles.stampMiss, style]}>
      <Text style={styles.stampLabel}>{label}</Text>
      <Text style={styles.stampMark}>{correct ? '✓' : '✕'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 70,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  stamp: {
    minWidth: 88,
    minHeight: 88,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stampHit: {
    backgroundColor: artStyle.colors.feltGreen,
    borderColor: artStyle.colors.goldBright,
  },
  stampMiss: {
    backgroundColor: artStyle.colors.oxblood,
    borderColor: artStyle.colors.cream,
  },
  stampLabel: {
    color: artStyle.colors.cream,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  stampMark: {
    color: artStyle.colors.goldBright,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  caption: {
    marginTop: 14,
    color: artStyle.colors.cream,
    fontSize: 14,
    fontWeight: '800',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowRadius: 4,
    zIndex: 2,
  },
});
