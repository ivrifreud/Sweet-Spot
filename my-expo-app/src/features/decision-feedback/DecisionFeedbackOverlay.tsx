import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import * as Haptics from 'expo-haptics';
import { VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
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
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playDecisionSfx } from '../../../lib/audio';
import { useReadyVideo } from '../../../lib/video/useReadyVideo';
import { artStyle } from '../../../theme/artStyle';
import { brand } from '../../../theme/brand';
import {
  CHIP_3Q_ASPECT,
  CHIP_FACE_ASPECT,
  CHIP_FELT_SQUASH,
  chipArt,
} from '../../../theme/chipArt';
import { ScreenShakeHost } from './ScreenShakeHost';
import { tempoScale, type FeedbackTempo } from './tempo';
import type { DecisionOutcome } from './types';

export type { FeedbackTempo } from './tempo';
export { tempoScale } from './tempo';

const INK = '#171713';
const CREAM = artStyle.colors.cream;
const MISS_EMOTE = require('../../../assets/brand/artstyle/coach-wave-miss.mp4');
const MISS_POSTER = require('../../../assets/brand/artstyle/coach-wave-miss.png');
const CORRECT_EMOTE = require('../../../assets/brand/artstyle/coach-wave-correct.mp4');
const CORRECT_POSTER = require('../../../assets/brand/artstyle/coach-wave-correct.png');
const POINT_CORRECT = require('../../../assets/brand/artstyle/point-correct.png');
const POINT_MISS = require('../../../assets/brand/artstyle/point-miss.png');

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
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

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
      <Pressable
        testID="decision-feedback-overlay"
        accessibilityViewIsModal
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${kicker}. ${explanation}. Tap anywhere to continue.`}
        accessibilityHint="Tap anywhere on the screen to continue"
        onPress={onContinue}
        style={StyleSheet.absoluteFill}>
        <FlashWash
          outcome={outcome}
          reducedMotion={reducedMotion}
          restartKey={feedbackKey}
          pace={pace}
          celebrateJackpot={celebrateJackpot}
        />

        <View
          pointerEvents="none"
          style={[
            styles.stage,
            { paddingTop: insets.top + 48, paddingBottom: Math.max(insets.bottom, 16) + 8 },
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
              restartKey={feedbackKey}
            />

            <ContinueInbox
              reducedMotion={reducedMotion}
              pace={pace}
              display={display}
              continueLabel={continueLabel}
              outcome={outcome}
            />
          </View>
        </View>

        {outcome === 'correct' && !reducedMotion ? (
          <View pointerEvents="none" style={styles.confettiLayer}>
            <ConfettiBurst restartKey={feedbackKey} pace={pace} />
          </View>
        ) : null}
      </Pressable>
    </ScreenShakeHost>
  );
}

function ContinueInbox({
  reducedMotion,
  pace,
  display,
  continueLabel,
  outcome,
}: {
  reducedMotion: boolean | undefined;
  pace: number;
  display: { fontFamily: string } | null;
  continueLabel: string;
  outcome: DecisionOutcome;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(pulse);
    if (reducedMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 520 * pace, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.92, { duration: 520 * pace, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [pace, pulse, reducedMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View
      testID="decision-feedback-continue"
      style={[
        styles.continueBox,
        {
          borderColor: outcome === 'correct' ? artStyle.colors.gold : artStyle.colors.tobacco,
          backgroundColor: outcome === 'correct' ? artStyle.colors.teal : artStyle.colors.tealFaded,
        },
      ]}>
      <Image
        source={chipArt.threeQuarter}
        style={styles.chipToss}
        resizeMode="contain"
        accessibilityElementsHidden
      />
      <Image
        source={chipArt.face}
        style={styles.chipFelt}
        resizeMode="contain"
        accessibilityElementsHidden
      />
      <Image
        source={chipArt.threeQuarter}
        style={styles.chipLean}
        resizeMode="contain"
        accessibilityElementsHidden
      />
      <Animated.Text style={[styles.tapCue, display, pulseStyle]} maxFontSizeMultiplier={1.2}>
        TAP ANYWHERE
      </Animated.Text>
      <Text style={[styles.dealCue, display]} maxFontSizeMultiplier={1.1} numberOfLines={2}>
        {continueLabel.toUpperCase()}
      </Text>
    </View>
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
    transform: [
      { scale: pop.value },
      { translateY: interpolate(pop.value, [0.72, 1.1], [18, -6]) },
    ],
  }));

  const accent = outcome === 'correct' ? brand.goldBright : artStyle.colors.cream;

  return (
    <Animated.View style={[styles.markWrap, popStyle]}>
      <Image
        source={outcome === 'correct' ? POINT_CORRECT : POINT_MISS}
        style={styles.markArt}
        resizeMode="contain"
        accessibilityElementsHidden
      />
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
  restartKey,
}: {
  outcome: DecisionOutcome;
  kicker: string;
  explanation: string;
  reducedMotion: boolean | undefined;
  restartKey?: string;
}) {
  const playEmoteVideo = !reducedMotion;
  const portrait =
    outcome === 'correct' ? artStyle.characters.coachCorrect : artStyle.characters.coachMiss;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: outcome === 'correct' ? artStyle.colors.gold : artStyle.colors.oxblood,
          backgroundColor: CREAM,
        },
      ]}>
      <View style={styles.cardCopy}>
        <Text style={styles.kicker}>{kicker}</Text>
        <ScrollView
          style={styles.explanationScroll}
          contentContainerStyle={styles.explanationContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.explanation}>{explanation}</Text>
        </ScrollView>
      </View>

      <View style={outcome === 'incorrect' ? styles.portraitWrapMiss : styles.portraitWrap}>
        {playEmoteVideo ? (
          outcome === 'incorrect' ? (
            <MissCoachVideo restartKey={restartKey} />
          ) : (
            <CoachEmoteVideo
              source={CORRECT_EMOTE}
              poster={CORRECT_POSTER}
              restartKey={restartKey}
            />
          )
        ) : (
          <Image
            source={portrait}
            style={styles.portrait}
            resizeMode={outcome === 'incorrect' ? 'contain' : 'cover'}
            accessibilityIgnoresInvertColors
            accessible={false}
          />
        )}
      </View>
    </View>
  );
}

function MissCoachVideo({ restartKey }: { restartKey?: string }) {
  const { player, showPoster, onFirstFrame } = useReadyVideo({
    source: MISS_EMOTE,
    generation: `${restartKey ?? 'emote'}-incorrect`,
    muted: true,
    resolveSeek: (duration) => duration / 2,
  });

  return (
    <View style={styles.portraitFill}>
      {showPoster ? (
        <Image
          source={MISS_POSTER}
          style={styles.portraitFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      ) : null}
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        playsInline
        surfaceType="textureView"
        onFirstFrameRender={onFirstFrame}
        style={styles.portraitFill}
      />
    </View>
  );
}

function CoachEmoteVideo({
  source,
  poster,
  restartKey,
}: {
  source: number;
  poster: number;
  restartKey?: string;
}) {
  const { player, showPoster, onFirstFrame } = useReadyVideo({
    source,
    generation: `${restartKey ?? 'emote'}-correct`,
    muted: true,
    resolveSeek: () => 0,
  });

  return (
    <View style={styles.portraitFill}>
      {showPoster ? (
        <Image
          source={poster}
          style={styles.portraitFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      ) : null}
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        playsInline
        surfaceType="textureView"
        onFirstFrameRender={onFirstFrame}
        style={styles.portraitFill}
      />
    </View>
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
    playDecisionSfx(outcome, restartKey);
  }, [outcome, restartKey]);

  const style = useAnimatedStyle(() => ({ opacity: flash.value }));
  const wash = outcome === 'correct' ? artStyle.colors.feltGreen : artStyle.colors.oxblood;

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
        <ConfettiPiece
          key={`${restartKey ?? 'burst'}-${particle.id}`}
          particle={particle}
          elapsed={elapsed}
        />
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
    const width = particle.size + 10;
    return (
      <Image
        source={chipArt.threeQuarter}
        style={{ width, height: width * CHIP_3Q_ASPECT }}
        accessibilityElementsHidden
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 400,
    elevation: 400,
  },
  wash: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  dimmer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  dimmerCorrect: {
    backgroundColor: 'rgba(17, 23, 20, 0.22)',
  },
  dimmerMiss: {
    backgroundColor: 'rgba(17, 23, 20, 0.42)',
  },
  confettiLayer: {
    ...StyleSheet.absoluteFill,
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
    gap: 12,
  },
  markWrap: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  markArt: {
    width: 58,
    height: 58,
  },
  title: {
    marginTop: 2,
    fontSize: 34,
    letterSpacing: 2.4,
    textAlign: 'center',
    textShadowColor: 'rgba(17,23,20,0.72)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
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
    maxHeight: 72,
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
  portraitWrapMiss: {
    width: 176,
    height: 99,
    marginTop: -12,
    alignSelf: 'center',
    borderRadius: 16,
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
  portraitFill: {
    width: '100%',
    height: '100%',
  },
  continueBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderWidth: 3,
    borderRadius: 20,
    overflow: 'visible',
  },
  tapCue: {
    color: CREAM,
    fontSize: 16,
    letterSpacing: 2.6,
    textAlign: 'center',
  },
  dealCueWrap: {
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealCue: {
    width: '100%',
    color: artStyle.colors.goldBright,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1.25,
    // Hairline ink outline on web (Expo preview + RN web).
    ...({
      WebkitTextStrokeWidth: 0.9,
      WebkitTextStrokeColor: artStyle.colors.projectorBlack,
      paintOrder: 'stroke fill',
    } as Record<string, unknown>),
  },
  chipToss: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    width: 42,
    height: 42 * CHIP_3Q_ASPECT,
    transform: [{ rotate: '-22deg' }],
  },
  chipFelt: {
    position: 'absolute',
    right: 16,
    top: 8,
    width: 30,
    height: 30 * CHIP_FACE_ASPECT * CHIP_FELT_SQUASH,
    transform: [{ rotate: '12deg' }],
  },
  chipLean: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 36,
    height: 36 * CHIP_3Q_ASPECT,
    transform: [{ rotate: '28deg' }],
  },
  confettiInk: {
    borderWidth: 1.5,
    borderColor: INK,
  },
});
