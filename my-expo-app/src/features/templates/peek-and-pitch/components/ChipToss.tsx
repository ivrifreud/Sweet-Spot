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
 * Chips in the air between the player's glove and the pot.
 * Flight is a gravity arc; they settle on the felt without an extra drop shadow.
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

function travelEase(progress: number) {
  'worklet';
  const travel = interpolate(progress, [0, 0.58, 1], [0, 1, 1]);
  return 1 - (1 - travel) * (1 - travel);
}

function FlyingChip({ flight }: { flight: ChipFlight }) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const size = CHIP_SIZE;

  useEffect(() => {
    const duration = reducedMotion ? Math.min(flight.durationMs, 280) : flight.durationMs;
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
    top: flight.from.y - size * 0.55,
  };

  const chipStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const eased = travelEase(p);

    return {
      opacity: interpolate(p, [0, 0.03], [0, 1]),
      transform: [
        { translateX: dx * eased },
        { translateY: dy * eased + hopOffset(p, arc) },
        {
          rotate: `${interpolate(p, [0, 0.58, 1], [0, flight.spin * 140, flight.restRotate])}deg`,
        },
        { scale: interpolate(p, [0, 0.28, 0.58, 1], [1, 1.04, 0.94, 0.88]) },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.chip, origin, chipStyle]}>
      <Chip size={size} rotate={flight.restRotate * 0.15} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    zIndex: 8,
  },
});
