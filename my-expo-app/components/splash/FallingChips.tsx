import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type ChipTone = 'red' | 'teal' | 'blue' | 'gold';

type ChipSpec = {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  tone: ChipTone;
  wobble: number;
};

const TONES: Record<ChipTone, { face: string; edge: string; mid: string; rim: string; mark: string }> = {
  red: { face: '#E53935', edge: '#6B1010', mid: '#A71D1D', rim: '#F5E6C8', mark: '#F5E6C8' },
  teal: { face: '#12949A', edge: '#04383B', mid: '#0B6B6E', rim: '#F0C84A', mark: '#F0C84A' },
  blue: { face: '#2E7BB8', edge: '#0C334C', mid: '#1E5F8A', rim: '#F5E6C8', mark: '#F5E6C8' },
  gold: { face: '#F0C84A', edge: '#6B5208', mid: '#D4A017', rim: '#FFF8DC', mark: '#0B6B6E' },
};

/**
 * Round chip (true circles for the face).
 * Slight 3D = short cylinder band under the face + shadow.
 * Will be swapped to the user's photo reference when provided.
 */
function PokerChipArt({ size, tone }: { size: number; tone: ChipTone }) {
  const c = TONES[tone];
  const id = `roundchip-${tone}-${Math.round(size)}`;

  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 64 72">
      <Defs>
        <LinearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={c.mid} />
          <Stop offset="100%" stopColor={c.edge} />
        </LinearGradient>
        <LinearGradient id={`${id}-face`} x1="0.2" y1="0.15" x2="0.9" y2="0.95">
          <Stop offset="0%" stopColor={c.rim} stopOpacity="0.35" />
          <Stop offset="40%" stopColor={c.face} />
          <Stop offset="100%" stopColor={c.mid} />
        </LinearGradient>
      </Defs>

      {/* soft shadow */}
      <Circle cx="32" cy="66" r="20" fill="#000" opacity={0.22} />

      {/* cylinder thickness under the round face */}
      <Path
        d="M8 32 L8 40 C8 52 18 58 32 58 C46 58 56 52 56 40 L56 32 Z"
        fill={`url(#${id}-side)`}
      />
      <Circle cx="32" cy="40" r="24" fill={c.edge} />

      {/* perfectly round face */}
      <Circle cx="32" cy="28" r="24" fill={`url(#${id}-face)`} />
      <Circle cx="32" cy="28" r="24" fill="none" stroke={c.rim} strokeWidth="2.8" />
      <Circle
        cx="32"
        cy="28"
        r="18"
        fill="none"
        stroke={c.rim}
        strokeWidth="2"
        strokeDasharray="3.5 3"
      />
      <Circle cx="32" cy="28" r="10" fill={c.rim} />
      <SvgText x="32" y="31.5" fill={c.mark} fontSize="9" fontWeight="700" textAnchor="middle">
        SS
      </SvgText>
      <Path
        d="M14 18 C22 12, 40 11, 48 17"
        stroke="#FFFFFF"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity={0.4}
        fill="none"
      />
    </Svg>
  );
}

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
      withRepeat(withTiming(360, { duration: chip.duration * 0.7, easing: Easing.linear }), -1, false)
    );
  }, [chip.delay, chip.duration, progress, spin]);

  const style = useAnimatedStyle(() => {
    const travel = SCREEN_H + chip.size * 2.6;
    const y = -chip.size * 1.3 + progress.value * travel;
    const xDrift = interpolate(progress.value, [0, 0.5, 1], [0, chip.wobble, -chip.wobble * 0.35]);
    const opacity = interpolate(progress.value, [0, 0.04, 0.92, 1], [0, 1, 1, 0]);

    return {
      transform: [{ translateY: y }, { translateX: xDrift }, { rotate: `${spin.value}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: chip.x, top: 0 }, style]}>
      <PokerChipArt size={chip.size} tone={chip.tone} />
    </Animated.View>
  );
}

export function FallingChips({ count = 14 }: { count?: number }) {
  const chips = useMemo<ChipSpec[]>(() => {
    const tones: ChipTone[] = ['red', 'teal', 'blue', 'gold'];
    return Array.from({ length: count }, (_, id) => ({
      id,
      x: 4 + ((id * 83) % Math.max(SCREEN_W - 60, 40)),
      size: 36 + (id % 4) * 5,
      delay: (id * 260) % 3400,
      duration: 4200 + (id % 5) * 650,
      tone: tones[id % tones.length],
      wobble: 18 + (id % 5) * 8,
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
