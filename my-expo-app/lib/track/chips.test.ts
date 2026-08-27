import { describe, expect, it } from 'vitest';

import { MAX_CHIPS, burnChip, chipFilled, chipSlots, clampChips, fillChips } from './chips';

describe('chip stack lives', () => {
  it('starts full and burns from the right', () => {
    expect(chipSlots(MAX_CHIPS)).toEqual([true, true, true]);
    expect(chipSlots(2)).toEqual([true, true, false]);
    expect(chipSlots(1)).toEqual([true, false, false]);
    expect(chipSlots(0)).toEqual([false, false, false]);
  });

  it('treats the last slot as empty after one burn', () => {
    expect(chipFilled(2, 2)).toBe(false);
    expect(chipFilled(1, 2)).toBe(true);
  });

  it('clamps burns and fills to the 3-chip stack', () => {
    expect(burnChip(1)).toBe(0);
    expect(burnChip(0)).toBe(0);
    expect(fillChips(1, 1)).toBe(2);
    expect(fillChips(2)).toBe(MAX_CHIPS);
    expect(clampChips(9)).toBe(MAX_CHIPS);
    expect(clampChips(-2)).toBe(0);
  });
});
