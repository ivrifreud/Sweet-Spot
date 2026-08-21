import { useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CHIP_IMAGE = require('../../assets/brand/chip-gold-spade.png');

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
  const flip = useSharedValue(0);

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
      withRepeat(
        withTiming(360 * chip.spinDir, { duration: chip.duration * 0.85, easing: Easing.linear }),
        -1,
        false
      )
    );
    // gentle 3D tumble on the X axis while falling
    flip.value = withDelay(
      chip.delay,
      withRepeat(
        withTiming(1, { duration: chip.duration * 0.55, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, [chip.delay, chip.duration, chip.spinDir, progress, spin, flip]);

  const style = useAnimatedStyle(() => {
    const travel = SCREEN_H + chip.size * 2.8;
    const y = -chip.size * 1.4 + progress.value * travel;
    const xDrift = interpolate(progress.value, [0, 0.5, 1], [0, chip.wobble, -chip.wobble * 0.35]);
    const opacity = interpolate(progress.value, [0, 0.03, 0.92, 1], [0, 1, 1, 0]);
    const rotateX = interpolate(flip.value, [0, 1], [-28, 28]);
    const scaleY = interpolate(flip.value, [0, 0.5, 1], [1, 0.82, 1]);

    return {
      transform: [
        { perspective: 600 },
        { translateY: y },
        { translateX: xDrift },
        { rotate: `${spin.value}deg` },
        { rotateX: `${rotateX}deg` },
        { scaleY },
      ],
      opacity,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: chip.x, top: 0 }, style]}>
      <View style={styles.shadowWrap}>
        <Image source={CHIP_IMAGE} style={{ width: chip.size, height: chip.size }} resizeMode="contain" />
      </View>
    </Animated.View>
  );
}

export function FallingChips({ count = 12 }: { count?: number }) {
  const chips = useMemo<ChipSpec[]>(() => {
    return Array.from({ length: count }, (_, id) => ({
      id,
      x: 6 + ((id * 79) % Math.max(SCREEN_W - 64, 40)),
      size: 42 + (id % 4) * 6,
      delay: (id * 280) % 3600,
      duration: 4300 + (id % 5) * 700,
      wobble: 16 + (id % 5) * 8,
      spinDir: id % 2 === 0 ? 1 : -1,
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
  shadowWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
