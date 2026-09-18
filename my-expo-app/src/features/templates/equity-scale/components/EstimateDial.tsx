/* eslint-disable react-hooks/immutability, react-hooks/refs -- Gesture worklets update Reanimated SharedValues and callback refs. */
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, Text, View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { startDialSfx, stopDialSfx } from '../../../../../lib/audio';
import { artStyle } from '../../../../../theme/artStyle';
import {
  DIAL_CENTER_DEADZONE_PX,
  DIAL_MAX_DEG,
  DIAL_MIN_DEG,
  dialAngleToValue,
  dialIsSpinning,
  rotationAfterFingerMove,
  valueToDialAngle,
} from '../dialMath';
import { equityScaleArt } from '../equityScaleArt';
import { EQUITY_PHONE_LAYOUT } from '../tableLayout';
import { DIAL_GLOVE_CONTACT, DIAL_PIVOT_ORIGIN, dialHandPose } from './dialGloveLayout';

const FLICK_DEG_PER_SEC = 80;
const PIVOT = `${DIAL_PIVOT_ORIGIN.x * 100}% ${DIAL_PIVOT_ORIGIN.y * 100}%`;
const HAND_ORIGIN = {
  transformOrigin: `${DIAL_GLOVE_CONTACT.x * 100}% ${DIAL_GLOVE_CONTACT.y * 100}%`,
} as const;

type Props = {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  accessibilityLabel: string;
  enabled: boolean;
  size?: number;
  onChange: (value: number) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
};

function tickHaptic() {
  Haptics.selectionAsync().catch(() => {});
}

export function EstimateDial({
  value,
  min,
  max,
  unit,
  label,
  accessibilityLabel,
  enabled,
  size = EQUITY_PHONE_LAYOUT.dialSize,
  onChange,
  onAdjustStart,
  onAdjustEnd,
}: Props) {
  const rotation = useSharedValue(valueToDialAngle(value, min, max));
  const lastX = useSharedValue(size / 2);
  const lastY = useSharedValue(0);
  const lastEmitted = useSharedValue(value);
  const dragging = useSharedValue(0);
  const minValue = useSharedValue(min);
  const maxValue = useSharedValue(max);
  const dialSize = useSharedValue(size);

  useEffect(() => {
    dialSize.value = size;
  }, [dialSize, size]);

  useEffect(() => {
    minValue.value = min;
    maxValue.value = max;
  }, [max, maxValue, min, minValue]);

  useEffect(() => {
    if (dragging.value) return;
    rotation.value = withTiming(valueToDialAngle(value, min, max), { duration: 90 });
    lastEmitted.value = value;
  }, [dragging, lastEmitted, max, min, rotation, value]);

  const onChangeRef = useRef(onChange);
  const onAdjustStartRef = useRef(onAdjustStart);
  const onAdjustEndRef = useRef(onAdjustEnd);
  onChangeRef.current = onChange;
  onAdjustStartRef.current = onAdjustStart;
  onAdjustEndRef.current = onAdjustEnd;

  const emitValue = useCallback(
    (next: number) => {
      if (!enabled) return;
      onChangeRef.current(next);
      tickHaptic();
    },
    [enabled]
  );

  const finishAdjust = useCallback((next: number) => {
    onChangeRef.current(next);
    onAdjustEndRef.current();
  }, []);

  const beginAdjust = useCallback(() => {
    onAdjustStartRef.current();
  }, []);

  const endAdjust = useCallback(() => {
    onAdjustEndRef.current();
  }, []);

  const soundingRef = useRef(false);
  const lastSpinAtRef = useRef(0);

  const syncDialSound = useCallback((spinning: boolean) => {
    const now = Date.now();
    if (spinning) {
      lastSpinAtRef.current = now;
      if (!soundingRef.current) {
        soundingRef.current = true;
        startDialSfx();
      }
      return;
    }
    if (soundingRef.current && now - lastSpinAtRef.current > 80) {
      soundingRef.current = false;
      stopDialSfx();
    }
  }, []);

  const haltDialSound = useCallback(() => {
    soundingRef.current = false;
    lastSpinAtRef.current = 0;
    stopDialSfx();
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .minDistance(0)
        .maxPointers(1)
        .hitSlop(24)
        .shouldCancelWhenOutside(false)
        .onBegin((event) => {
          dragging.value = 1;
          lastX.value = event.x;
          lastY.value = event.y;
          lastEmitted.value = dialAngleToValue(rotation.value, minValue.value, maxValue.value);
          runOnJS(beginAdjust)();
        })
        .onUpdate((event) => {
          const hub = dialSize.value / 2;
          const next = rotationAfterFingerMove({
            rotation: rotation.value,
            lastX: lastX.value,
            lastY: lastY.value,
            x: event.x,
            y: event.y,
            centerX: hub,
            centerY: hub,
          });
          lastX.value = event.x;
          lastY.value = event.y;
          rotation.value = next.rotation;
          runOnJS(syncDialSound)(dialIsSpinning(next.deltaDeg));
          const nextValue = dialAngleToValue(next.rotation, minValue.value, maxValue.value);
          if (nextValue !== lastEmitted.value) {
            lastEmitted.value = nextValue;
            runOnJS(emitValue)(nextValue);
          }
        })
        .onEnd((event) => {
          runOnJS(haltDialSound)();
          const hub = dialSize.value / 2;
          const rx = event.x - hub;
          const ry = event.y - hub;
          const radiusSq = rx * rx + ry * ry;
          const omegaDeg =
            radiusSq < DIAL_CENTER_DEADZONE_PX * DIAL_CENTER_DEADZONE_PX
              ? 0
              : ((rx * event.velocityY - ry * event.velocityX) / radiusSq) * (180 / Math.PI);
          const snapToDetent = () => {
            dragging.value = 0;
            const snappedValue = dialAngleToValue(rotation.value, minValue.value, maxValue.value);
            const snappedAngle = valueToDialAngle(snappedValue, minValue.value, maxValue.value);
            rotation.value = withSpring(snappedAngle, { damping: 18, stiffness: 220, mass: 0.7 });
            lastEmitted.value = snappedValue;
            runOnJS(finishAdjust)(snappedValue);
          };
          if (Math.abs(omegaDeg) < FLICK_DEG_PER_SEC) {
            snapToDetent();
            return;
          }
          rotation.value = withDecay(
            {
              velocity: omegaDeg,
              clamp: [DIAL_MIN_DEG, DIAL_MAX_DEG],
              deceleration: 0.992,
            },
            (finished) => {
              if (finished) {
                snapToDetent();
                return;
              }
              dragging.value = 0;
              runOnJS(endAdjust)();
            }
          );
        })
        .onFinalize(() => {
          runOnJS(haltDialSound)();
        }),
    [
      beginAdjust,
      dialSize,
      dragging,
      emitValue,
      enabled,
      endAdjust,
      finishAdjust,
      haltDialSound,
      lastEmitted,
      lastX,
      lastY,
      maxValue,
      minValue,
      rotation,
      syncDialSound,
    ]
  );

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handStyle = useAnimatedStyle(() => {
    const pose = dialHandPose(rotation.value, dialSize.value);
    return {
      width: pose.width,
      height: pose.height,
      left: pose.left,
      top: pose.top,
      transform: [{ rotate: `${pose.rotateDeg}deg` }],
    };
  });

  const adjust = (delta: number) => {
    if (!enabled) return;
    onChange(Math.min(max, Math.max(min, value + delta)));
    onAdjustEnd();
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    adjust(event.nativeEvent.actionName === 'increment' ? 1 : -1);
  };

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          collapsable={false}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min, max, now: value, text: `${value} ${unit}` }}
          accessibilityActions={[
            { name: 'increment', label: 'Increase' },
            { name: 'decrement', label: 'Decrease' },
          ]}
          onAccessibilityAction={onAccessibilityAction}
          style={[styles.hitTarget, { width: size, height: size }]}>
          <View collapsable={false} style={[styles.dialStack, { width: size, height: size }]}>
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              style={[styles.handDock, styles.handBack, HAND_ORIGIN, handStyle]}>
              <Animated.Image
                source={equityScaleArt.dialHand.pinchBack}
                resizeMode="contain"
                style={styles.handArt}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.spinLayer,
                { width: size, height: size, transformOrigin: PIVOT },
                spinStyle,
              ]}>
              <Image
                source={equityScaleArt.dial}
                resizeMode="cover"
                style={{ width: size, height: size }}
                accessibilityLabel={label}
              />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              style={[styles.handDock, styles.handFront, HAND_ORIGIN, handStyle]}>
              <Animated.Image
                source={equityScaleArt.dialHand.pinchFront}
                resizeMode="contain"
                style={styles.handArt}
              />
            </Animated.View>
            <View pointerEvents="none" style={styles.valuePlate}>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.valueUnit}>{unit}</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    overflow: 'visible',
  },
  hitTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  dialStack: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  spinLayer: {
    transformOrigin: PIVOT,
    zIndex: 1,
  },
  handDock: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  handBack: {
    zIndex: 0,
  },
  handFront: {
    zIndex: 2,
  },
  handArt: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  valuePlate: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  value: {
    color: artStyle.colors.cream,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '900',
  },
  valueUnit: {
    color: artStyle.colors.cream,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
