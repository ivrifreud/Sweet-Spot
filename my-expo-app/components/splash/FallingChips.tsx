import { useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CHIP_IMAGE = require('../../assets/brand/casino-chip-3d.png');

type ChipSpec = {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  wobble: number;
  spinDir: 1 | -1;
};

function FallingChip({ chip }: { chip: ChipSpec }) {
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      chip.delay,
      withRepeat(withTiming(1, { duration: chip.duration }), -1, false)
    );
    spin.value = withDelay(
      chip.delay,
      withRepeat(
        withTiming(360 * chip.spinDir, {
          duration: chip.duration * 0.8,
        }),
        -1,
        false
      )
    );
  }, [chip.delay, chip.duration, chip.spinDir, progress, spin]);

  const style = useAnimatedStyle(() => {
    const travel = SCREEN_H + chip.size * 3;
    // Distance grows with time²: slow at the top, fast at the bottom (gravity).
    const gravityProgress = progress.value * progress.value;
    const y = -chip.size * 1.5 + gravityProgress * travel;
    const xDrift = interpolate(progress.value, [0, 0.5, 1], [0, chip.wobble, -chip.wobble * 0.4]);
    const opacity = interpolate(progress.value, [0, 0.03, 0.9, 1], [0, 1, 1, 0]);

    return {
      transform: [
        { translateY: y },
        { translateX: xDrift },
        { rotate: `${spin.value}deg` },
      ],
      opacity,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: chip.x, top: 0 }, style]}>
      <Image
        source={CHIP_IMAGE}
        style={{ width: chip.size, height: chip.size, backgroundColor: 'transparent' }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

export function FallingChips({ count = 12 }: { count?: number }) {
  const chips = useMemo<ChipSpec[]>(() => {
    return Array.from({ length: count }, (_, id) => ({
      id,
      x: 6 + ((id * 79) % Math.max(SCREEN_W - 70, 40)),
      size: 52 + (id % 4) * 7,
      delay: (id * 280) % 3600,
      duration: 3600 + (id % 5) * 520,
      wobble: 16 + (id % 5) * 8,
      spinDir: id % 2 === 0 ? (1 as const) : (-1 as const),
    }));
  }, [count]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      {chips.map((chip) => (
        <FallingChip key={chip.id} chip={chip} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    overflow: 'visible',
  },
});
