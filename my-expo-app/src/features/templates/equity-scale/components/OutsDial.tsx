/* eslint-disable react-hooks/immutability -- Gesture worklets update Reanimated SharedValues. */
import { useEffect, useMemo, useRef } from 'react';
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
  withTiming,
} from 'react-native-reanimated';

import { artStyle } from '../../../../../theme/artStyle';
import { DIAL_MAX_DEG, DIAL_MIN_DEG, outsToDialAngle } from '../dialMath';
import { equityScaleArt } from '../equityScaleArt';
import { EQUITY_STRINGS } from '../strings';
import {
  DIAL_GLOVE_SLEEVE,
  SLEEVE_ANCHOR_X_FROM_CENTER,
  dialGlovePose,
  gripAngleForRotation,
  rimPoint,
} from './dialGloveLayout';

const REST = require('../../../../../assets/tables/hero-glove-rest.png');
const REST_SHADOW = require('../../../../../assets/tables/hero-glove-rest-shadow.png');

const DIAL_SIZE = 145;
const POINTS_PER_OUT = 11;
const RIM_RADIUS = DIAL_SIZE * 0.45;
const ANCHOR_Y_PAST_BOTTOM = 17;
/** Extra size around the planted sleeve. 1 = stretch-to-rim; 0.8 smaller, 1.2 larger. */
const GLOVE_SCALE = 0.85;

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
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const stackRef = useRef<View>(null);
  const start = useSharedValue(value);
  const rotation = useSharedValue(outsToDialAngle(value));
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const ready = useSharedValue(0);
  const screenH = useSharedValue(viewportHeight);

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
          rotation.value = DIAL_MIN_DEG + (next / 20) * (DIAL_MAX_DEG - DIAL_MIN_DEG);
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

  const gloveStyle = useAnimatedStyle(() => {
    const centerX = originX.value + DIAL_SIZE / 2;
    const centerY = originY.value + DIAL_SIZE / 2;
    const pose = dialGlovePose({
      anchor: {
        x: centerX + SLEEVE_ANCHOR_X_FROM_CENTER,
        y: screenH.value + ANCHOR_Y_PAST_BOTTOM,
      },
      contact: rimPoint(
        centerX,
        centerY,
        RIM_RADIUS,
        gripAngleForRotation(rotation.value)
      ),
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
          <View
            ref={stackRef}
            collapsable={false}
            onLayout={measureDial}
            style={styles.dialStack}>
            <Animated.Image
              source={equityScaleArt.dial}
              resizeMode="contain"
              style={[styles.dial, dialStyle]}
            />
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              style={[styles.glove, gloveStyle]}>
              <Image source={REST_SHADOW} resizeMode="contain" style={styles.gloveLayer} />
              <Image source={REST} resizeMode="contain" style={styles.gloveLayer} />
            </Animated.View>
            <View pointerEvents="none" style={styles.valuePlate}>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.valueUnit}>OUTS</Text>
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
    width: DIAL_SIZE + 28,
    height: DIAL_SIZE + 12,
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
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    zIndex: 1,
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
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: artStyle.colors.goldBright,
    borderColor: '#171713',
    borderWidth: 3,
    zIndex: 3,
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
