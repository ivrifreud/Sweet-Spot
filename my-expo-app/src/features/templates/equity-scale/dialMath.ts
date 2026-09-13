import { clampOuts, hitChance, requiredEquity } from './equityMath';
import type { EquityStreet } from './types';

export const DIAL_MIN_DEG = -135;
export const DIAL_MAX_DEG = 135;
export const SCALE_MAX_TILT_DEG = 13;

export function outsToDialAngle(outs: number): number {
  return DIAL_MIN_DEG + (clampOuts(outs) / 20) * (DIAL_MAX_DEG - DIAL_MIN_DEG);
}

export function dialAngleToOuts(angle: number): number {
  const bounded = Math.min(DIAL_MAX_DEG, Math.max(DIAL_MIN_DEG, angle));
  return clampOuts(((bounded - DIAL_MIN_DEG) / (DIAL_MAX_DEG - DIAL_MIN_DEG)) * 20);
}

export function scaleTilt(input: {
  selectedOuts: number;
  street: EquityStreet;
  potBeforeCall: number;
  priceToCall: number;
}): number {
  const estimate = hitChance(input.selectedOuts, input.street);
  const needed = requiredEquity(input.potBeforeCall, input.priceToCall);
  const normalizedMargin = (estimate - needed) / 0.22;
  return Math.min(SCALE_MAX_TILT_DEG, Math.max(-SCALE_MAX_TILT_DEG, normalizedMargin * 10));
}
