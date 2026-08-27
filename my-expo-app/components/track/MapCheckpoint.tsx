import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MAP_NODE_SIZE, type StageStatus } from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const HIT = Platform.select({ ios: 44, android: 48, default: 44 }) ?? 44;

type Props = {
  number: number;
  title: string;
  status: StageStatus;
  onPress: () => void;
};

export function MapCheckpoint({ number, title, status, onPress }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(pulse);
    if (status !== 'current' || reducedMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 720 }), withTiming(1, { duration: 720 })),
      -1,
      true
    );
    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse, reducedMotion, status]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * press.value }],
  }));

  const fill =
    status === 'completed'
      ? artStyle.colors.feltGreen
      : status === 'current'
        ? artStyle.colors.goldBright
        : artStyle.colors.tealFaded;
  const border =
    status === 'current' ? artStyle.colors.cream : status === 'completed' ? artStyle.colors.gold : artStyle.colors.tobacco;
  const labelColor = status === 'current' ? artStyle.colors.projectorBlack : artStyle.colors.cream;
  const locked = status === 'locked';

  return (
    <View style={[styles.wrap, locked && styles.lockedWrap]}>
      {status === 'current' ? (
        <View style={styles.startFlag} pointerEvents="none" accessibilityElementsHidden>
          <Text style={[styles.startText, display]}>PRESS TO PLAY</Text>
        </View>
      ) : null}
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
        hitSlop={8}
        style={[styles.node, { backgroundColor: fill, borderColor: border, opacity: locked ? 0.62 : 1 }, nodeStyle]}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        accessibilityLabel={
          locked ? `${title}, locked` : status === 'completed' ? `${title}, completed` : `${title}, start`
        }>
        <Text style={[styles.number, display, { color: labelColor }]}>{number}</Text>
        {locked ? (
          <View style={styles.lock} accessibilityElementsHidden>
            <View style={styles.shackle} />
          </View>
        ) : null}
      </AnimatedPressable>
      <Text style={styles.caption} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: MAP_NODE_SIZE,
    alignItems: 'center',
  },
  lockedWrap: {
    opacity: 0.92,
  },
  startFlag: {
    position: 'absolute',
    top: -22,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: artStyle.colors.goldBright,
    borderWidth: 1.5,
    borderColor: artStyle.colors.tobacco,
    zIndex: 2,
  },
  startText: {
    color: artStyle.colors.projectorBlack,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  node: {
    width: MAP_NODE_SIZE,
    height: MAP_NODE_SIZE,
    minWidth: HIT,
    minHeight: HIT,
    borderRadius: MAP_NODE_SIZE / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 22,
    letterSpacing: 1,
  },
  caption: {
    marginTop: 4,
    color: artStyle.colors.cream,
    fontSize: 11,
    textAlign: 'center',
    textShadowColor: 'rgba(17,23,20,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lock: {
    position: 'absolute',
    bottom: 6,
    width: 12,
    height: 9,
    borderRadius: 2,
    backgroundColor: artStyle.colors.gold,
    borderWidth: 1,
    borderColor: artStyle.colors.tobacco,
    alignItems: 'center',
  },
  shackle: {
    position: 'absolute',
    top: -5,
    width: 7,
    height: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: artStyle.colors.gold,
  },
});
