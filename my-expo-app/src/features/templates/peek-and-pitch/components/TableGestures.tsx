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

import { playSfx } from '../../../../../lib/audio';
import { GESTURES, type StackHitRect } from '../config';
import {
  PEEK_DRAG_DEAD_ZONE,
  PEEK_HOLD_MS,
  PEEK_LIFT_MS,
  PEEK_PINCH_MS,
  PEEK_REVEAL_THRESHOLD,
  PEEK_SETTLE_MS,
} from '../peekMotion';

const MODE_UNDECIDED = 0;
const MODE_PEEK = 1;
const MODE_MUCK = 2;
const STACK_EXCLUSION_PAD = 8;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const PEEK_SPRING = {
  duration: PEEK_LIFT_MS,
  dampingRatio: 0.88,
  reduceMotion: ReduceMotion.System,
} as const;
const DROP_SPRING = {
  duration: PEEK_SETTLE_MS,
  dampingRatio: 0.88,
  reduceMotion: ReduceMotion.System,
} as const;
const MUCK_THROW_MS = 920;

type TableGesturesProps = {
  live: boolean;
  canCheck: boolean;
  height: number;
  stackHit: StackHitRect;
  cardHit: StackHitRect;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  onPeekHold?: () => void;
  onPeeked: () => void;
  onCheck: () => void;
  onMuck: () => void;
  onIllegalCheck: () => void;
};

function clampWorklet(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function hitRect(x: number, y: number, rect: StackHitRect, padding = 0) {
  'worklet';
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  return (
    x >= rect.x - padding &&
    x <= rect.x + rect.width + padding &&
    y >= rect.y - padding &&
    y <= rect.y + rect.height + padding
  );
}

/**
 * Gesture-handler worklets cannot call `'worklet'` helpers imported from
 * peekMotion.ts (ReferenceError on the UI runtime, native abort). These
 * locals must stay in this file and match peekMotion.ts.
 */
function clamp01Local(value: number) {
  'worklet';
  return Math.min(1, Math.max(0, value));
}

function normalizePeekDragLocal(translationY: number, pullRange: number) {
  'worklet';
  if (pullRange <= 0) {
    return 0;
  }
  const normalized = clamp01Local((translationY - PEEK_DRAG_DEAD_ZONE) / pullRange);
  return Math.pow(normalized, 1.25);
}

function mergePeekDragLocal(current: number, translationY: number, pullRange: number) {
  'worklet';
  return Math.max(current, normalizePeekDragLocal(translationY, pullRange));
}

function shouldLongPressSettleLocal(panOwnsPeek: boolean) {
  'worklet';
  return !panOwnsPeek;
}

function shouldArmPeekPanLocal(translationY: number, startedOnStack: boolean) {
  'worklet';
  return !startedOnStack && translationY > 0;
}

function shouldArmMuckPanLocal(
  translationY: number,
  startedLow: boolean,
  startedOnStack: boolean
) {
  'worklet';
  return !startedOnStack && startedLow && translationY < 0;
}

/** Settle the peek onto the felt. Instant on a muck so the throw can start clean. */
function flattenPeek(peek: SharedValue<number>, instant = false) {
  'worklet';
  cancelAnimation(peek);
  peek.value = instant ? 0 : withSpring(0, DROP_SPRING);
}

/**
 * Felt-wide native gestures. Check stays a double-tap; Call lives on the
 * stack target. Peek is a hold or a downward pull on the hole-card packet.
 */
export function TableGestures({
  live,
  canCheck,
  height,
  stackHit,
  cardHit,
  peek,
  muck,
  onPeekHold,
  onPeeked,
  onCheck,
  onMuck,
  onIllegalCheck,
}: TableGesturesProps) {
  const liveEnabled = useSharedValue(live ? 1 : 0);
  const gestureMode = useSharedValue(MODE_UNDECIDED);
  const startedLow = useSharedValue(0);
  const peekedThisTouch = useSharedValue(0);
  const peekArmed = useSharedValue(0);
  const ignoreFelt = useSharedValue(0);
  const muckLocked = useSharedValue(0);
  const canCheckEnabled = useSharedValue(canCheck ? 1 : 0);
  const stackHitRect = useSharedValue<StackHitRect>(stackHit);
  const cardHitRect = useSharedValue<StackHitRect>(cardHit);

  const onPeekHoldRef = useRef(onPeekHold);
  onPeekHoldRef.current = onPeekHold;
  const onPeekedRef = useRef(onPeeked);
  onPeekedRef.current = onPeeked;
  const onCheckRef = useRef(onCheck);
  onCheckRef.current = onCheck;
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
  const fireMuck = useCallback(() => {
    onMuckRef.current();
  }, []);
  const fireMuckCue = useCallback(() => {
    playSfx('fold');
  }, []);
  const fireIllegalCheck = useCallback(() => {
    onIllegalCheckRef.current();
  }, []);

  useEffect(() => {
    liveEnabled.value = live ? 1 : 0;
    canCheckEnabled.value = canCheck ? 1 : 0;
    stackHitRect.value = stackHit;
    cardHitRect.value = cardHit;
    if (!live) {
      flattenPeek(peek, true);
      muckLocked.value = 0;
      peekedThisTouch.value = 0;
      peekArmed.value = 0;
      ignoreFelt.value = 0;
    }
  }, [
    canCheck,
    canCheckEnabled,
    cardHit,
    cardHitRect,
    ignoreFelt,
    live,
    liveEnabled,
    muckLocked,
    peek,
    peekArmed,
    peekedThisTouch,
    stackHit,
    stackHitRect,
  ]);

  const muckTravel = height * GESTURES.muckTravel;
  const peekTravelPx = Math.max(28, cardHit.height * 0.34);
  const muckZoneTop = height * GESTURES.muckZoneTop;

  const gesture = useMemo(() => {
    const checkTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(GESTURES.tapMaxDuration)
      .maxDelay(GESTURES.doubleTapMs)
      .maxDistance(GESTURES.tapMaxDistance)
      .onEnd((_event, success) => {
        if (!success || liveEnabled.value !== 1) {
          return;
        }
        flattenPeek(peek, true);
        if (canCheckEnabled.value === 1) {
          runOnJS(fireCheck)();
        } else {
          runOnJS(fireIllegalCheck)();
        }
      });

    const peekHold = Gesture.LongPress()
      .minDuration(PEEK_HOLD_MS)
      .maxDistance(10_000)
      .onStart((event) => {
        if (liveEnabled.value !== 1 || muckLocked.value === 1) {
          return;
        }
        if (
          hitRect(event.x, event.y, stackHitRect.value, STACK_EXCLUSION_PAD) ||
          !hitRect(event.x, event.y, cardHitRect.value, 10)
        ) {
          return;
        }
        peekArmed.value = 1;
        peekedThisTouch.value = 1;
        cancelAnimation(peek);
        peek.value = withTiming(
          0.16,
          {
            duration: PEEK_PINCH_MS,
            easing: Easing.out(Easing.quad),
            reduceMotion: ReduceMotion.System,
          },
          (finished) => {
            if (finished && peekArmed.value === 1 && gestureMode.value !== MODE_PEEK) {
              peek.value = withSpring(1, PEEK_SPRING);
            }
          }
        );
        runOnJS(firePeekHold)();
      })
      .onFinalize(() => {
        if (!shouldLongPressSettleLocal(gestureMode.value === MODE_PEEK)) {
          return;
        }
        if (muckLocked.value === 1 || ignoreFelt.value === 1) {
          return;
        }
        const revealed = peek.value >= PEEK_REVEAL_THRESHOLD;
        peekArmed.value = 0;
        flattenPeek(peek);
        if (peekedThisTouch.value === 1 && revealed) {
          runOnJS(firePeeked)();
        }
        if (peekedThisTouch.value === 1) {
          peekedThisTouch.value = 0;
        }
      });

    const feltPan = Gesture.Pan()
      .minDistance(GESTURES.panActivate)
      .maxPointers(1)
      .onBegin((event) => {
        if (liveEnabled.value !== 1) {
          return;
        }
        const onStack = hitRect(event.x, event.y, stackHitRect.value, STACK_EXCLUSION_PAD);
        ignoreFelt.value = onStack ? 1 : 0;
        gestureMode.value = MODE_UNDECIDED;
        startedLow.value = !onStack && event.y > muckZoneTop ? 1 : 0;
      })
      .onUpdate((event) => {
        if (liveEnabled.value !== 1 || muckLocked.value === 1 || ignoreFelt.value === 1) {
          return;
        }

        if (gestureMode.value === MODE_UNDECIDED) {
          if (Math.abs(event.translationY) < GESTURES.directionLock) {
            return;
          }
          if (shouldArmPeekPanLocal(event.translationY, ignoreFelt.value === 1)) {
            gestureMode.value = MODE_PEEK;
            peekArmed.value = 1;
            if (peekedThisTouch.value !== 1) {
              peekedThisTouch.value = 1;
              runOnJS(firePeekHold)();
            }
          } else if (
            shouldArmMuckPanLocal(
              event.translationY,
              startedLow.value === 1,
              ignoreFelt.value === 1
            )
          ) {
            gestureMode.value = MODE_MUCK;
          }
        }

        if (gestureMode.value === MODE_PEEK) {
          cancelAnimation(peek);
          peek.value = mergePeekDragLocal(peek.value, event.translationY, peekTravelPx);
          return;
        }

        if (gestureMode.value === MODE_MUCK) {
          if (peekArmed.value === 1) {
            peekArmed.value = 0;
            flattenPeek(peek, true);
          }
          muck.value = clampWorklet(-event.translationY / muckTravel, 0, 0.98);
        }
      })
      .onEnd((event) => {
        if (ignoreFelt.value === 1) {
          ignoreFelt.value = 0;
          return;
        }

        if (gestureMode.value === MODE_PEEK) {
          const revealed = peek.value >= PEEK_REVEAL_THRESHOLD;
          peekArmed.value = 0;
          flattenPeek(peek);
          if (peekedThisTouch.value === 1 && revealed) {
            runOnJS(firePeeked)();
          }
          peekedThisTouch.value = 0;
          return;
        }

        if (gestureMode.value === MODE_MUCK) {
          const committed =
            muck.value > GESTURES.muckCommit || event.velocityY < -GESTURES.flickVelocity;

          if (committed) {
            muckLocked.value = 1;
            flattenPeek(peek, true);
            peekedThisTouch.value = 0;
            runOnJS(fireMuckCue)();
            muck.value = withTiming(
              1,
              { duration: MUCK_THROW_MS, easing: EASE_OUT },
              (finished) => {
                if (finished) {
                  runOnJS(fireMuck)();
                }
              }
            );
            return;
          }

          muck.value = withSpring(0, PEEK_SPRING);
        }

        if (muckLocked.value !== 1) {
          flattenPeek(peek);
        }
      })
      .onFinalize(() => {
        ignoreFelt.value = 0;
        peekArmed.value = 0;
        if (muckLocked.value !== 1) {
          flattenPeek(peek);
          if (muck.value < 1) {
            muck.value = withSpring(0, PEEK_SPRING);
          }
        }
        gestureMode.value = MODE_UNDECIDED;
      });

    return Gesture.Exclusive(checkTap, Gesture.Simultaneous(peekHold, feltPan));
  }, [
    canCheckEnabled,
    cardHitRect,
    fireCheck,
    fireIllegalCheck,
    fireMuck,
    fireMuckCue,
    firePeekHold,
    firePeeked,
    gestureMode,
    ignoreFelt,
    liveEnabled,
    muck,
    muckLocked,
    muckTravel,
    muckZoneTop,
    peek,
    peekArmed,
    peekTravelPx,
    peekedThisTouch,
    stackHitRect,
    startedLow,
  ]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.hitLayer]}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel="Hold or swipe down on the hole cards to peek. Swipe up to fold. Double-tap anywhere to check. Tap your chips to call. Drag chips toward the pot to raise."
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
