import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { playDecisionSfx } from '../../../lib/audio';
import { artStyle } from '../../../theme/artStyle';
import { brand } from '../../../theme/brand';
import { ScreenShakeHost } from './ScreenShakeHost';
import { tempoScale, type FeedbackTempo } from './tempo';
import type { DecisionOutcome } from './types';

export type { FeedbackTempo } from './tempo';
export { tempoScale } from './tempo';

const CHIP = require('../../../assets/brand/poker-chip-sm.png');
const INK = '#171713';
const CREAM = artStyle.colors.cream;
const CONTINUE_MIN_HEIGHT = Platform.select({ ios: 44, android: 48, default: 48 }) ?? 48;

export type DecisionFeedbackOverlayProps = {
  visible: boolean;
  outcome: DecisionOutcome;
  title: string;
  kicker: string;
  explanation: string;
  continueLabel: string;
  onContinue: () => void;
  /** Remount key so a new decision restarts flash/confetti. */
  feedbackKey?: string;
  /** Play jackpot with the chime (stage-complete / perfect sequence only). */
  celebrateJackpot?: boolean;
  /**
   * Shake this overlay. Set false when a parent `ScreenShakeHost` already
   * jolts the table and overlay together.
   */
  shakeScreen?: boolean;
  /** Fold = snappy; raise = slower so the toss reads. */
  tempo?: FeedbackTempo;
};

/**
 * Shared correct / incorrect overlay. Sit this on top of any template —
 * the table (or any other background) stays visible underneath.
 */
export function DecisionFeedbackOverlay({
  visible,
  outcome,
  title,
  kicker,
  explanation,
  continueLabel,
  onContinue,
  feedbackKey,
  celebrateJackpot = false,
  shakeScreen = true,
  tempo = 'default',
}: DecisionFeedbackOverlayProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const pace = tempoScale(tempo);

  if (!visible) {
    return null;
  }

  return (
    <ScreenShakeHost
      outcome={shakeScreen ? outcome : null}
      restartKey={feedbackKey}
      tempo={tempo}
      style={styles.overlay}
      pointerEvents="auto">
    <View
      testID="decision-feedback-overlay"
      accessibilityViewIsModal
      accessibilityRole="alert"
      accessibilityLabel={`${title}. ${kicker}. ${explanation}`}
      style={StyleSheet.absoluteFill}
      pointerEvents="auto">
      <FlashWash
        outcome={outcome}
        reducedMotion={reducedMotion}
        restartKey={feedbackKey}
        pace={pace}
        celebrateJackpot={celebrateJackpot}
      />

      <View
        style={[
          styles.stage,
          { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}>
        <View style={styles.column}>
          <OutcomeMark
            outcome={outcome}
            reducedMotion={reducedMotion}
            fontsLoaded={fontsLoaded}
            title={title}
            pace={pace}
          />

          <CoachCard
            outcome={outcome}
            kicker={kicker}
            explanation={explanation}
            reducedMotion={reducedMotion}
            pace={pace}
          />

          <Pressable
            testID="decision-feedback-continue"
            accessibilityRole="button"
            accessibilityLabel={continueLabel}
            hitSlop={8}
            onPress={onContinue}
            style={({ pressed }) => [
              styles.continue,
              outcome === 'correct' ? styles.continueCorrect : styles.continueMiss,
              pressed ? styles.continuePressed : null,
              { minHeight: CONTINUE_MIN_HEIGHT },
            ]}>
            <Text
              style={[
                styles.continueText,
                fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
              ]}>
              {continueLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      {outcome === 'correct' && !reducedMotion ? (
        <View pointerEvents="none" style={styles.confettiLayer}>
          <ConfettiBurst restartKey={feedbackKey} pace={pace} />
        </View>
      ) : null}
    </View>
    </ScreenShakeHost>
  );
}

function OutcomeMark({
  outcome,
  reducedMotion,
  fontsLoaded,
  title,
  pace,
}: {
  outcome: DecisionOutcome;
  reducedMotion: boolean | undefined;
  fontsLoaded: boolean;
  title: string;
  pace: number;
}) {
  const pop = useSharedValue(reducedMotion ? 1 : 0.72);

  useEffect(() => {
    cancelAnimation(pop);
    if (reducedMotion) {
      pop.value = 1;
      return;
    }
    pop.value = withSequence(
      withTiming(1.1, { duration: 220 * pace, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 160 * pace, easing: Easing.out(Easing.quad) })
    );
  }, [outcome, pace, pop, reducedMotion]);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { translateY: interpolate(pop.value, [0.72, 1.1], [18, -6]) }],
  }));

  const accent = outcome === 'correct' ? brand.goldBright : artStyle.colors.cream;

  return (
    <Animated.View style={[styles.markWrap, popStyle]}>
      <View
        style={[
          styles.markRing,
          outcome === 'correct' ? styles.markRingCorrect : styles.markRingMiss,
        ]}>
        {outcome === 'correct' ? <CheckIcon /> : <NudgeIcon />}
      </View>
      <Text
        style={[
          styles.title,
          { color: accent },
          fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
        ]}>
        {title}
      </Text>
    </Animated.View>
  );
}

function CoachCard({
  outcome,
  kicker,
  explanation,
  reducedMotion,
  pace,
}: {
  outcome: DecisionOutcome;
  kicker: string;
  explanation: string;
  reducedMotion: boolean | undefined;
  pace: number;
}) {
  const wave = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(wave);
    if (reducedMotion) {
      wave.value = 0;
      return;
    }

    wave.value = withSequence(
      withTiming(1, { duration: 280 * pace, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 320 * pace, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.7, { duration: 260 * pace }),
      withTiming(0, { duration: 280 * pace })
    );
  }, [outcome, pace, reducedMotion, wave]);

  const portraitStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(wave.value, [0, 1], [-4, 10])}deg` },
      { translateY: interpolate(wave.value, [0, 1], [0, -8]) },
    ],
  }));

  const portrait =
    outcome === 'correct' ? artStyle.characters.coachCorrect : artStyle.characters.coachMiss;
  const borderColor = outcome === 'correct' ? artStyle.colors.gold : artStyle.colors.oxblood;

  return (
    <Animated.View style={[styles.card, { borderColor }]}>
      <View style={styles.cardCopy}>
        <Text style={styles.kicker}>{kicker}</Text>
        <ScrollView
          style={styles.explanationScroll}
          contentContainerStyle={styles.explanationContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.explanation}>{explanation}</Text>
        </ScrollView>
      </View>

      <Animated.View style={[styles.portraitWrap, portraitStyle]}>
        <Image
          source={portrait}
          style={styles.portrait}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      </Animated.View>
    </Animated.View>
  );
}

function FlashWash({
  outcome,
  reducedMotion,
  restartKey,
  pace,
  celebrateJackpot,
}: {
  outcome: DecisionOutcome;
  reducedMotion: boolean | undefined;
  restartKey?: string;
  pace: number;
  celebrateJackpot: boolean;
}) {
  const flash = useSharedValue(reducedMotion ? 0.22 : 0);

  useEffect(() => {
    cancelAnimation(flash);
    if (reducedMotion) {
      flash.value = outcome === 'correct' ? 0.5 : 0.28;
      return;
    }
    // Two strong pulses under 3 flashes/sec — louder on a hit, never a strobe.
    flash.value = withSequence(
      withTiming(outcome === 'correct' ? 0.95 : 0.58, {
        duration: 140 * pace,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(outcome === 'correct' ? 0.38 : 0.16, { duration: 230 * pace }),
      withTiming(outcome === 'correct' ? 0.86 : 0.46, { duration: 160 * pace }),
      withTiming(outcome === 'correct' ? 0.52 : 0.28, {
        duration: 480 * pace,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [flash, outcome, pace, reducedMotion, restartKey]);

  useEffect(() => {
    const type =
      outcome === 'correct'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning;
    Haptics.notificationAsync(type).catch(() => {});
    playDecisionSfx(outcome);
  }, [outcome, restartKey]);

  const style = useAnimatedStyle(() => ({ opacity: flash.value }));
  const wash =
    outcome === 'correct' ? artStyle.colors.feltGreen : artStyle.colors.oxblood;

  return (
    <>
      <View
        pointerEvents="none"
        style={[styles.dimmer, outcome === 'correct' ? styles.dimmerCorrect : styles.dimmerMiss]}
      />
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.wash, { backgroundColor: wash }, style]}
      />
    </>
  );
}

type ParticleKind = 'chip' | 'foil' | 'ribbon' | 'pip';

type Particle = {
  id: number;
  originX: number;
  originY: number;
  /** Horizontal throw, in px, across the full flight. */
  vx: number;
  /** Initial vertical throw (negative = up). */
  vy: number;
  /** Extra fall from time² — same gravity language as the falling-chip effect. */
  gravity: number;
  delay: number;
  duration: number;
  size: number;
  kind: ParticleKind;
  spinDir: 1 | -1;
  tilt: number;
  color: string;
};

function buildConfetti(width: number, height: number): Particle[] {
  const kinds: ParticleKind[] = ['chip', 'foil', 'ribbon', 'pip'];
  const palette = [
    artStyle.colors.goldBright,
    artStyle.colors.gold,
    artStyle.colors.cream,
    artStyle.colors.feltGreen,
  ];

  return Array.from({ length: 38 }, (_, id) => {
    const lane = id % 10;
    let originX: number;
    let originY: number;
    let vx: number;
    let vy: number;

    if (lane < 4) {
      originX = 8;
      originY = height * (0.08 + Math.random() * 0.42);
      vx = 90 + Math.random() * 160;
      vy = -(80 + Math.random() * 140);
    } else if (lane < 8) {
      originX = width - 30;
      originY = height * (0.08 + Math.random() * 0.42);
      vx = -(90 + Math.random() * 160);
      vy = -(80 + Math.random() * 140);
    } else {
      originX = width * (0.08 + Math.random() * 0.84);
      originY = 10;
      vx = (Math.random() - 0.5) * 110;
      vy = 8 + Math.random() * 40;
    }

    return {
      id,
      originX,
      originY,
      vx,
      vy,
      gravity: 520 + Math.random() * 260,
      delay: Math.random() * 160,
      duration: 2100 + Math.random() * 700,
      size: 12 + Math.random() * 14,
      kind: kinds[id % kinds.length],
      spinDir: Math.random() > 0.5 ? 1 : -1,
      tilt: (Math.random() - 0.5) * 28,
      color: palette[id % palette.length],
    };
  });
}

function ConfettiBurst({ restartKey, pace }: { restartKey?: string; pace: number }) {
  const { width, height } = useWindowDimensions();
  const particles = useMemo(() => buildConfetti(width, height), [height, restartKey, width]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    setElapsed(0);
    const loop = (now: number) => {
      const wall = now - start;
      setElapsed(wall / pace);
      if (wall < 3200 * pace) {
        frame = requestAnimationFrame(loop);
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [pace, restartKey]);

  return (
    <>
      {particles.map((particle) => (
        <ConfettiPiece key={`${restartKey ?? 'burst'}-${particle.id}`} particle={particle} elapsed={elapsed} />
      ))}
    </>
  );
}

function ConfettiPiece({ particle, elapsed }: { particle: Particle; elapsed: number }) {
  const local = elapsed - particle.delay;
  if (local < 0) {
    return null;
  }

  const t = Math.min(1, local / particle.duration);
  const x = particle.originX + particle.vx * t;
  const y = particle.originY + particle.vy * t + particle.gravity * t * t;
  const opacity = t > 0.82 ? Math.max(0, 1 - (t - 0.82) / 0.18) : 1;
  const rotate = particle.tilt + particle.spinDir * t * 140;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: [{ rotate: `${rotate}deg` }],
      }}>
      <ConfettiShape particle={particle} />
    </View>
  );
}

function ConfettiShape({ particle }: { particle: Particle }) {
  if (particle.kind === 'chip') {
    return (
      <Image
        source={CHIP}
        style={{ width: particle.size + 10, height: particle.size + 10 }}
      />
    );
  }

  if (particle.kind === 'ribbon') {
    return (
      <View
        style={[
          styles.confettiInk,
          {
            width: particle.size * 0.38,
            height: particle.size * 2.1,
            backgroundColor: particle.color,
            borderRadius: 2,
          },
        ]}
      />
    );
  }

  if (particle.kind === 'pip') {
    return (
      <View
        style={[
          styles.confettiInk,
          {
            width: particle.size * 0.85,
            height: particle.size * 0.85,
            backgroundColor: particle.color,
            borderRadius: 2,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.confettiInk,
        {
          width: particle.size * 1.15,
          height: particle.size * 0.62,
          backgroundColor: particle.color,
          borderRadius: 3,
        },
      ]}
    />
  );
}

function CheckIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" accessibilityElementsHidden>
      <Path
        d="M8 18.5 15 25.5 28 11"
        stroke={INK}
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function NudgeIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" accessibilityElementsHidden>
      <Path
        d="M10 18h16M22 12l6 6-6 6"
        stroke={CREAM}
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  dimmerCorrect: {
    backgroundColor: 'rgba(17, 23, 20, 0.22)',
  },
  dimmerMiss: {
    backgroundColor: 'rgba(17, 23, 20, 0.42)',
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
    overflow: 'hidden',
  },
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 3,
  },
  column: {
    width: '100%',
    maxWidth: 430,
    gap: 14,
  },
  markWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  markRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: INK,
  },
  markRingCorrect: {
    backgroundColor: artStyle.colors.feltGreen,
  },
  markRingMiss: {
    backgroundColor: artStyle.colors.oxblood,
  },
  title: {
    marginTop: 8,
    fontSize: 42,
    letterSpacing: 2.4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: CREAM,
    borderWidth: 3,
    borderRadius: 22,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 8,
    minHeight: 132,
    overflow: 'visible',
  },
  cardCopy: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  kicker: {
    color: INK,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  explanationScroll: {
    maxHeight: 92,
  },
  explanationContent: {
    paddingBottom: 2,
  },
  explanation: {
    color: artStyle.colors.tobacco,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  portraitWrap: {
    width: 122,
    height: 150,
    marginTop: -40,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: INK,
    backgroundColor: CREAM,
  },
  portrait: {
    width: '130%',
    height: '130%',
    marginLeft: '-12%',
    marginTop: '-4%',
  },
  continue: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: INK,
    paddingHorizontal: 18,
  },
  continueCorrect: {
    backgroundColor: brand.goldBright,
  },
  continueMiss: {
    backgroundColor: artStyle.colors.gold,
  },
  continuePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  continueText: {
    color: INK,
    fontSize: 22,
    letterSpacing: 1.6,
    paddingVertical: 4,
  },
  confettiInk: {
    borderWidth: 1.5,
    borderColor: INK,
  },
});
