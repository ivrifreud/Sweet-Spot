import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FallingChips } from '../components/splash/FallingChips';
import { brand } from '../theme/brand';

type Props = {
  onPressStart: () => void;
};

export function SplashScreen({ onPressStart }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });

  return (
    <Pressable
      style={styles.root}
      onPress={onPressStart}
      accessibilityRole="button"
      accessibilityLabel="Press to play">
      {({ pressed }) => (
        <ImageBackground
          source={require('../assets/brand/splash-hero.png')}
          style={styles.bg}
          resizeMode="cover">
          <FallingChips />

          <View
            style={[
              styles.ctaWrap,
              {
                paddingBottom: insets.bottom + 36,
              },
            ]}
            pointerEvents="none">
            <Text
              style={[
                styles.cta,
                fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null,
                pressed ? styles.ctaPressed : null,
              ]}>
              {pressed ? 'LETS GO' : 'PRESS TO PLAY'}
            </Text>
            <View style={[styles.ctaUnderline, pressed ? styles.ctaUnderlinePressed : null]} />
          </View>
        </ImageBackground>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.night,
  },
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ctaWrap: {
    alignItems: 'center',
    zIndex: 3,
  },
  cta: {
    color: brand.goldBright,
    fontSize: 34,
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  ctaPressed: {
    color: brand.tealNeon,
    transform: [{ scale: 0.97 }],
  },
  ctaUnderline: {
    marginTop: 8,
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: brand.goldBright,
    opacity: 0.85,
  },
  ctaUnderlinePressed: {
    backgroundColor: brand.tealNeon,
    width: 150,
  },
});
