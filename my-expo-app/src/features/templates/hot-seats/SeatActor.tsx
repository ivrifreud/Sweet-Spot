import { StyleSheet } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { railPoint, slotForSeat } from './seatRail';
import { BowedSeat } from './BowedSeat';
import type { SpotDecision } from '../peek-and-pitch/types';

type SeatActorProps = {
  seatIndex: number;
  stack: number;
  position: string;
  action: SpotDecision | null;
  progress: SharedValue<number>;
  activeIndex: SharedValue<number>;
};

export function SeatActor({
  seatIndex,
  stack,
  position,
  action,
  progress,
  activeIndex,
}: SeatActorProps) {
  const style = useAnimatedStyle(() => {
    const slot = slotForSeat(seatIndex, activeIndex.value);
    const point = railPoint(slot, progress.value);
    const arriving = slot === 1 ? 1 - Math.max(0, progress.value - 0.62) / 0.38 : 1;
    return {
      opacity: slot === 0 ? 0 : arriving,
      transform: [{ translateX: point.x }, { translateY: point.y }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.actor, style]}>
      <BowedSeat stack={stack} position={position} action={action} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actor: {
    position: 'absolute',
    left: '50%',
    top: '42%',
    marginLeft: -48,
  },
});
