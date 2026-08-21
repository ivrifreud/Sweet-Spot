import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { brand } from '../../theme/brand';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type ChipSpec = {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  rim: string;
};

function FallingChip({ chip }: { chip: ChipSpec }) {
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      chip.delay,
      withRepeat(
        withTiming(1, { duration: chip.duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    spin.value = withDelay(
      chip.delay,
      withRepeat(withTiming(360, { duration: chip.duration * 0.9, easing: Easing.linear }), -1, false)
    );
  }, [chip.delay, chip.duration, progress, spin]);

  const style = useAnimatedStyle(() => {
    const y = progress.value * (SCREEN_H + chip.size * 2) - chip.size;
    return {
      transform: [{ translateY: y }, { rotate: `${spin.value}deg` }],
      opacity: 0.25 + progress.value * 0.5,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chip,
        {
          left: chip.x,
          width: chip.size,
          height: chip.size,
          borderRadius: chip.size / 2,
          backgroundColor: chip.color,
          borderColor: chip.rim,
        },
        style,
      ]}>
      <View
        style={[
          styles.chipInner,
          {
            width: chip.size * 0.45,
            height: chip.size * 0.45,
            borderRadius: chip.size * 0.225,
            backgroundColor: chip.rim,
          },
        ]}
      />
    </Animated.View>
  );
}

export function FallingChips({ count = 14 }: { count?: number }) {
  const chips = useMemo<ChipSpec[]>(() => {
    const colors = [
      { color: brand.chipRed, rim: brand.goldBright },
      { color: brand.teal, rim: brand.goldBright },
      { color: brand.chipBlue, rim: brand.gold },
      { color: brand.goldDark, rim: brand.goldBright },
    ];

    return Array.from({ length: count }, (_, id) => {
      const palette = colors[id % colors.length];
      return {
        id,
        x: (id * 97) % (SCREEN_W - 40),
        size: 18 + (id % 5) * 5,
        delay: (id * 280) % 3200,
        duration: 4200 + (id % 6) * 700,
        color: palette.color,
        rim: palette.rim,
      };
    });
  }, [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {chips.map((chip) => (
        <FallingChip key={chip.id} chip={chip} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    top: 0,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInner: {
    opacity: 0.9,
  },
});
