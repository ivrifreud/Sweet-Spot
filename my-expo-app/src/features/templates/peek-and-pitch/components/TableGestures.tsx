import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { GESTURES } from '../config';

const MODE_UNDECIDED = 0;
const MODE_PEEK = 1;
const MODE_MUCK = 2;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const PEEK_SPRING = { duration: 400, dampingRatio: 0.8, reduceMotion: ReduceMotion.System } as const;

type TableGesturesProps = {
  live: boolean;
  width: number;
  height: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  stackPress: SharedValue<number>;
  onPeeked: () => void;
  onRaise: () => void;
  onMuck: () => void;
};

function clampWorklet(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function insideStack(x: number, y: number, width: number, height: number) {
  'worklet';
  return x < width * 0.42 && y > height * 0.58;
}

/**
 * Full-table pan lives in its own component so a parent re-render cannot
 * rebuild the native gesture mid-touch (that left peek stuck at 1).
 */
export function TableGestures({
  live,
  width,
  height,
  peek,
  muck,
  stackPress,
  onPeeked,
  onRaise,
  onMuck,
}: TableGesturesProps) {
  const reducedMotion = useReducedMotion();
  const liveEnabled = useSharedValue(live ? 1 : 0);
  const gestureMode = useSharedValue(MODE_UNDECIDED);
  const startedLow = useSharedValue(0);
  const peekedThisTouch = useSharedValue(0);
  const reportedPeek = useSharedValue(0);

  const onPeekedRef = useRef(onPeeked);
  onPeekedRef.current = onPeeked;
  const onRaiseRef = useRef(onRaise);
  onRaiseRef.current = onRaise;
  const onMuckRef = useRef(onMuck);
  onMuckRef.current = onMuck;

  const firePeeked = useCallback(() => {
    onPeekedRef.current();
  }, []);
  const fireRaise = useCallback(() => {
    onRaiseRef.current();
  }, []);
  const fireMuck = useCallback(() => {
    onMuckRef.current();
  }, []);

  useEffect(() => {
    liveEnabled.value = live ? 1 : 0;
  }, [live, liveEnabled]);

  const muckTravel = height * GESTURES.muckTravel;
  const muckZoneTop = height * GESTURES.muckZoneTop;
  const peekInMs = reducedMotion ? 0 : 150;

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .maxPointers(1)
        .onBegin((event) => {
          if (liveEnabled.value !== 1) {
            return;
          }

          const onStack = insideStack(event.absoluteX, event.absoluteY, width, height);
          gestureMode.value = MODE_UNDECIDED;
          startedLow.value = event.y > muckZoneTop ? 1 : 0;
          stackPress.value = onStack ? 1 : 0;
          peekedThisTouch.value = 0;
          reportedPeek.value = 0;

          if (!onStack) {
            peekedThisTouch.value = 1;
            peek.value = withTiming(1, { duration: peekInMs, easing: EASE_OUT });
          }
        })
        .onUpdate((event) => {
          if (liveEnabled.value !== 1) {
            return;
          }

          if (gestureMode.value === MODE_UNDECIDED) {
            if (Math.abs(event.translationY) < GESTURES.directionLock) {
              return;
            }
            if (startedLow.value === 1 && event.translationY < 0) {
              gestureMode.value = MODE_MUCK;
            } else {
              gestureMode.value = MODE_PEEK;
            }
          }

          if (gestureMode.value === MODE_MUCK) {
            muck.value = clampWorklet(-event.translationY / muckTravel, 0, 0.98);
          }
        })
        .onEnd((event) => {
          const tappedStack =
            stackPress.value === 1 &&
            Math.abs(event.translationX) < 48 &&
            Math.abs(event.translationY) < 48;

          stackPress.value = 0;

          if (tappedStack) {
            peek.value = withSpring(0, PEEK_SPRING);
            runOnJS(fireRaise)();
            return;
          }

          if (gestureMode.value === MODE_MUCK) {
            const committed =
              muck.value > GESTURES.muckCommit || event.velocityY < -GESTURES.flickVelocity;

            if (committed) {
              peek.value = withSpring(0, PEEK_SPRING);
              muck.value = withTiming(1, { duration: 460, easing: EASE_OUT }, (finished) => {
                if (finished) {
                  runOnJS(fireMuck)();
                }
              });
            } else {
              muck.value = withSpring(0, PEEK_SPRING);
              peek.value = withSpring(0, PEEK_SPRING);
            }
          } else {
            peek.value = withSpring(0, PEEK_SPRING);
          }

          if (peekedThisTouch.value === 1 && reportedPeek.value === 0) {
            reportedPeek.value = 1;
            runOnJS(firePeeked)();
          }
        })
        .onFinalize(() => {
          stackPress.value = 0;
          if (muck.value < GESTURES.muckCommit) {
            peek.value = withSpring(0, PEEK_SPRING);
          }
          if (peekedThisTouch.value === 1 && reportedPeek.value === 0) {
            reportedPeek.value = 1;
            runOnJS(firePeeked)();
          }
          peekedThisTouch.value = 0;
        }),
    [
      fireMuck,
      firePeeked,
      fireRaise,
      gestureMode,
      height,
      liveEnabled,
      muck,
      muckTravel,
      muckZoneTop,
      peek,
      peekInMs,
      peekedThisTouch,
      reportedPeek,
      stackPress,
      startedLow,
      width,
    ]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={StyleSheet.absoluteFill}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel="Hold to peek at your hole cards. Swipe up to muck. Tap your chips to raise."
      />
    </GestureDetector>
  );
}
