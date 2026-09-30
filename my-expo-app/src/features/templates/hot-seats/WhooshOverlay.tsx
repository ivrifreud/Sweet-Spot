import { StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { artStyle } from '../../../../theme/artStyle';

type WhooshOverlayProps = {
  opacity: SharedValue<number>;
  travel: SharedValue<number>;
};

/** One ink-and-wind streak. It does not mount a second table. */
export function WhooshOverlay({ opacity, travel }: WhooshOverlayProps) {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: -420 + travel.value * 840 }, { rotate: '-8deg' }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.streak, style]} />;
}

const styles = StyleSheet.create({
  streak: {
    position: 'absolute',
    top: '28%',
    width: 220,
    height: 280,
    borderRadius: 120,
    backgroundColor: artStyle.colors.cream,
    borderWidth: 3,
    borderColor: '#171713',
    zIndex: 25,
  },
});
