import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { artStyle } from '../../../../theme/artStyle';
import {
  ARRIVAL_CARD_HEIGHT,
  ARRIVAL_CARD_TOP_GAP,
  ARRIVAL_CARD_WIDTH,
  ARRIVAL_DISMISS_MS,
  ARRIVAL_HOLD_MS,
  ARRIVAL_POP_MS,
  ARRIVAL_REDUCED_IN_MS,
  ARRIVAL_SETTLE_MS,
} from './seatRail';

type ArrivalCardProps = {
  copy: string;
  onCleared: () => void;
};

export function ArrivalCard({ copy, onCleared }: ArrivalCardProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 0 : 1);
  const scale = useSharedValue(reduced ? 1 : 0.86);
  const cleared = useSharedValue(false);

  useEffect(() => {
    if (reduced) {
      opacity.value = withTiming(1, { duration: ARRIVAL_REDUCED_IN_MS });
    } else {
      scale.value = withTiming(1.08, { duration: ARRIVAL_POP_MS, easing: Easing.out(Easing.cubic) }, () => {
        scale.value = withTiming(1, { duration: ARRIVAL_SETTLE_MS });
      });
    }
    const hold = setTimeout(() => dismiss(), ARRIVAL_HOLD_MS + (reduced ? ARRIVAL_REDUCED_IN_MS : ARRIVAL_POP_MS));
    return () => clearTimeout(hold);
    // dismiss is stable enough for this card's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  function dismiss() {
    if (cleared.value) return;
    cleared.value = true;
    opacity.value = withTiming(0, { duration: ARRIVAL_DISMISS_MS });
    setTimeout(onCleared, ARRIVAL_DISMISS_MS);
  }

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copy}
      accessibilityHint="Dismiss the seat card"
      accessibilityLiveRegion="polite"
      onPress={dismiss}
      style={[styles.hit, { top: insets.top + ARRIVAL_CARD_TOP_GAP }]}>
      <Animated.View style={[styles.card, style]}>
        <Text style={styles.copy}>{copy}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 30,
    minHeight: 44,
  },
  card: {
    minHeight: ARRIVAL_CARD_HEIGHT,
    maxWidth: ARRIVAL_CARD_WIDTH,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.cream,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  copy: {
    color: '#171713',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
