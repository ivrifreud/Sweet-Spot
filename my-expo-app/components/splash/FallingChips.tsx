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
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

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

/** Round poker chip with a thicker cylinder side for a clearer 3D read. */
function PokerChipArt({ size, tone }: { size: number; tone: ChipTone }) {
  const c = TONES[tone];
  const id = `chip3d-${tone}-${Math.round(size)}`;

  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 64 74">
      <Defs>
        <LinearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={c.mid} />
          <Stop offset="55%" stopColor={c.edge} />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
        </LinearGradient>
        <LinearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={c.rim} stopOpacity="0.45" />
          <Stop offset="35%" stopColor={c.face} />
          <Stop offset="100%" stopColor={c.mid} />
        </LinearGradient>
      </Defs>

      {/* ground shadow */}
      <Ellipse cx="32" cy="68" rx="22" ry="4" fill="#000" opacity={0.28} />

      {/* cylinder wall (thickness) */}
      <Path
        d="M6 30 C6 30, 6 48, 6 48 C6 56, 17 62, 32 62 C47 62, 58 56, 58 48 C58 48, 58 30, 58 30 Z"
        fill={`url(#${id}-side)`}
      />
      <Ellipse cx="32" cy="48" rx="26" ry="12" fill={c.edge} />

      {/* top face — mostly round */}
      <Ellipse cx="32" cy="28" rx="26" ry="24" fill={`url(#${id}-face)`} />
      <Ellipse cx="32" cy="28" rx="26" ry="24" fill="none" stroke={c.rim} strokeWidth="2.6" />
      <Ellipse
        cx="32"
        cy="28"
        rx="20"
        ry="18"
        fill="none"
        stroke={c.rim}
        strokeWidth="1.8"
        strokeDasharray="4 3"
      />
      <Ellipse cx="32" cy="28" rx="11" ry="10" fill={c.rim} />
      <SvgText x="32" y="31.5" fill={c.mark} fontSize="8" fontWeight="700" textAnchor="middle">
        SS
      </SvgText>

      {/* specular highlight */}
      <Path
        d="M14 20 C22 12, 38 11, 48 18"
        stroke="#FFFFFF"
        strokeWidth="1.8"
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
    // Start fully above the screen, end fully past the bottom edge.
    const travel = SCREEN_H + chip.size * 2.4;
    const y = -chip.size * 1.2 + progress.value * travel;
    const xDrift = interpolate(progress.value, [0, 0.5, 1], [0, chip.wobble, -chip.wobble * 0.4]);
    // Stay visible through the whole fall; fade only at the very end.
    const opacity = interpolate(progress.value, [0, 0.05, 0.9, 1], [0, 0.95, 0.95, 0]);

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
      size: 34 + (id % 4) * 5,
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
