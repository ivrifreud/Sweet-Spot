import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { artStyle } from '../../../../theme/artStyle';
import { ARRIVAL_DISMISS_MS, ARRIVAL_POP_MS, ARRIVAL_REDUCED_IN_MS, ARRIVAL_SETTLE_MS } from './seatRail';

type ArrivalCardProps = {
  copy: string;
  onCleared: () => void;
  frame: { x: number; y: number; width: number; height: number };
};

export function ArrivalCard({ copy, onCleared, frame }: ArrivalCardProps) {
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
  }, [opacity, reduced, scale]);

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
      accessibilityHint="Tap the screen when you have read your seat"
      accessibilityLiveRegion="polite"
      onPress={dismiss}
      style={styles.scrim}>
      <Animated.View
        style={[
          styles.card,
          {
            left: frame.x,
            top: frame.y,
            width: Math.max(frame.width, 44),
            minHeight: Math.max(frame.height, 88),
          },
          style,
        ]}>
        <View style={styles.stock}>
          <Text style={styles.copy}>{copy}</Text>
          <Text style={styles.hint}>Tap the screen to continue</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  card: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: artStyle.colors.projectorBlack,
    backgroundColor: artStyle.colors.projectorBlack,
    padding: 5,
  },
  stock: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: '#F7F3EA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  copy: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    color: artStyle.colors.tobacco,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
