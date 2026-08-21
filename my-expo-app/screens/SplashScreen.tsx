import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FallingChips } from '../components/splash/FallingChips';
import { brand } from '../theme/brand';

type Props = {
  onPressStart: () => void;
};

export function SplashScreen({ onPressStart }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../assets/brand/casino-neon-bg.png')}
        style={styles.bg}
        resizeMode="cover">
        <View style={styles.dim} />
        <FallingChips />

        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 28,
            },
          ]}>
          <Image
            source={require('../../assets/brand/logo-example2.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Sweet Spot logo"
          />

          <Text style={styles.tagline}>Find the edge. Play the moment.</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Press to start"
            onPress={onPressStart}
            style={({ pressed }) => [
              styles.button,
              pressed ? styles.buttonPressed : null,
            ]}>
            {({ pressed }) => (
              <Text style={[styles.buttonText, pressed ? styles.buttonTextPressed : null]}>
                {pressed ? 'Lets go!' : 'Press to start'}
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
    backgroundColor: 'rgba(5, 11, 20, 0.45)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: '92%',
    maxWidth: 420,
    height: 320,
  },
  tagline: {
    marginTop: 8,
    marginBottom: 28,
    color: brand.ink,
    fontSize: 15,
    letterSpacing: 0.4,
    opacity: 0.85,
    textAlign: 'center',
  },
  button: {
    minWidth: 220,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: brand.gold,
    borderWidth: 2,
    borderColor: brand.goldBright,
    shadowColor: brand.tealNeon,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: brand.teal,
    borderColor: brand.tealNeon,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: brand.night,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  buttonTextPressed: {
    color: brand.ink,
  },
});
