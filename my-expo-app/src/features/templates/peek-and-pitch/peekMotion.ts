export const PEEK_HOLD_MS = 110;
export const PEEK_PINCH_MS = 105;
export const PEEK_LIFT_MS = 220;
export const PEEK_SETTLE_MS = 220;
export const PEEK_DRAG_DEAD_ZONE = 5;
export const PEEK_REVEAL_THRESHOLD = 0.24;

export function clamp01(value: number) {
  'worklet';
  return Math.min(1, Math.max(0, value));
}

export function normalizePeekDrag(
  translationY: number,
  pullRange: number,
  deadZone = PEEK_DRAG_DEAD_ZONE
) {
  'worklet';
  if (pullRange <= 0) {
    return 0;
  }
  const normalized = clamp01((translationY - deadZone) / pullRange);
  return Math.pow(normalized, 1.25);
}

export function hasRevealedPeek(progress: number) {
  'worklet';
  return progress >= PEEK_REVEAL_THRESHOLD;
}

/** Once the pan owns Peek, only the pan may settle it. */
export function shouldLongPressSettle(panOwnsPeek: boolean) {
  'worklet';
  return !panOwnsPeek;
}

/** Downward pan peeks from anywhere except the chip stack. No prior hold. */
export function shouldArmPeekPan(translationY: number, startedOnStack: boolean) {
  'worklet';
  return !startedOnStack && translationY > 0;
}

/** Fold is an upward throw from the low felt zone only. */
export function shouldArmMuckPan(
  translationY: number,
  startedLow: boolean,
  startedOnStack: boolean
) {
  'worklet';
  return !startedOnStack && startedLow && translationY < 0;
}

/** Keep a held lift if a small drag would otherwise map near 0. */
export function mergePeekDrag(current: number, translationY: number, pullRange: number) {
  'worklet';
  return Math.max(current, normalizePeekDrag(translationY, pullRange));
}
