import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { playCheckSfx, queueCheckSfx } from '../../../../../lib/audio';
import { GESTURES } from '../config';
import type { GestureTutorialAction } from '../../../../../lib/gesture-tutorial';

type ChipStackTargetProps = {
  live: boolean;
  canCheck: boolean;
  stackLabel: string;
  potCenter: { x: number; y: number };
  stackCenter: { x: number; y: number };
  stackPress: SharedValue<number>;
  stackDragX: SharedValue<number>;
  stackDragY: SharedValue<number>;
  onCall: () => void;
  onRaise: () => void;
  onCheck: () => void;
  onIllegalCheck: () => void;
  allowedActions?: GestureTutorialAction[] | null;
  onRejected?: () => void;
};

function clampWorklet(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * Native hit target for the hero stack. Call is a one-tap recognizer on this
 * view; Check is a two-tap recognizer on the same view so a double-tap on
 * chips cannot also Call.
 */
function includesAction(
  allowed: GestureTutorialAction[] | null | undefined,
  action: GestureTutorialAction
) {
  return !allowed || allowed.includes(action);
}

export function ChipStackTarget({
  live,
  canCheck,
  stackLabel,
  potCenter,
  stackCenter,
  stackPress,
  stackDragX,
  stackDragY,
  onCall,
  onRaise,
  onCheck,
  onIllegalCheck,
  allowedActions,
  onRejected,
}: ChipStackTargetProps) {
  const liveEnabled = useSharedValue(live ? 1 : 0);
  const canCheckEnabled = useSharedValue(canCheck ? 1 : 0);
  const raiseArmed = useSharedValue(0);
  const lockEnabled = useSharedValue(allowedActions ? 1 : 0);
  const allowCall = useSharedValue(includesAction(allowedActions, 'call') ? 1 : 0);
  const allowRaise = useSharedValue(includesAction(allowedActions, 'raise') ? 1 : 0);
  const allowCheck = useSharedValue(includesAction(allowedActions, 'check') ? 1 : 0);
  const checkPresses = useSharedValue(0);

  const onCallRef = useRef(onCall);
  onCallRef.current = onCall;
  const onRaiseRef = useRef(onRaise);
  onRaiseRef.current = onRaise;
  const onCheckRef = useRef(onCheck);
  onCheckRef.current = onCheck;
  const onIllegalCheckRef = useRef(onIllegalCheck);
  onIllegalCheckRef.current = onIllegalCheck;
  const onRejectedRef = useRef(onRejected);
  onRejectedRef.current = onRejected;

  const fireCall = useCallback(() => {
    onCallRef.current();
  }, []);
  const fireRaise = useCallback(() => {
    onRaiseRef.current();
  }, []);
  const fireCheck = useCallback(() => {
    onCheckRef.current();
  }, []);
  const fireIllegalCheck = useCallback(() => {
    onIllegalCheckRef.current();
  }, []);
  const fireRejected = useCallback(() => {
    onRejectedRef.current?.();
  }, []);
  const queueCheckCue = useCallback(() => {
    queueCheckSfx();
  }, []);
  const startCheckCue = useCallback(() => {
    playCheckSfx();
  }, []);

  useEffect(() => {
    liveEnabled.value = live ? 1 : 0;
    canCheckEnabled.value = canCheck ? 1 : 0;
    lockEnabled.value = allowedActions ? 1 : 0;
    allowCall.value = includesAction(allowedActions, 'call') ? 1 : 0;
    allowRaise.value = includesAction(allowedActions, 'raise') ? 1 : 0;
    allowCheck.value = includesAction(allowedActions, 'check') ? 1 : 0;
    if (!live) {
      stackPress.value = 0;
      stackDragX.value = 0;
      stackDragY.value = 0;
      raiseArmed.value = 0;
      checkPresses.value = 0;
    }
  }, [
    allowCall,
    allowCheck,
    allowRaise,
    allowedActions,
    canCheck,
    canCheckEnabled,
    checkPresses,
    live,
    liveEnabled,
    lockEnabled,
    raiseArmed,
    stackDragX,
    stackDragY,
    stackPress,
  ]);

  const gesture = useMemo(() => {
    const checkTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(GESTURES.tapMaxDuration)
      .maxDelay(GESTURES.doubleTapMs)
      .maxDistance(GESTURES.tapMaxDistance)
      .onTouchesDown(() => {
        // The double-tap commits on the second finger-up. Start the cue on the second press.
        if (liveEnabled.value !== 1) {
          return;
        }
        const press = checkPresses.value + 1;
        checkPresses.value = press;
        if (press === 1) {
          runOnJS(queueCheckCue)();
          return;
        }
        if (press !== 2) {
          return;
        }
        if (lockEnabled.value === 1 && allowCheck.value !== 1) {
          return;
        }
        if (canCheckEnabled.value !== 1) {
          return;
        }
        runOnJS(startCheckCue)();
      })
      .onFinalize(() => {
        checkPresses.value = 0;
      })
      .onEnd((_event, success) => {
        if (!success || liveEnabled.value !== 1) {
          return;
        }
        stackPress.value = 0;
        if (lockEnabled.value === 1 && allowCheck.value !== 1) {
          runOnJS(fireRejected)();
          return;
        }
        if (canCheckEnabled.value === 1) {
          runOnJS(fireCheck)();
        } else {
          runOnJS(fireIllegalCheck)();
        }
      });

    const raisePan = Gesture.Pan()
      .maxPointers(1)
      .minDistance(GESTURES.stackRaiseActivate)
      .onBegin(() => {
        if (liveEnabled.value !== 1) {
          return;
        }
        raiseArmed.value = 0;
        stackPress.value = 1;
        stackDragX.value = 0;
        stackDragY.value = 0;
      })
      .onUpdate((event) => {
        if (liveEnabled.value !== 1) {
          return;
        }
        stackDragX.value = clampWorklet(event.translationX, -16, 96);
        stackDragY.value = clampWorklet(event.translationY, -96, 24);
        const towardPotX = potCenter.x - stackCenter.x;
        const towardPotY = potCenter.y - stackCenter.y;
        const length = Math.max(1, Math.hypot(towardPotX, towardPotY));
        const progress =
          (event.translationX * towardPotX + event.translationY * towardPotY) / length;
        if (progress >= GESTURES.stackRaiseCommit) {
          raiseArmed.value = 1;
        }
      })
      .onEnd(() => {
        const committed = raiseArmed.value === 1 && liveEnabled.value === 1;
        raiseArmed.value = 0;
        stackPress.value = 0;
        stackDragX.value = withTiming(0, { duration: 180 });
        stackDragY.value = withTiming(0, { duration: 180 });
        if (committed) {
          if (lockEnabled.value === 1 && allowRaise.value !== 1) {
            runOnJS(fireRejected)();
            return;
          }
          runOnJS(fireRaise)();
        }
      })
      .onFinalize(() => {
        raiseArmed.value = 0;
        stackPress.value = 0;
        stackDragX.value = withTiming(0, { duration: 180 });
        stackDragY.value = withTiming(0, { duration: 180 });
      });

    const callTap = Gesture.Tap()
      .numberOfTaps(1)
      .maxDuration(GESTURES.tapMaxDuration)
      .maxDistance(GESTURES.tapMaxDistance)
      .requireExternalGestureToFail(checkTap)
      .onBegin(() => {
        if (liveEnabled.value !== 1) {
          return;
        }
        stackPress.value = 1;
      })
      .onEnd((_event, success) => {
        if (!success || liveEnabled.value !== 1) {
          stackPress.value = 0;
          return;
        }
        stackPress.value = 0;
        if (lockEnabled.value === 1 && allowCall.value !== 1) {
          runOnJS(fireRejected)();
          return;
        }
        runOnJS(fireCall)();
      })
      .onFinalize(() => {
        stackPress.value = withTiming(0, { duration: 100 });
      });

    return Gesture.Exclusive(checkTap, raisePan, callTap);
  }, [
    canCheckEnabled,
    checkPresses,
    fireCall,
    fireCheck,
    fireIllegalCheck,
    fireRaise,
    fireRejected,
    liveEnabled,
    lockEnabled,
    allowCall,
    allowCheck,
    allowRaise,
    queueCheckCue,
    potCenter.x,
    potCenter.y,
    stackCenter.x,
    stackCenter.y,
    raiseArmed,
    stackDragX,
    stackDragY,
    stackPress,
    startCheckCue,
  ]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={styles.target}
        collapsable={false}
        hitSlop={8}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Chip stack ${stackLabel}. Tap once to call. Double-tap to check.`}
        accessibilityActions={[
          { name: 'activate', label: 'Call' },
          { name: 'magicTap', label: 'Call' },
        ]}
        onAccessibilityAction={(event) => {
          if (
            event.nativeEvent.actionName === 'activate' ||
            event.nativeEvent.actionName === 'magicTap'
          ) {
            onCall();
          }
        }}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  target: {
    flex: 1,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
