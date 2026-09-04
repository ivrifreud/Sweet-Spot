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
