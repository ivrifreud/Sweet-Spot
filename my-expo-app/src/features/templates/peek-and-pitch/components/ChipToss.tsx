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
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    );
  }, [flight.delayMs, progress]);

  const size = CHIP_SIZE * 0.62;
  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;
  const arc = Math.max(60, Math.abs(dy) * 0.35);

  const style = useAnimatedStyle(() => {
    const p = progress.value;

    return {
      opacity: interpolate(p, [0, 0.06], [0, 1]),
      transform: [
        { translateX: dx * p },
        { translateY: dy * p - arc * Math.sin(Math.PI * p) },
        { rotate: `${flight.spin * 200 * p}deg` },
        { scale: 1 - 0.4 * p },
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
      <Chip tone={flight.tone} size={size} flatten={CHIP_FLATTEN} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
  },
});
