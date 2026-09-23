import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { lazy, Suspense, useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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

import { playSfx } from '../../../../../lib/audio';
import {
  resultClipKind,
  shouldShowResultStamps,
  stampFinaleSfx,
} from '../../../../../lib/equity-scale/resultPresentation';
import { artStyle } from '../../../../../theme/artStyle';
import { REVEAL_HOLD_MS, REVEAL_STAMP_MS } from '../config';
import { EQUITY_STRINGS } from '../strings';
import type { EquityGrade } from '../types';

const ScaleResultClip = lazy(() =>
  import('./ScaleResultClip').then((mod) => ({ default: mod.ScaleResultClip }))
);

type Props = {
  grade: EquityGrade | null;
  onComplete?: () => void;
};

const STAMPS = [
  { key: 'outs', label: EQUITY_STRINGS.stampOuts },
  { key: 'equity', label: EQUITY_STRINGS.stampEquity },
  { key: 'decision', label: EQUITY_STRINGS.stampDecision },
] as const;

const STAMP_HIT = require('../../../../../assets/brand/artstyle/stamp-hit.png');
const STAMP_MISS = require('../../../../../assets/brand/artstyle/stamp-miss.png');

export function StageResultsReveal({ grade, onComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const clipKind = resultClipKind(grade);
  const showClip = clipKind !== null;
  const showResults = Boolean(grade) && shouldShowResultStamps(grade!, true);

  useEffect(() => {
    if (!showResults || !onComplete || showClip) return;
    const timer = setTimeout(onComplete, REVEAL_STAMP_MS * 2 + REVEAL_HOLD_MS);
    return () => clearTimeout(timer);
  }, [onComplete, showClip, showResults]);

  if (!grade) return null;

  const hits = [grade.outsCorrect, grade.equityCorrect, grade.decisionCorrect];

  const stamps = showResults ? (
    <View style={styles.row}>
      {STAMPS.map((stamp, index) => (
        <Stamp
          key={stamp.key}
          label={stamp.label}
          correct={hits[index]!}
          delay={index * REVEAL_STAMP_MS}
          reducedMotion={Boolean(reducedMotion)}
          fontsLoaded={fontsLoaded}
          cue={index === 2 ? stampFinaleSfx(grade) : null}
        />
      ))}
    </View>
  ) : null;

  const body = (
    <View style={styles.stack}>
      {showClip && clipKind ? (
        <Suspense fallback={null}>
          <ScaleResultClip variant={clipKind} />
        </Suspense>
      ) : null}
      {stamps}
    </View>
  );

  if (showClip) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Result. Tap to deal the next hand."
        onPress={onComplete}
        style={styles.overlay}>
        <View pointerEvents="none" style={styles.videoBackdrop} />
        {body}
      </Pressable>
    );
  }

  return (
    <View pointerEvents="none" style={styles.overlay} accessibilityLiveRegion="polite">
      {body}
    </View>
  );
}

function Stamp({
  label,
  correct,
  delay,
  reducedMotion,
  fontsLoaded,
  cue,
}: {
  label: string;
  correct: boolean;
  delay: number;
  reducedMotion: boolean;
  fontsLoaded: boolean;
  cue: 'correctCasinoCoins' | null;
}) {
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    const fire = () => {
      if (correct) playSfx('uiClick');
      if (cue === 'correctCasinoCoins') playSfx('correctCasinoCoins');
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
  }, [correct, cue, delay, progress, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2, 1], [0, 1, 1]),
    transform: [
      { scale: Math.max(progress.value, 0.01) },
      { rotate: `${(1 - Math.min(progress.value, 1)) * -8}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.stamp, style]}>
      <Image
        source={correct ? STAMP_HIT : STAMP_MISS}
        style={styles.stampArt}
        resizeMode="contain"
        accessibilityElementsHidden
      />
      <Text
        style={[styles.stampLabel, fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null]}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
  },
  videoBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: artStyle.colors.projectorBlack,
    opacity: 0.72,
    zIndex: 1,
  },
  stack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 2,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  stamp: {
    width: 104,
    height: 104,
    alignItems: 'center',
  },
  stampArt: {
    width: 104,
    height: 104,
  },
  stampLabel: {
    position: 'absolute',
    top: 10,
    left: 8,
    right: 8,
    color: artStyle.colors.cream,
    fontSize: 16,
    letterSpacing: 1.4,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
