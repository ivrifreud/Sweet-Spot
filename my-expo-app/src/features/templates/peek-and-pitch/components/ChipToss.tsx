import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Chip, CHIP_ART_ASPECT } from './Chip';
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
  /** Rendered diameter; defaults to the in-scene chip size. */
  size?: number;
  /** Landing scale on the felt plane (smaller toward the pot). */
  landScale?: number;
};

type ChipTossProps = {
  flights: ChipFlight[];
};

/**
 * Individual chips in the air between the player's glove and the pot.
 * Each flight is its own cel chip with a gravity arc and a short settle bounce.
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

  const flightEnd = 0.62;
  if (progress < flightEnd) {
    const t = progress / flightEnd;
    return -arc * 4 * t * (1 - t);
  }

  const u = (progress - flightEnd) / (1 - flightEnd);
  return -arc * 0.18 * (1 - u) * (1 - u) * Math.abs(Math.sin(u * Math.PI * 2.4));
}

function travelEase(progress: number) {
  'worklet';
  const travel = interpolate(progress, [0, 0.62, 1], [0, 1, 1]);
  return 1 - (1 - travel) * (1 - travel);
}

function FlyingChip({ flight }: { flight: ChipFlight }) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const size = flight.size ?? CHIP_SIZE;
  const landScale = flight.landScale ?? 0.82;

  useEffect(() => {
    const duration = reducedMotion ? Math.min(flight.durationMs, 280) : flight.durationMs;
    progress.value = 0;
    progress.value = withDelay(
      reducedMotion ? 0 : flight.delayMs,
      withTiming(1, { duration, easing: Easing.linear })
    );
  }, [flight.delayMs, flight.durationMs, progress, reducedMotion]);

  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;
  const arc = reducedMotion ? flight.arc * 0.2 : flight.arc;
  const origin = {
    left: flight.from.x - size / 2,
    top: flight.from.y - size * CHIP_ART_ASPECT * 0.45,
  };

  const chipStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const eased = travelEase(p);

    return {
      opacity: interpolate(p, [0, 0.04, 0.92, 1], [0, 1, 1, 1]),
      transform: [
        { translateX: dx * eased },
        { translateY: dy * eased + hopOffset(p, arc) },
        {
          rotate: `${interpolate(p, [0, 0.62, 1], [0, flight.spin * 160, flight.restRotate])}deg`,
        },
        {
          scale: interpolate(p, [0, 0.3, 0.62, 1], [1, 1.06, 0.92, landScale]),
        },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.chip, origin, chipStyle]}>
      <Chip size={size} rotate={flight.restRotate * 0.12} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    zIndex: 8,
  },
});
