import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import * as Haptics from 'expo-haptics';
import { VideoView } from 'expo-video';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playDecisionSfx } from '../../../lib/audio';
import {
  EXPLANATION_BOX_MAX_HEIGHT,
  FEEDBACK_PASS_THROUGH,
  continueAfterExplanationTouch,
  explanationPointerEvents,
} from '../../../lib/decision-feedback/explanationScroll';
import { useReadyVideo } from '../../../lib/video/useReadyVideo';
import { artStyle } from '../../../theme/artStyle';
import { brand } from '../../../theme/brand';
import {
  CHIP_3Q_ASPECT,
  CHIP_FACE_ASPECT,
  CHIP_FELT_SQUASH,
  chipArt,
} from '../../../theme/chipArt';
import { outcomePointArt, seatResultStamp } from './resultArt';
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
const STAMP_HIT = require('../../../assets/brand/artstyle/stamp-hit.png');
const STAMP_MISS = require('../../../assets/brand/artstyle/stamp-miss.png');
const POINT_ART = {
  'point-correct': POINT_CORRECT,
  'point-miss': POINT_MISS,
} as const;
const STAMP_ART = {
  hit: STAMP_HIT,
  miss: STAMP_MISS,
} as const;

export type FeedbackSeatRow = {
  position: string;
  cards: string;
  stackLabel: string;
  correctAction: string;
  chosenAction: string | null;
  explanation: string;
  missed: boolean;
};

export type DecisionFeedbackOverlayProps = {
  visible: boolean;
  outcome: DecisionOutcome;
  title: string;
  kicker: string;
  explanation: string;
  continueLabel: string;
  rows?: FeedbackSeatRow[];
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
  rows,
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
  const explanationDragged = useRef(false);

  useEffect(() => {
    explanationDragged.current = false;
  }, [explanation, feedbackKey]);

  if (!visible) {
    return null;
  }

  const handleContinue = () => {
    if (
      !continueAfterExplanationTouch({
        overflows: true,
        dragged: explanationDragged.current,
      })
    ) {
      explanationDragged.current = false;
      return;
    }
    onContinue();
  };
  const seatReview = Boolean(rows && rows.length > 0);
  const summary = `${title}. ${kicker}. ${explanation}`;
  const frameStyle = {
    paddingTop: insets.top + 48,
    paddingBottom: Math.max(insets.bottom, 16) + 8,
  };
  const continueInbox = (
    <ContinueInbox
      reducedMotion={reducedMotion}
      pace={pace}
      display={display}
      continueLabel={continueLabel}
      outcome={outcome}
      cue={seatReview ? 'TAP TO CONTINUE' : 'TAP ANYWHERE'}
      onPress={seatReview ? onContinue : undefined}
      accessibilityLabel={
        seatReview ? `${summary}. Scroll the seats, then tap to continue.` : undefined
      }
    />
  );
  const mark = (
    <OutcomeMark
      outcome={outcome}
      reducedMotion={reducedMotion}
      fontsLoaded={fontsLoaded}
      title={title}
      pace={pace}
      prominent={seatReview}
    />
  );

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
        style={StyleSheet.absoluteFill}>
        <FlashWash
          outcome={outcome}
          reducedMotion={reducedMotion}
          restartKey={feedbackKey}
          pace={pace}
          celebrateJackpot={celebrateJackpot}
        />

        {seatReview && rows ? (
          <View style={[styles.reviewFrame, frameStyle]}>
            <ScrollView
              testID="decision-feedback-scroll"
              style={styles.feedbackScroll}
              contentContainerStyle={styles.feedbackScrollContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.column}>
                {mark}
                <SeatRows rows={rows} takeaway={explanation} />
              </View>
            </ScrollView>
            <View style={styles.reviewContinue}>{continueInbox}</View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${summary}. Tap anywhere to continue.`}
            accessibilityHint="Tap anywhere on the screen to continue"
            onPress={handleContinue}
            onTouchStart={() => {
              explanationDragged.current = false;
            }}
            style={[styles.stage, frameStyle]}>
            <View style={styles.column}>
              {mark}
              <CoachCard
                outcome={outcome}
                kicker={kicker}
                explanation={explanation}
                reducedMotion={reducedMotion}
                restartKey={feedbackKey}
                onDragStart={() => {
                  explanationDragged.current = true;
                }}
              />
              {continueInbox}
            </View>
          </Pressable>
        )}

        {outcome === 'correct' && !reducedMotion ? (
          <View pointerEvents="none" style={styles.confettiLayer}>
            <ConfettiBurst restartKey={feedbackKey} pace={pace} />
          </View>
        ) : null}
      </View>
    </ScreenShakeHost>
  );
}

function ContinueInbox({
  reducedMotion,
  pace,
  display,
  continueLabel,
  outcome,
  cue,
  onPress,
  accessibilityLabel,
}: {
  reducedMotion: boolean | undefined;
  pace: number;
  display: { fontFamily: string } | null;
  continueLabel: string;
  outcome: DecisionOutcome;
  cue: string;
  onPress?: () => void;
  accessibilityLabel?: string;
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
  const boxStyle = [
    styles.continueBox,
    outcome === 'correct' ? styles.continueBoxCorrect : styles.continueBoxMiss,
  ];
  const body = (
    <>
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
      <Animated.Text
        style={[styles.tapCue, styles.cueInk, display, pulseStyle]}
        maxFontSizeMultiplier={1.2}>
        {cue}
      </Animated.Text>
      <Text
        style={[styles.dealCue, styles.cueInk, display]}
        maxFontSizeMultiplier={1.1}
        numberOfLines={2}>
        {continueLabel.toUpperCase()}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        testID="decision-feedback-continue"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={boxStyle}>
        {body}
      </Pressable>
    );
  }

  return (
    <View testID="decision-feedback-continue" style={boxStyle}>
      {body}
    </View>
  );
}

function OutcomeMark({
  outcome,
  reducedMotion,
  fontsLoaded,
  title,
  pace,
  prominent = false,
}: {
  outcome: DecisionOutcome;
  reducedMotion: boolean | undefined;
  fontsLoaded: boolean;
  title: string;
  pace: number;
  prominent?: boolean;
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

  const point = outcomePointArt(outcome);
  const accent = outcome === 'correct' ? brand.goldBright : artStyle.colors.cream;

  return (
    <Animated.View pointerEvents="none" style={[styles.markWrap, popStyle]}>
      <Image
        source={POINT_ART[point]}
        style={prominent ? styles.markArtProminent : styles.markArt}
        resizeMode="contain"
        accessibilityLabel={
          point === 'point-correct' ? 'Everything right' : 'One answer wrong'
        }
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
  onDragStart,
}: {
  outcome: DecisionOutcome;
  kicker: string;
  explanation: string;
  reducedMotion: boolean | undefined;
  restartKey?: string;
  onDragStart: () => void;
}) {
  const playEmoteVideo = !reducedMotion;
  const portrait =
    outcome === 'correct' ? artStyle.characters.coachCorrect : artStyle.characters.coachMiss;

  return (
    <View
      pointerEvents={FEEDBACK_PASS_THROUGH}
      style={[
        styles.card,
        {
          borderColor: outcome === 'correct' ? artStyle.colors.gold : artStyle.colors.oxblood,
          backgroundColor: CREAM,
        },
      ]}>
      <View pointerEvents={FEEDBACK_PASS_THROUGH} style={styles.cardCopy}>
        <Text pointerEvents="none" style={styles.kicker}>
          {kicker}
        </Text>
        <ScrollView
          testID="decision-feedback-explanation"
          style={styles.explanationScroll}
          contentContainerStyle={styles.explanationContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          pointerEvents={explanationPointerEvents(true)}
          onScrollBeginDrag={onDragStart}>
          <Text style={styles.explanation}>{explanation}</Text>
        </ScrollView>
      </View>

      <View
        pointerEvents="none"
        style={outcome === 'incorrect' ? styles.portraitWrapMiss : styles.portraitWrap}>
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
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : null)}
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
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : null)}
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

function SeatRows({ rows, takeaway }: { rows: FeedbackSeatRow[]; takeaway: string }) {
  return (
    <View style={styles.seatList}>
      <Text style={styles.explanation}>{takeaway}</Text>
      {rows.map((row) => {
        const stamp = seatResultStamp(row);
        return (
          <View
            key={row.position}
            style={[styles.seatRow, row.missed ? styles.seatRowMissed : styles.seatRowClear]}>
            <View style={styles.seatCopy}>
              <Text style={styles.kicker}>
                {row.position} · {row.cards} · {row.stackLabel}
              </Text>
              <Text style={styles.explanation}>
                {row.correctAction}. {row.explanation}
              </Text>
              {row.missed ? (
                <Text style={styles.missedLabel}>Missed · You went {row.chosenAction}</Text>
              ) : null}
            </View>
            {stamp ? (
              <Image
                source={STAMP_ART[stamp]}
                accessibilityLabel={stamp === 'hit' ? 'Right answer' : 'Wrong answer'}
                resizeMode="contain"
                style={styles.stamp}
              />
            ) : null}
          </View>
        );
      })}
    </View>
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
  feedbackScroll: {
    flex: 1,
    width: '100%',
  },
  feedbackScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  reviewFrame: {
    flex: 1,
    zIndex: 3,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  reviewContinue: {
    width: '100%',
    maxWidth: 430,
    marginTop: 12,
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
  markArtProminent: {
    width: 108,
    height: 112,
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
    maxHeight: EXPLANATION_BOX_MAX_HEIGHT,
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
  seatList: {
    gap: 8,
    width: '100%',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 3,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: CREAM,
  },
  seatCopy: {
    flex: 1,
  },
  stamp: {
    width: 64,
    height: 66,
  },
  seatRowClear: {
    borderColor: artStyle.colors.feltGreen,
  },
  seatRowMissed: {
    borderColor: artStyle.colors.oxblood,
  },
  missedLabel: {
    marginTop: 4,
    color: artStyle.colors.oxblood,
    fontSize: 13,
    fontWeight: '800',
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
  continueBoxCorrect: {
    backgroundColor: artStyle.colors.goldBright,
    borderColor: artStyle.colors.cream,
  },
  continueBoxMiss: {
    backgroundColor: artStyle.colors.gold,
    borderColor: artStyle.colors.tobacco,
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
  cueInk: {
    color: artStyle.colors.projectorBlack,
    textShadowColor: 'transparent',
    ...({
      WebkitTextStrokeWidth: 0,
    } as Record<string, unknown>),
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
