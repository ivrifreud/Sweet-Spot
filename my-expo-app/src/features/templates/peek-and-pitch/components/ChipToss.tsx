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

import { Chip, type ChipTone } from './Chip';
import { CHIP_FLATTEN, CHIP_SIZE } from './ChipStack';

export type ChipFlight = {
  id: string;
  tone: ChipTone;
  from: { x: number; y: number };
  to: { x: number; y: number };
  delayMs: number;
  durationMs: number;
  /** Height of the toss, in pixels. Varied per chip so the push does not look rigid. */
  arc: number;
  spin: number;
};

type ChipTossProps = {
  flights: ChipFlight[];
};

/** Chips in flight between the player's stack and the pot. They stay where they land. */
export function ChipToss({ flights }: ChipTossProps) {
  return (
    <>
      {flights.map((flight) => (
        <FlyingChip key={flight.id} flight={flight} />
      ))}
    </>
  );
}

function FlyingChip({ flight }: { flight: ChipFlight }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      flight.delayMs,
      withTiming(1, { duration: flight.durationMs, easing: Easing.out(Easing.cubic) })
    );
  }, [flight.delayMs, flight.durationMs, progress]);

  const size = CHIP_SIZE * 0.85;
  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;
  const arc = flight.arc;

  const style = useAnimatedStyle(() => {
    const p = progress.value;

    return {
      opacity: interpolate(p, [0, 0.06], [0, 1]),
      transform: [
        { translateX: dx * p },
        { translateY: dy * p - arc * Math.sin(Math.PI * p) },
        { rotate: `${flight.spin * 160 * p}deg` },
        // Chips shrink as they travel away from the player's eye line.
        { scale: 1 - 0.28 * p },
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
          top: flight.from.y - (size * CHIP_FLATTEN) / 2,
        },
        style,
      ]}>
      <Chip tone={flight.tone} size={size} flatten={CHIP_FLATTEN} cap />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
  },
});
