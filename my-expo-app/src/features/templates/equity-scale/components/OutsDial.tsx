/* eslint-disable react-hooks/immutability -- Gesture worklets update Reanimated SharedValues. */
import { useEffect, useMemo } from 'react';
import { Image, StyleSheet, Text, View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { artStyle } from '../../../../../theme/artStyle';
import { outsToDialAngle } from '../dialMath';
import { equityScaleArt } from '../equityScaleArt';
import { EQUITY_STRINGS } from '../strings';

const DIAL_SIZE = 138;
const POINTS_PER_OUT = 11;

type Props = {
  value: number;
  enabled: boolean;
  onChange: (value: number) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
};

function clampWorklet(value: number): number {
  'worklet';
  return Math.min(20, Math.max(0, Math.round(value)));
}

export function OutsDial({ value, enabled, onChange, onAdjustStart, onAdjustEnd }: Props) {
  const start = useSharedValue(value);
  const rotation = useSharedValue(outsToDialAngle(value));

  useEffect(() => {
    rotation.value = withTiming(outsToDialAngle(value), { duration: 90 });
  }, [rotation, value]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .minDistance(2)
        .maxPointers(1)
        .onBegin(() => {
          start.value = value;
          runOnJS(onAdjustStart)();
        })
        .onUpdate((event) => {
          const next = clampWorklet(
            start.value + (event.translationX - event.translationY) / POINTS_PER_OUT
          );
          rotation.value = -135 + (next / 20) * 270;
          runOnJS(onChange)(next);
        })
        .onFinalize(() => {
          runOnJS(onAdjustEnd)();
        }),
    [enabled, onAdjustEnd, onAdjustStart, onChange, rotation, start, value]
  );

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const adjust = (delta: number) => {
    if (!enabled) return;
    onChange(Math.min(20, Math.max(0, value + delta)));
    onAdjustEnd();
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    adjust(event.nativeEvent.actionName === 'increment' ? 1 : -1);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{EQUITY_STRINGS.dialLabel}</Text>
      <GestureDetector gesture={gesture}>
        <Animated.View
          collapsable={false}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Outs dial"
          accessibilityValue={{ min: 0, max: 20, now: value, text: `${value} outs` }}
          accessibilityActions={[
            { name: 'increment', label: 'Add one out' },
            { name: 'decrement', label: 'Remove one out' },
          ]}
          onAccessibilityAction={onAccessibilityAction}
          style={styles.hitTarget}>
          <Animated.Image
            source={equityScaleArt.dial}
            resizeMode="contain"
            style={[styles.dial, dialStyle]}
          />
          <Image
            source={equityScaleArt.gloveGrip}
            resizeMode="contain"
            style={styles.glove}
            accessibilityElementsHidden
          />
          <View pointerEvents="none" style={styles.valuePlate}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.valueUnit}>OUTS</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: DIAL_SIZE + 24,
  },
  label: {
    color: artStyle.colors.cream,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  hitTarget: {
    width: DIAL_SIZE + 24,
    height: DIAL_SIZE + 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
  },
  glove: {
    position: 'absolute',
    width: 62,
    height: 62,
    right: -2,
    bottom: 2,
    transform: [{ rotate: '-22deg' }],
  },
  valuePlate: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: artStyle.colors.goldBright,
    borderColor: '#171713',
    borderWidth: 3,
  },
  value: {
    color: '#171713',
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '900',
  },
  valueUnit: {
    color: '#171713',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
