import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { artStyle } from '../../theme/artStyle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function pressPlaceholder() {
  // Premium rebuy and rewarded ads are placeholders this sprint.
}

type Props = {
  countdown: string;
};

export function ChipLockoutCard({ countdown }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const buyScale = useSharedValue(1);
  const adScale = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 240 });
    cardScale.value = withSequence(
      withTiming(1.05, { duration: 220 }),
      withSpring(1, { damping: 12, stiffness: 180 })
    );
  }, [cardOpacity, cardScale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const buyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buyScale.value }],
  }));

  const adStyle = useAnimatedStyle(() => ({
    transform: [{ scale: adScale.value }],
  }));

  function pressIn(scale: typeof buyScale) {
    scale.value = withTiming(0.96, { duration: 100 });
  }

  function pressOut(scale: typeof buyScale) {
    scale.value = withSequence(
      withTiming(1.03, { duration: 90 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.card, cardStyle]}>
        <Image
          source={require('../../assets/brand/artstyle/coach-broke-lockout.png')}
          style={styles.coach}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
        <Text style={[styles.kicker, display]}>THE TRAY IS EMPTY</Text>
        <Text style={[styles.title, display]}>CHIPS ARE SPENT</Text>
        <View style={styles.rule} />
        <Text style={styles.joke}>
          Twelve hours is a long sit for a busted stack. The house will slide your chips back when
          the clock says so — unless a gentleman buys the next seat, or sits through a short picture
          show.
        </Text>
        <Text style={styles.countdown}>{countdown}</Text>

        <AnimatedPressable
          onPress={pressPlaceholder}
          onPressIn={() => pressIn(buyScale)}
          onPressOut={() => pressOut(buyScale)}
          style={[styles.buyButton, buyStyle]}
          accessibilityRole="button"
          accessibilityLabel="Buy the stack"
          accessibilityHint="Placeholder for a premium rebuy. Not wired yet.">
          <Text style={[styles.buyLabel, display]}>BUY THE STACK</Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={pressPlaceholder}
          onPressIn={() => pressIn(adScale)}
          onPressOut={() => pressOut(adScale)}
          style={[styles.adButton, adStyle]}
          accessibilityRole="button"
          accessibilityLabel="Watch a reel"
          accessibilityHint="Placeholder for a rewarded ad. Not wired yet.">
          <Text style={[styles.adLabel, display]}>WATCH A REEL</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: 'rgba(17,23,20,0.42)',
    overflow: 'visible',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    overflow: 'visible',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: artStyle.colors.oxblood,
    backgroundColor: 'rgba(17,23,20,0.94)',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  coach: {
    position: 'absolute',
    top: -40,
    left: -45,
    width: 135,
    height: 160,
    zIndex: 2,
    pointerEvents: 'none',
  },
  kicker: {
    color: artStyle.colors.oxblood,
    fontSize: 13,
    letterSpacing: 3.2,
    textAlign: 'center',
  },
  title: {
    color: artStyle.colors.oxblood,
    fontSize: 36,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(17,23,20,0.75)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  rule: {
    width: 118,
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    backgroundColor: artStyle.colors.oxblood,
  },
  joke: {
    color: 'rgba(232,215,167,0.9)',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 16,
  },
  countdown: {
    color: artStyle.colors.goldBright,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  buyButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.cream,
    backgroundColor: artStyle.colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyLabel: {
    color: artStyle.colors.projectorBlack,
    fontSize: 20,
    letterSpacing: 2.2,
  },
  adButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'rgba(17,23,20,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  adLabel: {
    color: artStyle.colors.cream,
    fontSize: 18,
    letterSpacing: 2,
  },
});
