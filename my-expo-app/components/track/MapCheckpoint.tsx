import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect } from 'react';
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
  MAP_NODE_CAPTION_WIDTH,
  MAP_NODE_CHIP_HEIGHT,
  MAP_NODE_CHIP_SIZE,
  stageProgressPercent,
  type StageStatus,
} from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapNodeMedallion } from './MapNodeMedallion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const HIT = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;

type Props = {
  number: number;
  title: string;
  status: StageStatus;
  spotsCompleted: number;
  onPress: () => void;
};

export function MapCheckpoint({ number, title, status, spotsCompleted, onPress }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const press = useSharedValue(1);
  const percent = stageProgressPercent(spotsCompleted);
  const locked = status === 'locked';
  const completed = status === 'completed';
  const percentColor = completed ? artStyle.colors.feltGreen : artStyle.colors.goldBright;

  useEffect(() => {
    cancelAnimation(pulse);
    if (status !== 'current' || reducedMotion) {
      pulse.value = 0;
      return;
    }
    // Soft scale pulse only — no lift, so the chip stays seated on the path.
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

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: (1 + pulse.value * 0.03) * press.value },
      { scaleY: (1 + pulse.value * 0.02) * press.value },
    ],
  }));

  const accessibilityLabel = locked
    ? `${title}, locked`
    : status === 'completed'
      ? `${title}, completed`
      : `${title}, ${percent}% complete, start`;

  return (
    <View style={[styles.wrap, locked && styles.lockedWrap]}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          press.value = withTiming(0.94, { duration: 90 });
        }}
        onPressOut={() => {
          press.value = withSequence(
            withTiming(1.04, { duration: 80 }),
            withSpring(1, { damping: 14, stiffness: 220 })
          );
        }}
        disabled={false}
        hitSlop={12}
        style={[styles.node, nodeStyle, locked && styles.lockedNode]}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        accessibilityLabel={accessibilityLabel}>
        <MapNodeMedallion number={number} status={status} />
      </AnimatedPressable>
      {!locked ? (
        <Text style={[styles.percent, display, { color: percentColor }]}>{`${percent}%`}</Text>
      ) : null}
      <Text style={styles.caption} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: MAP_NODE_CAPTION_WIDTH,
    alignItems: 'center',
  },
  lockedWrap: {
    opacity: 0.92,
  },
  node: {
    width: Math.max(HIT, MAP_NODE_CHIP_SIZE),
    height: Math.max(HIT, MAP_NODE_CHIP_HEIGHT),
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedNode: {
    opacity: 0.88,
  },
  percent: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.6,
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  caption: {
    marginTop: 1,
    width: MAP_NODE_CAPTION_WIDTH,
    color: artStyle.colors.cream,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
