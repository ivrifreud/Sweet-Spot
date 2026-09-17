import { clampOuts, requiredEquity } from './equityMath';

export const DIAL_MIN_DEG = -135;
export const DIAL_MAX_DEG = 135;
export const SCALE_MAX_TILT_DEG = 28;
export const DIAL_CENTER_DEADZONE_PX = 12;
export const DIAL_SPIN_SOUND_DEG = 0.65;

function clampRange(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

export function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  'worklet';
  let delta = toDeg - fromDeg;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

/** Angle of a local point around the dial center. 0° = 3 o'clock, clockwise. */
export function fingerAngleDeg(
  x: number,
  y: number,
  centerX: number,
  centerY: number
): number {
  'worklet';
  return (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;
}

export function dialIsSpinning(deltaDeg: number): boolean {
  'worklet';
  return Math.abs(deltaDeg) >= DIAL_SPIN_SOUND_DEG;
}

export function rotationAfterFingerMove(input: {
  rotation: number;
  lastX: number;
  lastY: number;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
}): { rotation: number; deltaDeg: number } {
  'worklet';
  const rx = input.lastX - input.centerX;
  const ry = input.lastY - input.centerY;
  const radiusSq = rx * rx + ry * ry;
  if (radiusSq < 1) {
    return { rotation: input.rotation, deltaDeg: 0 };
  }
  const dx = input.x - input.lastX;
  const dy = input.y - input.lastY;
  const unclamped =
    input.rotation + ((rx * dy - ry * dx) / radiusSq) * (180 / Math.PI);
  const rotation = Math.min(DIAL_MAX_DEG, Math.max(DIAL_MIN_DEG, unclamped));
  return { rotation, deltaDeg: rotation - input.rotation };
}

export function valueToDialAngle(value: number, min: number, max: number): number {
  'worklet';
  const span = max - min;
  if (span <= 0) return DIAL_MIN_DEG;
  const t = (clampRange(value, min, max) - min) / span;
  return DIAL_MIN_DEG + t * (DIAL_MAX_DEG - DIAL_MIN_DEG);
}

export function dialAngleToValue(angle: number, min: number, max: number): number {
  'worklet';
  const bounded = clampRange(angle, DIAL_MIN_DEG, DIAL_MAX_DEG);
  const t = (bounded - DIAL_MIN_DEG) / (DIAL_MAX_DEG - DIAL_MIN_DEG);
  return Math.round(min + t * (max - min));
}

export function outsToDialAngle(outs: number): number {
  return valueToDialAngle(clampOuts(outs), 0, 20);
}

export function dialAngleToOuts(angle: number): number {
  return clampOuts(dialAngleToValue(angle, 0, 20));
}

export function scaleTilt(input: {
  selectedEquity: number;
  potBeforeCall: number;
  priceToCall: number;
}): number {
  const estimate = clampRange(input.selectedEquity, 0, 100) / 100;
  const needed = requiredEquity(input.potBeforeCall, input.priceToCall);
  const normalizedMargin = (estimate - needed) / 0.22;
  return Math.min(SCALE_MAX_TILT_DEG, Math.max(-SCALE_MAX_TILT_DEG, normalizedMargin * 10));
}
