import { describe, expect, it } from 'vitest';

import {
  PEEK_DRAG_DEAD_ZONE,
  PEEK_LIFT_MS,
  PEEK_PINCH_MS,
  PEEK_REVEAL_THRESHOLD,
  PEEK_SETTLE_MS,
  hasRevealedPeek,
  mergePeekDrag,
  normalizePeekDrag,
  shouldArmMuckPan,
  shouldArmPeekPan,
  shouldLongPressSettle,
} from '../../src/features/templates/peek-and-pitch/peekMotion';

describe('peek pose clocks', () => {
  it('keeps pinch, lift, and settle inside the frozen brief', () => {
    expect(PEEK_PINCH_MS).toBeGreaterThanOrEqual(90);
    expect(PEEK_PINCH_MS).toBeLessThanOrEqual(120);
    expect(PEEK_LIFT_MS).toBeGreaterThanOrEqual(180);
    expect(PEEK_LIFT_MS).toBeLessThanOrEqual(240);
    expect(PEEK_SETTLE_MS).toBeGreaterThanOrEqual(180);
    expect(PEEK_SETTLE_MS).toBeLessThanOrEqual(240);
  });
});

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

describe('peek gesture ownership', () => {
  it('keeps an active pan lifted when LongPress finalizes', () => {
    expect(shouldLongPressSettle(true)).toBe(false);
  });

  it('lets a stationary LongPress settle on release', () => {
    expect(shouldLongPressSettle(false)).toBe(true);
  });

  it('lets a swipe-down on the packet lift without a prior hold', () => {
    expect(normalizePeekDrag(40, 100)).toBeGreaterThan(0);
    expect(shouldArmPeekPan(20, false)).toBe(true);
    expect(shouldArmPeekPan(20, true)).toBe(false);
    expect(shouldArmPeekPan(-20, false)).toBe(false);
  });

  it('only folds on an upward pan from the low felt', () => {
    expect(shouldArmMuckPan(-20, true, false)).toBe(true);
    expect(shouldArmMuckPan(20, true, false)).toBe(false);
    expect(shouldArmMuckPan(-20, false, false)).toBe(false);
  });

  it('does not slam a held lift shut on a small downward drag', () => {
    expect(mergePeekDrag(1, 12, 100)).toBe(1);
    expect(mergePeekDrag(0, 80, 100)).toBeGreaterThan(0.5);
  });
});
