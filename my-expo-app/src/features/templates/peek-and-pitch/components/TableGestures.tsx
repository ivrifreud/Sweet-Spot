import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { GESTURES } from '../config';

const MODE_UNDECIDED = 0;
const MODE_MUCK = 2;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const PEEK_SPRING = {
  duration: 420,
  dampingRatio: 0.74,
  reduceMotion: ReduceMotion.System,
} as const;
const DROP_SPRING = {
  duration: 540,
  dampingRatio: 0.68,
  reduceMotion: ReduceMotion.System,
} as const;
const MUCK_THROW_MS = 920;
const STACK_DRAG_THRESHOLD = 26;
const DOUBLE_TAP_MS = 320;
const STACK_HIT_PAD = 20;

export type StackHitRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TableGesturesProps = {
  live: boolean;
  canCheck: boolean;
  height: number;
  potCenter: { x: number; y: number };
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  stackPress: SharedValue<number>;
  stackDragX: SharedValue<number>;
  stackDragY: SharedValue<number>;
  stackHit: SharedValue<StackHitRect>;
  onPeekHold?: () => void;
  onPeeked: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: () => void;
  onMuck: () => void;
  onIllegalCheck: () => void;
};

function clampWorklet(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function hitStack(x: number, y: number, rect: StackHitRect) {
  'worklet';
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  return (
    x >= rect.x - STACK_HIT_PAD &&
    x <= rect.x + rect.width + STACK_HIT_PAD &&
    y >= rect.y - STACK_HIT_PAD &&
    y <= rect.y + rect.height + STACK_HIT_PAD
  );
}

/** Settle the peek onto the felt. Instant on a muck so the throw can start clean. */
function flattenPeek(peek: SharedValue<number>, instant = false) {
  'worklet';
  cancelAnimation(peek);
  peek.value = instant ? 0 : withSpring(0, DROP_SPRING);
}

/**
 * Full-table pan lives here so parent re-renders cannot rebuild the native
 * gesture mid-touch (that left peek stuck at 1).
 */
export function TableGestures({
  live,
  canCheck,
  height,
  potCenter,
  peek,
  muck,
  stackPress,
  stackDragX,
  stackDragY,
  stackHit,
  onPeekHold,
  onPeeked,
  onCheck,
  onCall,
  onRaise,
  onMuck,
  onIllegalCheck,
}: TableGesturesProps) {
  const liveEnabled = useSharedValue(live ? 1 : 0);
  const gestureMode = useSharedValue(MODE_UNDECIDED);
  const startedLow = useSharedValue(0);
  const peekedThisTouch = useSharedValue(0);
  const muckLocked = useSharedValue(0);
  const fingerDown = useSharedValue(0);
  const stackDragged = useSharedValue(0);
  const canCheckEnabled = useSharedValue(canCheck ? 1 : 0);
  const lastFeltTapAt = useSharedValue(0);

  const onPeekHoldRef = useRef(onPeekHold);
  onPeekHoldRef.current = onPeekHold;
  const onPeekedRef = useRef(onPeeked);
  onPeekedRef.current = onPeeked;
  const onCheckRef = useRef(onCheck);
  onCheckRef.current = onCheck;
  const onCallRef = useRef(onCall);
  onCallRef.current = onCall;
  const onRaiseRef = useRef(onRaise);
  onRaiseRef.current = onRaise;
  const onMuckRef = useRef(onMuck);
  onMuckRef.current = onMuck;
  const onIllegalCheckRef = useRef(onIllegalCheck);
  onIllegalCheckRef.current = onIllegalCheck;

  const firePeekHold = useCallback(() => {
    onPeekHoldRef.current?.();
  }, []);
  const firePeeked = useCallback(() => {
    onPeekedRef.current();
  }, []);
  const fireCheck = useCallback(() => {
    onCheckRef.current();
  }, []);
  const fireCall = useCallback(() => {
    onCallRef.current();
  }, []);
  const fireRaise = useCallback(() => {
    onRaiseRef.current();
  }, []);
  const fireMuck = useCallback(() => {
    onMuckRef.current();
  }, []);
  const fireIllegalCheck = useCallback(() => {
    onIllegalCheckRef.current();
  }, []);

  useEffect(() => {
    liveEnabled.value = live ? 1 : 0;
    canCheckEnabled.value = canCheck ? 1 : 0;
    if (!live) {
      flattenPeek(peek, true);
      muckLocked.value = 0;
      stackPress.value = 0;
      stackDragX.value = 0;
      stackDragY.value = 0;
      fingerDown.value = 0;
      stackDragged.value = 0;
      lastFeltTapAt.value = 0;
    }
  }, [
    canCheck,
    canCheckEnabled,
    fingerDown,
    lastFeltTapAt,
    live,
    liveEnabled,
    muckLocked,
    peek,
    stackDragged,
    stackDragX,
    stackDragY,
    stackPress,
  ]);

  const muckTravel = height * GESTURES.muckTravel;
  const muckZoneTop = height * GESTURES.muckZoneTop;

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .maxPointers(1)
        .onBegin((event) => {
          if (liveEnabled.value !== 1) {
            return;
          }

          const onStack = hitStack(event.x, event.y, stackHit.value);
          gestureMode.value = MODE_UNDECIDED;
          startedLow.value = !onStack && event.y > muckZoneTop ? 1 : 0;
          stackPress.value = onStack ? 1 : 0;
          stackDragged.value = 0;
          stackDragX.value = 0;
          stackDragY.value = 0;
          peekedThisTouch.value = 0;
          fingerDown.value = 1;

          if (onStack) {
            return;
          }

          if (muckLocked.value !== 1) {
            peekedThisTouch.value = 1;
            cancelAnimation(peek);
            peek.value = withSpring(1, PEEK_SPRING);
            runOnJS(firePeekHold)();
          }
        })
        .onUpdate((event) => {
          if (liveEnabled.value !== 1 || muckLocked.value === 1) {
            return;
          }

          if (stackPress.value === 1) {
            stackDragX.value = clampWorklet(event.translationX, -16, 96);
            stackDragY.value = clampWorklet(event.translationY, -96, 24);
            const stackCenterX = stackHit.value.x + stackHit.value.width / 2;
            const stackCenterY = stackHit.value.y + stackHit.value.height / 2;
            const towardPotX = potCenter.x - stackCenterX;
            const towardPotY = potCenter.y - stackCenterY;
            const towardPotLength = Math.max(1, Math.hypot(towardPotX, towardPotY));
            const progress =
              (event.translationX * towardPotX + event.translationY * towardPotY) / towardPotLength;
            if (progress >= STACK_DRAG_THRESHOLD) {
              stackDragged.value = 1;
            }
            return;
          }

          if (gestureMode.value === MODE_UNDECIDED) {
            if (Math.abs(event.translationY) < GESTURES.directionLock) {
              return;
            }
            if (startedLow.value === 1 && event.translationY < 0 && stackPress.value === 0) {
              gestureMode.value = MODE_MUCK;
            }
          }

          if (gestureMode.value === MODE_MUCK) {
            muck.value = clampWorklet(-event.translationY / muckTravel, 0, 0.98);
          }
        })
        .onEnd((event) => {
          fingerDown.value = 0;

          if (stackPress.value === 1) {
            stackPress.value = 0;
            stackDragX.value = withTiming(0, { duration: 180 });
            stackDragY.value = withTiming(0, { duration: 180 });
            flattenPeek(peek, true);
            if (stackDragged.value === 1) {
              runOnJS(fireRaise)();
            } else {
              runOnJS(fireCall)();
            }
            stackDragged.value = 0;
            return;
          }

          stackPress.value = 0;

          const feltTap = Math.abs(event.translationX) < 10 && Math.abs(event.translationY) < 10;
          if (feltTap && stackPress.value !== 1) {
            const now = Date.now();
            if (now - lastFeltTapAt.value <= DOUBLE_TAP_MS) {
              lastFeltTapAt.value = 0;
              flattenPeek(peek, true);
              if (canCheckEnabled.value === 1) {
                runOnJS(fireCheck)();
              } else {
                runOnJS(fireIllegalCheck)();
              }
              return;
            }
            lastFeltTapAt.value = now;
          }

          if (gestureMode.value === MODE_MUCK) {
            const committed =
              muck.value > GESTURES.muckCommit || event.velocityY < -GESTURES.flickVelocity;

            if (committed) {
              muckLocked.value = 1;
              flattenPeek(peek, true);
              muck.value = withTiming(
                1,
                { duration: MUCK_THROW_MS, easing: EASE_OUT },
                (finished) => {
                  if (finished) {
                    runOnJS(fireMuck)();
                  }
                }
              );
            } else {
              muck.value = withSpring(0, PEEK_SPRING);
              flattenPeek(peek);
            }
          } else {
            flattenPeek(peek);
          }

          if (peekedThisTouch.value === 1) {
            peekedThisTouch.value = 0;
            runOnJS(firePeeked)();
          }
        })
        .onFinalize(() => {
          fingerDown.value = 0;
          stackPress.value = 0;
          stackDragX.value = withTiming(0, { duration: 180 });
          stackDragY.value = withTiming(0, { duration: 180 });
          stackDragged.value = 0;
          if (muckLocked.value !== 1) {
            flattenPeek(peek);
            if (muck.value < 1) {
              muck.value = withSpring(0, PEEK_SPRING);
            }
          }
          peekedThisTouch.value = 0;
        }),
    [
      fireMuck,
      firePeeked,
      firePeekHold,
      fireCall,
      fireCheck,
      fireRaise,
      fireIllegalCheck,
      canCheckEnabled,
      fingerDown,
      gestureMode,
      liveEnabled,
      lastFeltTapAt,
      muck,
      muckLocked,
      muckTravel,
      muckZoneTop,
      peek,
      peekedThisTouch,
      potCenter.x,
      potCenter.y,
      stackDragged,
      stackDragX,
      stackDragY,
      stackHit,
      stackPress,
      startedLow,
    ]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.hitLayer]}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel="Hold to peek. Swipe up to fold. Double-tap the felt to check. Tap your chips to call. Drag chips toward the pot to raise."
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitLayer: {
    zIndex: 50,
    elevation: 50,
  },
});
