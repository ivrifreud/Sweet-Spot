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
  const pulse = useSharedValue(0);
  const press = useSharedValue(1);

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

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -pulse.value * 2 },
      { scaleX: (1 - pulse.value * 0.035) * press.value },
      { scaleY: (1 + pulse.value * 0.06) * press.value },
    ],
  }));

  const outerFill =
    status === 'completed'
      ? artStyle.colors.tobacco
      : status === 'current'
        ? artStyle.colors.gold
        : artStyle.colors.projectorBlack;
  const centerFill =
    status === 'completed'
      ? artStyle.colors.gold
      : status === 'current'
        ? artStyle.colors.goldBright
        : artStyle.colors.tealFaded;
  const ring =
    status === 'current'
      ? artStyle.colors.cream
      : status === 'completed'
        ? artStyle.colors.gold
        : artStyle.colors.tobacco;
  const labelColor = status === 'current' ? artStyle.colors.projectorBlack : artStyle.colors.cream;
  const edgeInsert = status === 'locked' ? artStyle.colors.tobacco : artStyle.colors.cream;
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
        style={[
          styles.node,
          { backgroundColor: outerFill, borderColor: ring, opacity: locked ? 0.56 : 1 },
          nodeStyle,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        accessibilityLabel={
          locked
            ? `${title}, locked`
            : status === 'completed'
              ? `${title}, completed`
              : `${title}, start`
        }>
        <View style={[styles.edgeInsert, styles.edgeTop, { backgroundColor: edgeInsert }]} />
        <View style={[styles.edgeInsert, styles.edgeRight, { backgroundColor: edgeInsert }]} />
        <View style={[styles.edgeInsert, styles.edgeBottom, { backgroundColor: edgeInsert }]} />
        <View style={[styles.edgeInsert, styles.edgeLeft, { backgroundColor: edgeInsert }]} />
        <View style={[styles.innerRing, { borderColor: ring }]}>
          <View style={[styles.chipCenter, { backgroundColor: centerFill, borderColor: ring }]}>
            <Text style={[styles.number, display, { color: labelColor }]}>{number}</Text>
            {locked ? (
              <View style={styles.lock} accessibilityElementsHidden>
                <View style={styles.shackle} />
              </View>
            ) : null}
          </View>
        </View>
      </AnimatedPressable>
      <Text style={styles.caption} numberOfLines={2}>
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
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  edgeInsert: {
    position: 'absolute',
  },
  edgeTop: {
    top: -1,
    width: 18,
    height: 9,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  edgeRight: {
    right: -1,
    width: 9,
    height: 18,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  edgeBottom: {
    bottom: -1,
    width: 18,
    height: 9,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  edgeLeft: {
    left: -1,
    width: 9,
    height: 18,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  innerRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: artStyle.colors.projectorBlack,
  },
  chipCenter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 21,
    letterSpacing: 1,
  },
  caption: {
    marginTop: 4,
    marginLeft: (MAP_NODE_SIZE - 104) / 2,
    width: 104,
    color: artStyle.colors.cream,
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lock: {
    position: 'absolute',
    bottom: 2,
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
