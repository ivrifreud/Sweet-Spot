import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FallingChips } from '../components/splash/FallingChips';
import { brand } from '../theme/brand';

type Props = {
  onPressStart: () => void;
};

export function SplashScreen({ onPressStart }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const logoPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../assets/brand/casino-neon-bg.png')}
        style={styles.bg}
        resizeMode="cover">
        <View style={styles.dim} />
        <View style={styles.vignette} />
        <FallingChips />

        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 28,
            },
          ]}>
          <Animated.View style={[styles.logoWrap, logoPulse]}>
            <Image
              source={require('../assets/brand/logo-example2.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Sweet Spot logo"
            />
          </Animated.View>

          <Text
            style={[
              styles.tagline,
              fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
            ]}>
            FIND THE EDGE
          </Text>
          <Text
            style={[
              styles.taglineGold,
              fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
            ]}>
            PLAY THE MOMENT
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Press to start"
            onPress={onPressStart}
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}>
            {({ pressed }) => (
              <Text style={[styles.buttonText, pressed ? styles.buttonTextPressed : null]}>
                {pressed ? 'LETS GO' : 'PRESS TO START'}
              </Text>
            )}
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.night,
  },
  bg: {
    flex: 1,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 11, 20, 0.28)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 0,
    // soft edge darkening via layered translucent overlays
    shadowColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  logoWrap: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: '96%',
    maxWidth: 440,
    height: 340,
  },
  tagline: {
    marginTop: 4,
    color: brand.tealNeon,
    fontSize: 28,
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(26, 209, 199, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  taglineGold: {
    marginTop: 2,
    marginBottom: 26,
    color: brand.goldBright,
    fontSize: 28,
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(240, 200, 74, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  button: {
    minWidth: 240,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 107, 110, 0.55)',
    borderWidth: 2,
    borderColor: brand.goldBright,
    shadowColor: brand.goldBright,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  buttonPressed: {
    backgroundColor: brand.gold,
    borderColor: brand.ink,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: brand.goldBright,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonTextPressed: {
    color: brand.night,
  },
});
