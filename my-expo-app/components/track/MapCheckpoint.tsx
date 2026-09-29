import * as Haptics from 'expo-haptics';
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

import { nodeRingPhase, stageProgressPercent, type StageStatus } from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapNodeMedallion } from './MapNodeMedallion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const HIT = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;

type Props = {
  title: string;
  status: StageStatus;
  spotsCompleted: number;
  chipSize: number;
  ringSize: number;
  labelHeight: number;
  frameWidth: number;
  onPress: () => void;
  onPressIn?: () => void;
};

export function MapCheckpoint({
  title,
  status,
  spotsCompleted,
  chipSize,
  ringSize,
  labelHeight,
  frameWidth,
  onPress,
  onPressIn,
}: Props) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const press = useSharedValue(1);
  const shake = useSharedValue(0);
  const [hint, setHint] = useState<string | null>(null);
  const locked = status === 'locked';
  const phase = nodeRingPhase(status, spotsCompleted);
  const showLabel = phase === 'progress' || phase === 'complete';
  const labelBlock = showLabel ? labelHeight : 0;

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
    transform: [{ translateX: shake.value }, { scale: (1 + pulse.value * 0.03) * press.value }],
  }));

  const accessibilityLabel = locked
    ? `${title}, locked`
    : phase === 'open'
      ? title
      : `${title}, ${stageProgressPercent(phase === 'complete' ? 7 : spotsCompleted)} percent`;

  function handlePress() {
    if (locked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
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

  const hitSlop = Math.max(0, Math.ceil((HIT - ringSize) / 2));

  return (
    <View style={[styles.wrap, { width: frameWidth }, locked && styles.lockedWrap]}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          onPressIn?.();
          if (!locked) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          press.value = reducedMotion ? 0.96 : withTiming(0.92, { duration: 90 });
        }}
        onPressOut={() => {
          press.value = reducedMotion
            ? 1
            : withSequence(
                withTiming(1.05, { duration: 90, easing: Easing.out(Easing.quad) }),
                withSpring(1, { damping: 12, stiffness: 240 })
              );
        }}
        hitSlop={hitSlop}
        style={[styles.node, { width: frameWidth, minHeight: ringSize + labelBlock }, nodeStyle]}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        accessibilityLabel={accessibilityLabel}>
        <MapNodeMedallion
          status={status}
          spotsCompleted={phase === 'complete' ? 7 : spotsCompleted}
          chipSize={chipSize}
          ringSize={ringSize}
          labelHeight={labelHeight}
        />
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
    alignItems: 'center',
  },
  lockedWrap: {
    opacity: 0.96,
  },
  node: {
    alignItems: 'center',
    justifyContent: 'flex-start',
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
