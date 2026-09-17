import { SCALE_MAX_TILT_DEG } from '../dialMath';

/** Shoulder sockets on the shared 1069×698 scale canvas. */
export const SCALE_ARM_PIVOTS = {
  left: { x: 0.38, y: 0.42 },
  right: { x: 0.619, y: 0.42 },
} as const;

function clampTilt(tilt: number): number {
  return Math.min(SCALE_MAX_TILT_DEG, Math.max(-SCALE_MAX_TILT_DEG, tilt));
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

export function rotateAroundPivot(
  rotateDeg: number,
  pivot: { x: number; y: number },
  width: number,
  height: number
) {
  'worklet';
  const px = pivot.x * width;
  const py = pivot.y * height;
  return [
    { translateX: px },
    { translateY: py },
    { rotate: `${rotateDeg}deg` },
    { translateX: -px },
    { translateY: -py },
  ];
}

export function pivotOrigin(pivot: { x: number; y: number }): string {
  return `${pivot.x * 100}% ${pivot.y * 100}%`;
}
