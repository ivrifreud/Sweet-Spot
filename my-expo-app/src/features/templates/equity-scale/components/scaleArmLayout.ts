import { SCALE_MAX_TILT_DEG } from '../dialMath';

/** Shoulder sockets on the padded scale canvas. */
export const SCALE_ARM_PIVOTS = {
  left: { x: 0.38, y: 0.42 },
  right: { x: 0.619, y: 0.42 },
} as const;

function clampTilt(tilt: number): number {
  return Math.min(SCALE_MAX_TILT_DEG, Math.max(-SCALE_MAX_TILT_DEG, tilt));
}

/** Baked tilt frames, one every 2° from -28 to +28. */
export const SCALE_FRAME_COUNT = 29;
export const SCALE_FRAME_STEP_DEG = 2;
/** Never mount more than the current/previous pair plus one incoming neighbor. */
export const SCALE_FRAME_WINDOW_MAX = 3;

/** Continuous index in [0, 28] so neighboring frames can crossfade. */
export function scaleFramePosition(tilt: number): number {
  const t = clampTilt(tilt);
  return (t + SCALE_MAX_TILT_DEG) / SCALE_FRAME_STEP_DEG;
}

export function scaleFrameIndex(tilt: number): number {
  return Math.round(scaleFramePosition(tilt));
}

/** Linear blend: only the two frames next to `position` are visible. */
export function frameBlendOpacity(position: number, index: number): number {
  'worklet';
  const d = Math.abs(position - index);
  if (d >= 1) return 0;
  return 1 - d;
}

export function scaleFrameWindow(
  position: number,
  frameCount = SCALE_FRAME_COUNT
): number[] {
  if (frameCount <= 0) return [];
  const last = frameCount - 1;
  const lo = Math.max(0, Math.min(last, Math.floor(position)));
  const hi = Math.max(0, Math.min(last, Math.ceil(position)));
  if (lo === hi) return [lo];
  return [lo, hi];
}

export function mergeScaleFrameWindow(
  current: readonly number[],
  incoming: readonly number[],
  frameCount = SCALE_FRAME_COUNT
): number[] {
  const live = [...new Set(incoming)]
    .filter((index) => index >= 0 && index < frameCount)
    .sort((left, right) => left - right);
  if (live.length <= 1) return live;
  const next = [...new Set([...current, ...incoming])]
    .filter((index) => index >= 0 && index < frameCount)
    .sort((left, right) => left - right);
  if (next.length <= SCALE_FRAME_WINDOW_MAX) return next;
  return live.slice(0, SCALE_FRAME_WINDOW_MAX);
}

export function visibleScaleFrameOpacities(
  position: number,
  mounted: readonly number[]
): { index: number; opacity: number }[] {
  return mounted.map((index) => ({
    index,
    opacity: frameBlendOpacity(position, index),
  }));
}

/** Map a dial reading onto ±SCALE_MAX_TILT_DEG. Center stays level. */
export function dialValueToTilt(value: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return 0;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  return clampTilt((t - 0.5) * 2 * SCALE_MAX_TILT_DEG);
}

/**
 * CSS clockwise rotation of an outer pan: left of the pivot rises, right drops.
 * Both hoses take the same angle so the pans seesaw instead of nodding together.
 */
export function scaleArmPose(tilt: number): { leftRotateDeg: number; rightRotateDeg: number } {
  const clamped = clampTilt(tilt);
  return {
    leftRotateDeg: clamped,
    rightRotateDeg: clamped,
  };
}

/** Screen-Y of an outer pan for a CSS rotate. Positive is down. */
export function panDeltaY(side: 'left' | 'right', rotateDeg: number): number {
  const lift = Math.sin((rotateDeg * Math.PI) / 180);
  return side === 'left' ? -lift : lift;
}

/** Extra vertical room so a max-tilt pan stays inside the scale slot. */
export function scalePanClearance(scaleWidth: number, tiltDeg = SCALE_MAX_TILT_DEG): number {
  return Math.ceil(scaleWidth * 0.36 * Math.sin((Math.abs(tiltDeg) * Math.PI) / 180));
}

export function pivotOrigin(pivot: { x: number; y: number }): string {
  return `${pivot.x * 100}% ${pivot.y * 100}%`;
}
