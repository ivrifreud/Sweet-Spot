import { describe, expect, it } from 'vitest';

import {
  PEEK_DRAG_DEAD_ZONE,
  PEEK_REVEAL_THRESHOLD,
  hasRevealedPeek,
  normalizePeekDrag,
} from '../../src/features/templates/peek-and-pitch/peekMotion';

describe('normalizePeekDrag', () => {
  it('rejects upward movement and holds a short dead zone', () => {
    expect(normalizePeekDrag(-20, 100)).toBe(0);
    expect(normalizePeekDrag(PEEK_DRAG_DEAD_ZONE, 100)).toBe(0);
  });

  it('clamps and increases monotonically', () => {
    const samples = [0, 20, 40, 60, 80, 120].map((value) => normalizePeekDrag(value, 100));
    expect(samples[0]).toBe(0);
    expect(samples.at(-1)).toBe(1);
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index]).toBeGreaterThanOrEqual(samples[index - 1]);
    }
  });
});

describe('hasRevealedPeek', () => {
  it('fires only from the visible-corner threshold', () => {
    expect(hasRevealedPeek(PEEK_REVEAL_THRESHOLD - 0.01)).toBe(false);
    expect(hasRevealedPeek(PEEK_REVEAL_THRESHOLD)).toBe(true);
  });
});
