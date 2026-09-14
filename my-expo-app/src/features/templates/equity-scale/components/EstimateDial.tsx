/* eslint-disable react-hooks/immutability -- Gesture worklets update Reanimated SharedValues. */
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type AccessibilityActionEvent,
} from 'react-native';
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
import {
  DIAL_GLOVE_SLEEVE,
  SLEEVE_ANCHOR_X_FROM_CENTER,
  dialGlovePose,
  gripAngleForRotation,
  rimPoint,
} from './dialGloveLayout';

const REST = require('../../../../../assets/tables/hero-glove-rest.png');
const REST_SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

const DIAL_SIZE = 168;
const DIAL_CENTER = DIAL_SIZE / 2;
const RIM_RADIUS = DIAL_SIZE * 0.47;
const ANCHOR_Y_PAST_BOTTOM = 17;
const GLOVE_SCALE = 0.85;
const FLICK_DEG_PER_SEC = 80;

type Props = {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  accessibilityLabel: string;
  enabled: boolean;
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
  onChange,
  onAdjustStart,
  onAdjustEnd,
}: Props) {
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const stackRef = useRef<View>(null);
  const rotation = useSharedValue(valueToDialAngle(value, min, max));
  const lastX = useSharedValue(DIAL_CENTER);
  const lastY = useSharedValue(0);
  const lastEmitted = useSharedValue(value);
  const dragging = useSharedValue(0);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const ready = useSharedValue(0);
  const screenH = useSharedValue(viewportHeight);
  const minValue = useSharedValue(min);
  const maxValue = useSharedValue(max);

  const measureDial = () => {
    stackRef.current?.measureInWindow((x, y) => {
      originX.value = x;
      originY.value = y;
      ready.value = 1;
    });
  };

  useEffect(() => {
    screenH.value = viewportHeight;
    requestAnimationFrame(measureDial);
  }, [viewportHeight, viewportWidth]);

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

  const emitValue = useCallback((next: number) => {
    if (!enabled) return;
    onChangeRef.current(next);
    tickHaptic();
  }, [enabled]);

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
          const next = rotationAfterFingerMove({
            rotation: rotation.value,
            lastX: lastX.value,
            lastY: lastY.value,
            x: event.x,
            y: event.y,
            centerX: DIAL_CENTER,
            centerY: DIAL_CENTER,
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
          const rx = event.x - DIAL_CENTER;
          const ry = event.y - DIAL_CENTER;
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

  const dialStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 50%',
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const gloveStyle = useAnimatedStyle(() => {
    const centerX = originX.value + DIAL_SIZE / 2;
    const centerY = originY.value + DIAL_SIZE / 2;
    const pose = dialGlovePose({
      anchor: {
        x: centerX + SLEEVE_ANCHOR_X_FROM_CENTER,
        y: screenH.value + ANCHOR_Y_PAST_BOTTOM,
      },
      contact: rimPoint(centerX, centerY, RIM_RADIUS, gripAngleForRotation(rotation.value)),
      scale: GLOVE_SCALE,
    });
    return {
      opacity: ready.value,
      left: pose.left - originX.value,
      top: pose.top - originY.value,
      width: pose.width,
      height: pose.height,
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
      <Text style={styles.label}>{label}</Text>
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
          style={styles.hitTarget}>
          <View ref={stackRef} collapsable={false} onLayout={measureDial} style={styles.dialStack}>
            <Animated.View style={[styles.dialPivot, dialStyle]}>
              <Image
                source={equityScaleArt.dial}
                resizeMode="contain"
                style={styles.dialArt}
              />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              style={[styles.glove, gloveStyle]}>
              <Image source={REST_SHADOW} resizeMode="contain" style={styles.gloveLayer} />
              <Image source={REST} resizeMode="contain" style={styles.gloveLayer} />
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
  label: {
    color: artStyle.colors.cream,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: 'uppercase',
    zIndex: 6,
  },
  hitTarget: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  dialStack: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  dialPivot: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    transformOrigin: '50% 50%',
    zIndex: 1,
  },
  dialArt: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
  },
  glove: {
    position: 'absolute',
    zIndex: 2,
    overflow: 'visible',
    transformOrigin: `${DIAL_GLOVE_SLEEVE.x * 100}% ${DIAL_GLOVE_SLEEVE.y * 100}%`,
  },
  gloveLayer: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
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
