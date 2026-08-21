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
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type ChipSpec = {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  wobble: number;
  spinDir: 1 | -1;
};

/** Gold spade chip inspired by the reference — true circle + visible thickness. */
function GoldSpadeChip({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.18} viewBox="0 0 64 76">
      <Defs>
        <LinearGradient id="side" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D4A017" />
          <Stop offset="55%" stopColor="#8A6A0A" />
          <Stop offset="100%" stopColor="#3D2E05" />
        </LinearGradient>
        <LinearGradient id="face" x1="0.15" y1="0.1" x2="0.9" y2="1">
          <Stop offset="0%" stopColor="#FFE9A0" />
          <Stop offset="40%" stopColor="#F0C84A" />
          <Stop offset="100%" stopColor="#B8860B" />
        </LinearGradient>
        <LinearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFF6C8" />
          <Stop offset="100%" stopColor="#C9A227" />
        </LinearGradient>
      </Defs>

      {/* soft contact shadow */}
      <Ellipse cx="32" cy="70" rx="20" ry="4.5" fill="#000" opacity={0.3} />

      {/* cylinder side wall for 3D */}
      <Path
        d="M8 34 L8 44 C8 56 18 62 32 62 C46 62 56 56 56 44 L56 34 Z"
        fill="url(#side)"
      />
      <Ellipse cx="32" cy="44" rx="24" ry="11" fill="#6B5208" />

      {/* round face */}
      <Circle cx="32" cy="30" r="24" fill="url(#face)" />
      <Circle cx="32" cy="30" r="24" fill="none" stroke="url(#rim)" strokeWidth="2.8" />

      {/* six segment ticks + holes */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const x1 = 32 + Math.cos(rad) * 17;
        const y1 = 30 + Math.sin(rad) * 17;
        const x2 = 32 + Math.cos(rad) * 22.5;
        const y2 = 30 + Math.sin(rad) * 22.5;
        const hx = 32 + Math.cos(rad) * 19.5;
        const hy = 30 + Math.sin(rad) * 19.5;
        return (
          <G key={deg}>
            <Path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#8A6A0A" strokeWidth="1.4" />
            <Circle cx={hx} cy={hy} r="1.7" fill="#5C4508" />
            <Circle cx={hx} cy={hy} r="1.1" fill="#2A1F04" />
          </G>
        );
      })}

      {/* notch ring */}
      <Circle
        cx="32"
        cy="30"
        r="13.5"
        fill="none"
        stroke="#8A6A0A"
        strokeWidth="2.2"
        strokeDasharray="2.2 2.2"
      />

      {/* spade cutout */}
      <Path
        d="M32 18 C32 18 22 27 22 33 C22 37 25 39.5 28.5 39.5 C29.5 39.5 30.5 39.2 31.2 38.7 L30 43 L34 43 L32.8 38.7 C33.5 39.2 34.5 39.5 35.5 39.5 C39 39.5 42 37 42 33 C42 27 32 18 32 18 Z"
        fill="#3D2E05"
      />
      <Path
        d="M32 20 C32 18 24 27.5 23.5 32.5 C23.2 35.5 25.5 37.8 28.2 37.8 C29.4 37.8 30.4 37.4 31.2 36.8 L30.2 41.2 L33.8 41.2 L32.8 36.8 C33.6 37.4 34.6 37.8 35.8 37.8 C38.5 37.8 40.8 35.5 40.5 32.5 C23.5 27.5 32 20 32 20 Z"
        fill="#1A1608"
        opacity={0.9}
      />

      {/* highlight */}
      <Path
        d="M16 20 C24 13 40 12 47 19"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={0.45}
        fill="none"
      />
    </Svg>
  );
}

function FallingChip({ chip }: { chip: ChipSpec }) {
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);
  const tumble = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      chip.delay,
      withRepeat(withTiming(1, { duration: chip.duration, easing: Easing.linear }), -1, false)
    );
    spin.value = withDelay(
      chip.delay,
      withRepeat(
        withTiming(360 * chip.spinDir, {
          duration: chip.duration * 0.8,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    tumble.value = withDelay(
      chip.delay,
      withRepeat(
        withTiming(1, {
          duration: Math.max(900, chip.duration * 0.45),
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, [chip.delay, chip.duration, chip.spinDir, progress, spin, tumble]);

  const style = useAnimatedStyle(() => {
    const travel = SCREEN_H + chip.size * 3;
    const y = -chip.size * 1.5 + progress.value * travel;
    const xDrift = interpolate(progress.value, [0, 0.5, 1], [0, chip.wobble, -chip.wobble * 0.4]);
    const opacity = interpolate(progress.value, [0, 0.03, 0.9, 1], [0, 1, 1, 0]);
    const rotateX = interpolate(tumble.value, [0, 1], [-58, 55]);
    const rotateY = interpolate(tumble.value, [0, 1], [-22, 18]);
    const scaleX = interpolate(tumble.value, [0, 0.5, 1], [1, 0.7, 1]);

    return {
      transform: [
        { perspective: 750 },
        { translateY: y },
        { translateX: xDrift },
        { rotate: `${spin.value}deg` },
        { rotateX: `${rotateX}deg` },
        { rotateY: `${rotateY}deg` },
        { scaleX },
      ],
      opacity,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: chip.x, top: 0 }, style]}>
      <GoldSpadeChip size={chip.size} />
    </Animated.View>
  );
}

export function FallingChips({ count = 12 }: { count?: number }) {
  const chips = useMemo<ChipSpec[]>(() => {
    return Array.from({ length: count }, (_, id) => ({
      id,
      x: 6 + ((id * 79) % Math.max(SCREEN_W - 70, 40)),
      size: 44 + (id % 4) * 6,
      delay: (id * 280) % 3600,
      duration: 4300 + (id % 5) * 700,
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
