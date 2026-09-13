import { describe, expect, it } from 'vitest';

import {
  DIAL_MAX_DEG,
  DIAL_MIN_DEG,
  SCALE_MAX_TILT_DEG,
  dialAngleToOuts,
  outsToDialAngle,
  scaleTilt,
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

  it('tips from the player estimate and clamps the hardware', () => {
    const low = scaleTilt({
      selectedOuts: 0,
      street: 'turn',
      potBeforeCall: 20,
      priceToCall: 4,
    });
    const high = scaleTilt({
      selectedOuts: 20,
      street: 'turn',
      potBeforeCall: 20,
      priceToCall: 4,
    });
    expect(low).toBeLessThan(0);
    expect(high).toBeGreaterThan(0);
    expect(Math.abs(low)).toBeLessThanOrEqual(SCALE_MAX_TILT_DEG);
    expect(Math.abs(high)).toBeLessThanOrEqual(SCALE_MAX_TILT_DEG);
  });
});
