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

const TONES: Record<ChipTone, { face: string; edge: string; rim: string; mark: string }> = {
  red: { face: '#C62828', edge: '#7A1515', rim: '#F5E6C8', mark: '#F5E6C8' },
  teal: { face: '#0B6B6E', edge: '#04383B', rim: '#F0C84A', mark: '#F0C84A' },
  blue: { face: '#1E5F8A', edge: '#0C334C', rim: '#F5E6C8', mark: '#F5E6C8' },
  gold: { face: '#D4A017', edge: '#7A5A08', rim: '#FFF1B8', mark: '#0B6B6E' },
};

/** Near-circular chip with a short side wall so it reads round, not a long oval. */
function PokerChipArt({ size, tone }: { size: number; tone: ChipTone }) {
  const c = TONES[tone];
  const id = `chip-${tone}-${size}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={c.edge} />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={c.rim} stopOpacity="0.3" />
          <Stop offset="40%" stopColor={c.face} />
          <Stop offset="100%" stopColor={c.edge} />
        </LinearGradient>
      </Defs>

      {/* short side wall */}
      <Ellipse cx="32" cy="36" rx="26" ry="24" fill={`url(#${id}-side)`} />

      {/* round face */}
      <Ellipse cx="32" cy="30" rx="26" ry="24" fill={`url(#${id}-face)`} />
      <Ellipse cx="32" cy="30" rx="26" ry="24" fill="none" stroke={c.rim} strokeWidth="2.4" />
      <Ellipse
        cx="32"
        cy="30"
        rx="20"
        ry="18"
        fill="none"
        stroke={c.rim}
        strokeWidth="1.7"
        strokeDasharray="4 3"
      />
      <Ellipse cx="32" cy="30" rx="11" ry="10" fill={c.rim} />
      <SvgText x="32" y="33" fill={c.mark} fontSize="8" fontWeight="700" textAnchor="middle">
        SS
      </SvgText>
      <Path
        d="M16 22 C24 14, 40 13, 48 20"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.3}
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
      withRepeat(withTiming(360, { duration: chip.duration * 0.75, easing: Easing.linear }), -1, false)
    );
  }, [chip.delay, chip.duration, progress, spin]);

  const style = useAnimatedStyle(() => {
    const y = progress.value * (SCREEN_H + chip.size * 2) - chip.size;
    const xDrift = (progress.value - 0.5) * chip.wobble;
    return {
      transform: [{ translateY: y }, { translateX: xDrift }, { rotate: `${spin.value}deg` }],
      opacity: 0.4 + progress.value * 0.5,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: chip.x, top: 0 }, style]}>
      <PokerChipArt size={chip.size} tone={chip.tone} />
    </Animated.View>
  );
}

export function FallingChips({ count = 12 }: { count?: number }) {
  const chips = useMemo<ChipSpec[]>(() => {
    const tones: ChipTone[] = ['red', 'teal', 'blue', 'gold'];
    return Array.from({ length: count }, (_, id) => ({
      id,
      x: 8 + ((id * 89) % Math.max(SCREEN_W - 56, 40)),
      size: 32 + (id % 4) * 5,
      delay: (id * 320) % 3600,
      duration: 4800 + (id % 5) * 800,
      tone: tones[id % tones.length],
      wobble: 16 + (id % 4) * 8,
    }));
  }, [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {chips.map((chip) => (
        <FallingChip key={chip.id} chip={chip} />
      ))}
    </View>
  );
}
