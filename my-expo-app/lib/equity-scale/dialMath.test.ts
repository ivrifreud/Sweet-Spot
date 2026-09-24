import { describe, expect, it } from 'vitest';

import {
  DIAL_MAX_DEG,
  DIAL_MIN_DEG,
  SCALE_MAX_TILT_DEG,
  dialAngleToOuts,
  dialAngleToValue,
  outsToDialAngle,
  scaleTilt,
  fingerAngleDeg,
  rotationAfterFingerMove,
  dialIsSpinning,
  shortestAngleDelta,
  valueToDialAngle,
  dialAngleToExactValue,
} from '../../src/features/templates/equity-scale/dialMath';

describe('Equity Scale dial math', () => {
  it('maps the full dial sweep to 0–20 outs', () => {
    expect(outsToDialAngle(0)).toBe(DIAL_MIN_DEG);
    expect(outsToDialAngle(20)).toBe(DIAL_MAX_DEG);
    expect(dialAngleToOuts(outsToDialAngle(12))).toBe(12);
  });

  it('clamps values outside the authored range', () => {
    expect(dialAngleToOuts(-999)).toBe(0);
    expect(dialAngleToOuts(999)).toBe(20);
  });

  it('maps any integer range across the same dial sweep', () => {
    expect(valueToDialAngle(0, 0, 70)).toBe(DIAL_MIN_DEG);
    expect(valueToDialAngle(70, 0, 70)).toBe(DIAL_MAX_DEG);
    expect(dialAngleToValue(valueToDialAngle(33, 0, 70), 0, 70)).toBe(33);
  });

  it('keeps fractional dial travel so the hose can move between detents', () => {
    const justPastCenter = DIAL_MIN_DEG + (DIAL_MAX_DEG - DIAL_MIN_DEG) * 0.51;
    const exact = dialAngleToExactValue(justPastCenter, 0, 20);
    const snapped = dialAngleToValue(justPastCenter, 0, 20);
    expect(exact).toBeGreaterThan(10);
    expect(exact).toBeLessThan(11);
    expect(snapped).toBe(10);
    expect(exact).not.toBe(snapped);
  });

  it('wraps angle deltas so a clockwise roll from either side stays continuous', () => {
    expect(shortestAngleDelta(170, -170)).toBe(20);
    expect(shortestAngleDelta(-170, 170)).toBe(-20);
    expect(shortestAngleDelta(10, 40)).toBe(30);
  });

  it('reads the finger angle from the dial center, not the window origin', () => {
    const cx = 84;
    const cy = 84;
    expect(fingerAngleDeg(184, 84, cx, cy)).toBeCloseTo(0);
    expect(fingerAngleDeg(84, 184, cx, cy)).toBeCloseTo(90);
    expect(fingerAngleDeg(0, 84, cx, cy)).toBeCloseTo(180);
    expect(fingerAngleDeg(84, 0, cx, cy)).toBeCloseTo(-90);
  });

  it('turns from the right rim or the left rim around the same center', () => {
    const fromRight = rotationAfterFingerMove({
      rotation: 0,
      lastX: 160,
      lastY: 84,
      x: 160,
      y: 100,
      centerX: 84,
      centerY: 84,
    });
    expect(fromRight.deltaDeg).toBeGreaterThan(5);
    expect(fromRight.rotation).toBeCloseTo(fromRight.deltaDeg);

    const fromLeft = rotationAfterFingerMove({
      rotation: 12,
      lastX: 8,
      lastY: 84,
      x: 8,
      y: 68,
      centerX: 84,
      centerY: 84,
    });
    expect(fromLeft.deltaDeg).toBeGreaterThan(5);
    expect(fromLeft.rotation).toBeCloseTo(12 + fromLeft.deltaDeg);
  });

  it('does not turn when the finger rests on the disc', () => {
    const rest = rotationAfterFingerMove({
      rotation: 40,
      lastX: 140,
      lastY: 40,
      x: 140,
      y: 40,
      centerX: 84,
      centerY: 84,
    });
    expect(rest.deltaDeg).toBe(0);
    expect(rest.rotation).toBe(40);
    expect(dialIsSpinning(rest.deltaDeg)).toBe(false);
    expect(dialIsSpinning(2)).toBe(true);
  });

  it('keeps the authored ±135° stops when the finger keeps circling', () => {
    const spunPastMax = rotationAfterFingerMove({
      rotation: 130,
      lastX: 160,
      lastY: 84,
      x: 160,
      y: 168,
      centerX: 84,
      centerY: 84,
    });
    expect(spunPastMax.rotation).toBe(DIAL_MAX_DEG);

    const spunPastMin = rotationAfterFingerMove({
      rotation: -130,
      lastX: 160,
      lastY: 84,
      x: 160,
      y: 0,
      centerX: 84,
      centerY: 84,
    });
    expect(spunPastMin.rotation).toBe(DIAL_MIN_DEG);
  });

  it('tips from dialed equity against pot odds and clamps the hardware', () => {
    const low = scaleTilt({
      selectedEquity: 0,
      potBeforeCall: 20,
      priceToCall: 4,
    });
    const high = scaleTilt({
      selectedEquity: 70,
      potBeforeCall: 20,
      priceToCall: 4,
    });
    expect(low).toBeLessThan(0);
    expect(high).toBeGreaterThan(0);
    expect(Math.abs(low)).toBeLessThanOrEqual(SCALE_MAX_TILT_DEG);
    expect(Math.abs(high)).toBeLessThanOrEqual(SCALE_MAX_TILT_DEG);
  });
});
