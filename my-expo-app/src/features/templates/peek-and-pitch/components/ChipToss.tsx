import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { CHIP_3Q_ASPECT } from '../../../../../theme/chipArt';
import { ChipSprite } from './ChipSprite';
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
  /** How far the chip peels off the stack before the throw, in pixels. */
  lift: number;
};

type ChipTossProps = {
  flights: ChipFlight[];
  onComplete?: () => void;
};

/** Chip has peeled off the stack. */
const LIFT_END = 0.16;
/** Chip has reached the felt. */
const FLIGHT_END = 0.72;

/**
 * Individual chips in the air between the player's glove and the pot.
 * Each flight is its own chip with a pick-up, gravity arc, and settle bounce.
 */
export function ChipToss({ flights, onComplete }: ChipTossProps) {
  let last = flights[0];
  for (const flight of flights) {
    if (!last || flight.delayMs + flight.durationMs >= last.delayMs + last.durationMs) {
      last = flight;
    }
  }

  return (
    <>
      {flights.map((flight) => (
        <FlyingChip
          key={flight.id}
          flight={flight}
          onLanded={flight.id === last?.id ? onComplete : undefined}
        />
      ))}
    </>
  );
}

/**
 * Normalised arc height, 0 at both ends and 1 at the apex. The apex sits at 40%
 * so the rise decelerates and the fall accelerates — the shape gravity makes.
 */
function arcHeight(t: number) {
  'worklet';
  if (t <= 0 || t >= 1) {
    return 0;
  }
  const apex = 0.4;
  if (t < apex) {
    const u = t / apex;
    return 1 - (1 - u) * (1 - u);
  }
  const u = (t - apex) / (1 - apex);
  return 1 - u * u;
}

/** Height above the felt in px, negative being higher. */
function verticalOffset(progress: number, arc: number, lift: number) {
  'worklet';
  if (progress <= 0) {
    return 0;
  }

  if (progress < LIFT_END) {
    const t = progress / LIFT_END;
    return -lift * (1 - (1 - t) * (1 - t));
  }

  if (progress < FLIGHT_END) {
    const t = (progress - LIFT_END) / (FLIGHT_END - LIFT_END);
    return -lift * (1 - t) - arc * arcHeight(t);
  }

  const u = (progress - FLIGHT_END) / (1 - FLIGHT_END);
  return -arc * 0.1 * (1 - u) * Math.abs(Math.sin(u * Math.PI * 2));
}

/** Fraction of the way from the stack to the pot. */
function travelEase(progress: number) {
  'worklet';
  if (progress <= LIFT_END) {
    return 0;
  }
  const t = Math.min(1, (progress - LIFT_END) / (FLIGHT_END - LIFT_END));
  return 1 - (1 - t) * (1 - t);
}

function FlyingChip({ flight, onLanded }: { flight: ChipFlight; onLanded?: () => void }) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const size = flight.size ?? CHIP_SIZE;
  const landScale = flight.landScale ?? 0.82;

  useEffect(() => {
    const duration = reducedMotion ? Math.min(flight.durationMs, 280) : flight.durationMs;
    const delay = reducedMotion ? 0 : flight.delayMs;
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.linear }, (finished) => {
        if (finished && onLanded) {
          runOnJS(onLanded)();
        }
      })
    );
  }, [flight.delayMs, flight.durationMs, onLanded, progress, reducedMotion]);

  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;
  const arc = reducedMotion ? flight.arc * 0.2 : flight.arc;
  const lift = reducedMotion ? flight.lift * 0.2 : flight.lift;
  const origin = {
    left: flight.from.x - size / 2,
    top: flight.from.y - size * CHIP_3Q_ASPECT * 0.5,
  };

  const chipStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const eased = travelEase(p);

    return {
      opacity: interpolate(p, [0, 0.03, 1], [0, 1, 1]),
      transform: [
        { translateX: dx * eased },
        { translateY: dy * eased + verticalOffset(p, arc, lift) },
        {
          rotate: `${interpolate(p, [0, LIFT_END, FLIGHT_END, 1], [0, flight.spin * 12, flight.spin * 170, flight.restRotate])}deg`,
        },
        { scale: interpolate(p, [0, LIFT_END, FLIGHT_END, 1], [1, 1.1, 0.94, landScale]) },
        { scaleY: interpolate(p, [FLIGHT_END, 1], [1, 0.62]) },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const height = -verticalOffset(p, arc, lift);
    const closeness = 1 - Math.min(1, height / Math.max(arc, 1));

    return {
      opacity: interpolate(p, [0, 0.05, 1], [0, 0.6, 0.68]) * (0.3 + closeness * 0.7),
      transform: [
        { translateX: dx * travelEase(p) },
        { translateY: dy * travelEase(p) },
        { scale: 0.5 + closeness * 0.55 },
      ],
    };
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shadow,
          {
            left: origin.left,
            top: flight.from.y - size * 0.14,
            width: size,
            height: size * 0.28,
          },
          shadowStyle,
        ]}
      />
      <Animated.View pointerEvents="none" style={[styles.chip, origin, chipStyle]}>
        <ChipSprite size={size} view="threeQuarter" rotate={flight.restRotate * 0.12} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    zIndex: 8,
  },
  shadow: {
    position: 'absolute',
    zIndex: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(10,14,12,0.5)',
  },
});
