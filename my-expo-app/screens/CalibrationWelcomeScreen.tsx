import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GravityFallingChips } from '../components/effects';
import { artStyle } from '../theme/artStyle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  onBegin: () => void;
};

/**
 * The moment right before calibration starts.
 *
 * A 1930s title-card welcome: the coach and the dealer invite the player to the
 * table, the idea of the skill test is framed as play (not a quiz), and a single
 * gold CTA deals them into the first hand.
 */
export function CalibrationWelcomeScreen({ onBegin }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  const ctaScale = useSharedValue(1);

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
      source={require('../assets/brand/artstyle/welcome-calibration-hero.png')}
      style={styles.root}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(17,23,20,0.15)', 'rgba(17,23,20,0.82)', 'rgba(17,23,20,0.97)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <GravityFallingChips count={5} minSize={30} baseDuration={4800} zIndex={1} />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}>
        <View style={styles.copyBlock}>
          <Text style={[styles.kicker, display]} accessibilityRole="header">
            THE WARM-UP
          </Text>

          <Text style={[styles.title, display]}>LET&apos;S FIND{'\n'}YOUR SEAT</Text>

          <View style={styles.rule} />

          <Text style={styles.body}>
            No quiz. No jargon. Play a handful of real hands, we read your game, then sit you at the
            table where you&apos;ll win the most.
          </Text>
        </View>

        <View style={styles.footer}>
          <AnimatedPressable
            onPress={onBegin}
            onPressIn={pressCtaIn}
            onPressOut={pressCtaOut}
            style={[styles.cta, ctaStyle]}
            accessibilityRole="button"
            accessibilityLabel="Deal me in and start calibration">
            <Text style={[styles.ctaText, display]}>DEAL ME IN</Text>
          </AnimatedPressable>

          <Text style={styles.footnote}>Takes about a minute.</Text>
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
    justifyContent: 'flex-end',
  },
  copyBlock: {
    alignItems: 'center',
    marginBottom: 36,
  },
  kicker: {
    color: artStyle.colors.goldBright,
    fontSize: 16,
    letterSpacing: 3.5,
    textAlign: 'center',
  },
  title: {
    color: artStyle.colors.cream,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  rule: {
    width: 132,
    height: 3,
    borderRadius: 2,
    marginTop: 18,
    backgroundColor: artStyle.colors.gold,
  },
  body: {
    color: 'rgba(232,215,167,0.9)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 6,
  },
  footer: {
    alignItems: 'center',
  },
  cta: {
    width: '100%',
    minHeight: 56,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.cream,
    backgroundColor: artStyle.colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: artStyle.colors.projectorBlack,
    fontSize: 24,
    letterSpacing: 2.5,
  },
  footnote: {
    color: 'rgba(232,215,167,0.6)',
    fontSize: 13,
    marginTop: 12,
  },
});
