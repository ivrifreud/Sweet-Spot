import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GravityFallingChips } from '../components/effects';
import type { LevelReveal } from '../lib/calibration/levelReveal';
import { artStyle } from '../theme/artStyle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  reveal: LevelReveal;
  onContinue: () => void;
  onSignOut: () => void;
  error?: string | null;
};

/**
 * The level-reveal moment after calibration places a player.
 *
 * Built as a 1930s title card: the card lands with an overshoot, a gold rule
 * wipes outward beneath it, then chips rain as the reward beat.
 */
export function LevelRevealScreen({ reveal, onContinue, onSignOut, error }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  const cardScale = useSharedValue(0.86);
  const cardOpacity = useSharedValue(0);
  const ruleWidth = useSharedValue(0);
  const detailOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 260 });
    cardScale.value = withSequence(
      withTiming(1.06, { duration: 240 }),
      withSpring(1, { damping: 12, stiffness: 180 })
    );
    ruleWidth.value = withDelay(260, withTiming(1, { duration: 420 }));
    detailOpacity.value = withDelay(420, withTiming(1, { duration: 320 }));
  }, [cardOpacity, cardScale, detailOpacity, ruleWidth]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: ruleWidth.value }],
    opacity: ruleWidth.value,
  }));

  const detailStyle = useAnimatedStyle(() => ({
    opacity: detailOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  function pressCtaIn() {
    ctaScale.value = withTiming(0.96, { duration: 100 });
  }

  function pressCtaOut() {
    ctaScale.value = withSequence(
      withTiming(1.03, { duration: 90 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
  }

  return (
    <ImageBackground
      source={require('../assets/brand/splash-opener-approved.jpg')}
      style={styles.root}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(17,23,20,0.55)', 'rgba(17,23,20,0.88)', 'rgba(17,23,20,0.97)']}
        locations={[0, 0.32, 1]}
        style={StyleSheet.absoluteFill}
      />
      <GravityFallingChips count={7} minSize={34} baseDuration={4600} zIndex={1} />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
        ]}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text
            style={[styles.kicker, display]}
            accessibilityLiveRegion="polite"
            accessibilityRole="header">
            {reveal.returning ? 'WELCOME BACK' : 'YOUR PLACEMENT'}
          </Text>

          {reveal.returning ? <Text style={styles.kickerNote}>{reveal.reasonLine}</Text> : null}

          <Text style={[styles.levelNumber, display]}>LEVEL {reveal.placement}</Text>
          <Text style={[styles.levelName, display]}>{reveal.levelName}</Text>

          <Animated.View style={[styles.rule, ruleStyle]} />

          <Animated.View style={detailStyle}>
            <Text style={styles.tagline}>{`\u201C${reveal.tagline}\u201D`}</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.detailBlock, detailStyle]}>
          {reveal.returning ? null : <Text style={styles.reason}>{reveal.reasonLine}</Text>}

          <View style={styles.trackRow}>
            <View style={styles.trackItem}>
              <Text style={styles.trackLabel}>Starting rating</Text>
              <Text style={[styles.trackValue, display]}>{reveal.startingRating}</Text>
              <Text style={styles.percentile}>{reveal.percentileLabel}</Text>
            </View>
            <View style={styles.trackDivider} />
            <View style={styles.trackItem}>
              <Text style={styles.trackLabel}>Where you play</Text>
              <Text style={[styles.trackValue, display]}>{reveal.worldName}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          {error ? (
            <View accessible accessibilityRole="alert" style={styles.errorRow}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <AnimatedPressable
            onPress={onContinue}
            onPressIn={pressCtaIn}
            onPressOut={pressCtaOut}
            style={[styles.cta, ctaStyle]}
            accessibilityRole="button"
            accessibilityLabel={reveal.ctaLabel}>
            <Text style={[styles.ctaText, display]}>{reveal.ctaLabel}</Text>
          </AnimatedPressable>

          <Pressable
            onPress={onSignOut}
            hitSlop={12}
            style={styles.signOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out">
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  content: {
    flex: 1,
    zIndex: 2,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  card: {
    alignItems: 'center',
    marginTop: 12,
  },
  kicker: {
    color: artStyle.colors.goldBright,
    fontSize: 16,
    letterSpacing: 3.5,
    textAlign: 'center',
  },
  kickerNote: {
    color: 'rgba(232,215,167,0.78)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  levelNumber: {
    color: artStyle.colors.cream,
    fontSize: 22,
    letterSpacing: 4,
    marginTop: 14,
  },
  levelName: {
    color: artStyle.colors.goldBright,
    fontSize: 58,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  rule: {
    width: 132,
    height: 3,
    borderRadius: 2,
    marginTop: 14,
    backgroundColor: artStyle.colors.gold,
  },
  tagline: {
    color: 'rgba(232,215,167,0.82)',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  detailBlock: {
    alignItems: 'center',
  },
  reason: {
    color: artStyle.colors.cream,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,155,60,0.45)',
    backgroundColor: 'rgba(11,95,93,0.28)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  trackItem: {
    flex: 1,
    alignItems: 'center',
  },
  trackDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232,215,167,0.3)',
    marginHorizontal: 12,
  },
  trackLabel: {
    color: 'rgba(232,215,167,0.68)',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  trackValue: {
    color: artStyle.colors.cream,
    fontSize: 19,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 5,
  },
  percentile: {
    color: 'rgba(232,215,167,0.6)',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 3,
  },
  footer: {
    alignItems: 'center',
  },
  errorRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: artStyle.colors.oxblood,
    backgroundColor: 'rgba(164,62,50,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  errorText: {
    color: artStyle.colors.cream,
    fontSize: 14,
    textAlign: 'center',
  },
  cta: {
    width: '100%',
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.cream,
    backgroundColor: artStyle.colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: artStyle.colors.projectorBlack,
    fontSize: 22,
    letterSpacing: 2.5,
  },
  signOut: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  signOutText: {
    color: 'rgba(232,215,167,0.72)',
    fontSize: 14,
  },
});
