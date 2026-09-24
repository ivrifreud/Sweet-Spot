import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  MAP_NODE_CHIP_SIZE,
  stageProgressPercent,
  type StageStatus,
} from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapNodeMedallion, MAP_NODE_RING_SIZE } from './MapNodeMedallion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const HIT = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;

type Props = {
  title: string;
  status: StageStatus;
  spotsCompleted: number;
  onPress: () => void;
};

export function MapCheckpoint({ title, status, spotsCompleted, onPress }: Props) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const press = useSharedValue(1);
  const shake = useSharedValue(0);
  const [hint, setHint] = useState<string | null>(null);
  const percent = stageProgressPercent(spotsCompleted);
  const locked = status === 'locked';

  useEffect(() => {
    cancelAnimation(pulse);
    if (status !== 'current' || reducedMotion) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 140 }),
        withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 260 })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse, reducedMotion, status]);

  // Uniform scale keeps the status ring a perfect circle while pulsing.
  const nodeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: (1 + pulse.value * 0.03) * press.value },
    ],
  }));

  const accessibilityLabel = locked
    ? `${title}, locked`
    : status === 'completed'
      ? `${title}, completed`
      : `${title}, ${percent}% complete, start`;

  function handlePress() {
    if (locked) {
      setHint('Finish the previous stage first.');
      if (!reducedMotion) {
        shake.value = withSequence(
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-4, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
      return;
    }
    setHint(null);
    onPress();
  }

  return (
    <View style={[styles.wrap, locked && styles.lockedWrap]}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          press.value = withTiming(0.94, { duration: 90 });
        }}
        onPressOut={() => {
          press.value = withSequence(
            withTiming(1.04, { duration: 80 }),
            withSpring(1, { damping: 14, stiffness: 220 })
          );
        }}
        hitSlop={Math.max(8, Math.ceil((HIT - MAP_NODE_CHIP_SIZE) / 2))}
        style={[styles.node, nodeStyle]}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        accessibilityLabel={accessibilityLabel}>
        <MapNodeMedallion status={status} />
      </AnimatedPressable>
      {hint && locked ? (
        <Text style={styles.hint} accessibilityLiveRegion="polite">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: MAP_NODE_RING_SIZE,
    alignItems: 'center',
  },
  lockedWrap: {
    opacity: 0.96,
  },
  node: {
    width: MAP_NODE_RING_SIZE,
    height: MAP_NODE_RING_SIZE + 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 4,
    color: artStyle.colors.cream,
    fontSize: 11,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
