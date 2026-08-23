import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Chip } from './Chip';
import { CHIP_SIZE } from './ChipStack';

export type ChipFlight = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  delayMs: number;
  durationMs: number;
  /** Peak height of the first hop, in pixels. */
  arc: number;
  spin: number;
  restRotate: number;
};

type ChipTossProps = {
  flights: ChipFlight[];
};

/**
 * Chips in the air between the player's stack and the pot.
 * Flight is a gravity arc; landing is two decaying bounces, then they stay put.
 */
export function ChipToss({ flights }: ChipTossProps) {
  return (
    <>
      {flights.map((flight) => (
        <FlyingChip key={flight.id} flight={flight} />
      ))}
    </>
  );
}

function hopOffset(progress: number, arc: number) {
  'worklet';
  if (progress <= 0 || progress >= 1) {
    return 0;
  }

  const flightEnd = 0.58;
  if (progress < flightEnd) {
    const t = progress / flightEnd;
    return -arc * 4 * t * (1 - t);
  }

  const u = (progress - flightEnd) / (1 - flightEnd);
  return -arc * 0.22 * (1 - u) * (1 - u) * Math.abs(Math.sin(u * Math.PI * 2.2));
}

function FlyingChip({ flight }: { flight: ChipFlight }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      flight.delayMs,
      withTiming(1, { duration: flight.durationMs, easing: Easing.linear })
    );
  }, [flight.delayMs, flight.durationMs, progress]);

  const size = CHIP_SIZE * 0.92;
  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;
  const arc = flight.arc;

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const travel = interpolate(p, [0, 0.58, 1], [0, 1, 1]);
    const eased = 1 - (1 - travel) * (1 - travel);

    return {
      opacity: interpolate(p, [0, 0.05], [0, 1]),
      transform: [
        { translateX: dx * eased },
        { translateY: dy * eased + hopOffset(p, arc) },
        {
          rotate: `${interpolate(p, [0, 0.58, 1], [0, flight.spin * 220, flight.restRotate])}deg`,
        },
        { scale: interpolate(p, [0, 0.58, 0.72, 1], [1, 0.78, 0.84, 0.8]) },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const hop = Math.abs(hopOffset(p, arc));

    return {
      opacity: interpolate(p, [0, 0.08, 1], [0, 0.35, 0.7]),
      transform: [
        { translateY: interpolate(p, [0, 1], [8, 18]) + hop * 0.15 },
        { scaleX: interpolate(hop, [0, arc], [1, 0.55]) },
        { scaleY: 0.35 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chip,
        {
          left: flight.from.x - size / 2,
          top: flight.from.y - size * 0.55,
        },
        style,
      ]}>
      <Animated.View style={[styles.groundShadow, { width: size * 0.9, height: size * 0.35 }, shadowStyle]} />
      <Chip size={size} rotate={flight.restRotate * 0.2} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
  },
  groundShadow: {
    position: 'absolute',
    left: '8%',
    bottom: 2,
    borderRadius: 999,
    backgroundColor: '#000',
  },
});
