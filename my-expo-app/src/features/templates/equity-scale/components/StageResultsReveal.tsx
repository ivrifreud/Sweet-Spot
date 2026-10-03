import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { continueAfterExplanationTouch } from '../../../../../lib/decision-feedback/explanationScroll';
import {
  equityClipResultFrame,
  SCALE_RESULT_STAMP_GAP,
  type ScaleResultLesson,
} from '../../../../../lib/equity-scale/resultLayout';
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
  lesson?: ScaleResultLesson | null;
  onComplete?: () => void;
};

const STAMPS = [
  { key: 'outs', label: EQUITY_STRINGS.stampOuts },
  { key: 'equity', label: EQUITY_STRINGS.stampEquity },
  { key: 'decision', label: EQUITY_STRINGS.stampDecision },
] as const;

const STAMP_HIT = require('../../../../../assets/brand/artstyle/stamp-hit.png');
const STAMP_MISS = require('../../../../../assets/brand/artstyle/stamp-miss.png');

/** A player failure stays on the stamps. The root boundary would replace the whole app. */
class ResultClipBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function StageResultsReveal({ grade, lesson = null, onComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const lessonDragged = useRef(false);
  const press = useSharedValue(0);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.04 }],
  }));
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const [clipDown, setClipDown] = useState(false);
  const clipKind = resultClipKind(grade);
  const showClip = clipKind !== null && !clipDown;
  const showResults = Boolean(grade) && shouldShowResultStamps(grade!, true);

  useEffect(() => {
    if (!showResults || !onComplete || showClip) return;
    const timer = setTimeout(onComplete, REVEAL_STAMP_MS * 2 + REVEAL_HOLD_MS);
    return () => clearTimeout(timer);
  }, [onComplete, showClip, showResults]);

  if (!grade) return null;

  const frame = equityClipResultFrame({
    width: windowWidth,
    height: windowHeight,
    topInset: insets.top,
    bottomInset: insets.bottom,
  });
  const hits = [grade.outsCorrect, grade.equityCorrect, grade.decisionCorrect];
  const finish = () => {
    if (
      !continueAfterExplanationTouch({
        overflows: true,
        dragged: lessonDragged.current,
      })
    ) {
      lessonDragged.current = false;
      return;
    }
    onComplete?.();
  };

  const stamps = showResults ? (
    <View style={styles.row}>
      {STAMPS.map((stamp, index) => (
        <Stamp
          key={stamp.key}
          label={stamp.label}
          correct={hits[index]!}
          delay={index * REVEAL_STAMP_MS}
          reducedMotion={Boolean(reducedMotion)}
          size={showClip ? frame.stampSize : 104}
          fontsLoaded={fontsLoaded}
          cue={index === 2 ? stampFinaleSfx(grade) : null}
        />
      ))}
    </View>
  ) : null;

  const clipLayer =
    showClip && clipKind ? (
      <ResultClipBoundary onError={() => setClipDown(true)}>
        <Suspense fallback={null}>
          <ScaleResultClip
            variant={clipKind}
            width={frame.videoWidth}
            onUnavailable={() => setClipDown(true)}
          />
        </Suspense>
      </ResultClipBoundary>
    ) : null;

  if (showClip) {
    const lessonLabel = lesson
      ? `${lesson.kicker}. ${lesson.explanation}. ${lesson.continueLabel}`
      : 'Result. Tap to deal the next hand.';
    return (
      <View style={styles.overlay}>
        <View pointerEvents="none" style={styles.videoBackdrop} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lessonLabel}
          onTouchStart={() => {
            lessonDragged.current = false;
          }}
          onPressIn={() => {
            press.value = withTiming(1, { duration: 100 });
          }}
          onPressOut={() => {
            press.value = withTiming(0, { duration: 100 });
          }}
          onPress={finish}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="box-none"
          style={[
            styles.phoneColumn,
            {
              paddingTop: insets.top + 56,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            },
          ]}>
          <Animated.View pointerEvents="none" style={[styles.clipGroup, pressStyle]}>
            {clipLayer}
            {stamps}
          </Animated.View>
          {lesson ? (
            <View
              pointerEvents="box-none"
              style={[
                styles.lessonCard,
                {
                  borderColor:
                    grade.stagesCorrect === 3 ? artStyle.colors.gold : artStyle.colors.oxblood,
                  maxWidth: frame.contentWidth,
                },
              ]}>
              <Text pointerEvents="none" style={styles.kicker}>
                {lesson.kicker}
              </Text>
              <ScrollView
                testID="scale-result-explanation"
                style={[styles.lessonScroll, { maxHeight: frame.explanationMaxHeight }]}
                contentContainerStyle={styles.lessonContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => {
                  lessonDragged.current = true;
                }}>
                <Text style={styles.lesson}>{lesson.explanation}</Text>
              </ScrollView>
            </View>
          ) : null}
          <View pointerEvents="none" style={[styles.continueBar, { maxWidth: frame.contentWidth }]}>
            <Text
              style={[
                styles.tapCue,
                fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
              ]}>
              TAP ANYWHERE
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.dealCue,
                fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
              ]}>
              {lesson?.continueLabel ?? 'Deal me the next hand'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.overlay} accessibilityLiveRegion="polite">
      <View style={styles.stack}>{stamps}</View>
    </View>
  );
}

function Stamp({
  label,
  correct,
  delay,
  reducedMotion,
  size,
  fontsLoaded,
  cue,
}: {
  label: string;
  correct: boolean;
  delay: number;
  reducedMotion: boolean;
  size: number;
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
    <Animated.View style={[styles.stamp, { width: size, height: size }, style]}>
      <Image
        source={correct ? STAMP_HIT : STAMP_MISS}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityElementsHidden
      />
      <Text
        style={[
          styles.stampLabel,
          { fontSize: Math.max(12, Math.round(size * 0.16)) },
          fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
        ]}>
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
  phoneColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 2,
    paddingHorizontal: 16,
  },
  clipGroup: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
  },
  lessonCard: {
    width: '100%',
    borderWidth: 3,
    borderRadius: 22,
    backgroundColor: artStyle.colors.cream,
    paddingVertical: 12,
    paddingHorizontal: 14,
    zIndex: 3,
  },
  kicker: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  lessonScroll: {
    width: '100%',
  },
  lessonContent: {
    paddingBottom: 2,
  },
  lesson: {
    color: artStyle.colors.tobacco,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  continueBar: {
    width: '100%',
    minHeight: 64,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: artStyle.colors.cream,
    backgroundColor: artStyle.colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tapCue: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
    letterSpacing: 2,
    textAlign: 'center',
  },
  dealCue: {
    color: artStyle.colors.projectorBlack,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: SCALE_RESULT_STAMP_GAP,
    zIndex: 2,
  },
  stamp: {
    alignItems: 'center',
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
