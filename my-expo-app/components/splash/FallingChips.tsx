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

export type GravityFallingChipsProps = {
  /** Number of chips in the repeating rain. */
  count?: number;
  /** Smallest rendered chip in pixels. */
  minSize?: number;
  /** Milliseconds for the fastest fall. */
  baseDuration?: number;
  /** Layer order, so the effect can sit behind or above different UI. */
  zIndex?: number;
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
      transform: [{ translateY: y }, { translateX: xDrift }, { rotate: `${spin.value}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: chip.x, top: 0 }, style]}>
      <Image
        source={CHIP_IMAGE}
        style={{ width: chip.size, height: chip.size, backgroundColor: 'transparent' }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

/**
 * Reusable reward-rain mechanic.
 *
 * The vertical position follows time², producing visible gravitational
 * acceleration. Use it for splash, jackpots, stage completion, and streaks.
 */
export function GravityFallingChips({
  count = 12,
  minSize = 52,
  baseDuration = 3600,
  zIndex = 2,
}: GravityFallingChipsProps) {
  const chips = useMemo<ChipSpec[]>(() => {
    return Array.from({ length: count }, (_, id) => ({
      id,
      x: 6 + ((id * 79) % Math.max(SCREEN_W - 70, 40)),
      size: minSize + (id % 4) * 7,
      delay: (id * 280) % 3600,
      duration: baseDuration + (id % 5) * 520,
      wobble: 16 + (id % 5) * 8,
      spinDir: id % 2 === 0 ? (1 as const) : (-1 as const),
    }));
  }, [baseDuration, count, minSize]);

  return (
    <View pointerEvents="none" style={[styles.layer, { zIndex }]}>
      {chips.map((chip) => (
        <FallingChip key={chip.id} chip={chip} />
      ))}
    </View>
  );
}

/** Splash-compatible name kept to avoid breaking the current screen. */
export function FallingChips(props: GravityFallingChipsProps) {
  return <GravityFallingChips {...props} />;
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
});
