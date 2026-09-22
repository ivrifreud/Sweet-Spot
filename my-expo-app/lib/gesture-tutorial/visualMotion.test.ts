import { describe, expect, it } from 'vitest';

import {
  glovePoseDeg,
  horizonHeadingForDial,
  horizonHeadingForSwipe,
  pairTapProgress,
  rightHandEdgeLift,
  visualMotionForHand,
} from './visualMotion';

describe('visualMotionForHand', () => {
  it('maps fold and raise to the same upward arc', () => {
    expect(visualMotionForHand('foldUp')).toEqual({ kind: 'swipe', direction: 'up' });
    expect(visualMotionForHand('raiseUp')).toEqual({ kind: 'swipe', direction: 'up' });
  });

  it('maps peek to the reversed downward arc', () => {
    expect(visualMotionForHand('peekDown')).toEqual({ kind: 'swipe', direction: 'down' });
  });

  it('maps call and check to one and two contact ripples', () => {
    expect(visualMotionForHand('tapStack')).toEqual({ kind: 'tap', tapCount: 1 });
    expect(visualMotionForHand('doubleTap')).toEqual({ kind: 'tap', tapCount: 2 });
  });

  it('maps the scale dial to a half-circle rotate', () => {
    expect(visualMotionForHand('turnDial')).toEqual({ kind: 'rotate' });
  });

  it('maps the scale decision to alternating button taps', () => {
    expect(visualMotionForHand('tapPair')).toEqual({ kind: 'tapPair' });
  });

  it('aims the glove along the horizon toward the swipe side', () => {
    expect(horizonHeadingForSwipe({ x: 200, y: 450 }, { x: 280, y: 760 })).toBe(Math.PI);
    expect(horizonHeadingForSwipe({ x: 280, y: 760 }, { x: 200, y: 450 })).toBe(0);
    expect(horizonHeadingForSwipe({ x: 100, y: 760 }, { x: 220, y: 360 })).toBe(Math.PI);
    expect(horizonHeadingForSwipe({ x: 200, y: 450 }, { x: 200, y: 450 })).toBe(Math.PI);
  });

  it('keeps peek, fold, lock-in, and call pointing left in one fixed pose', () => {
    expect(glovePoseDeg('peekDown')).toBe(0);
    expect(glovePoseDeg('foldUp')).toBe(0);
    expect(glovePoseDeg('tapStack')).toBe(0);
    expect(glovePoseDeg('tapPair')).toBe(0);
    expect(glovePoseDeg('turnDial')).toBeNull();
    expect(glovePoseDeg('raiseUp')).toBeNull();
  });

  it('keeps the dial glove flat on the horizon instead of spinning with the rim', () => {
    expect(horizonHeadingForDial()).toBe(Math.PI);
  });

  it('lifts the glove only when the palm would leave the right edge', () => {
    const phone = 393;
    const dialRightRim = phone / 2 + 148 * 0.42;
    expect(rightHandEdgeLift(dialRightRim, phone)).toBe(0);
    expect(rightHandEdgeLift(phone / 2, phone)).toBe(0);
    expect(rightHandEdgeLift(phone - 8 - 42, phone)).toBe(-90);
  });

  it('teleports Call or Fold between the left and right buttons', () => {
    expect(pairTapProgress(0)).toBe(0);
    expect(pairTapProgress(0.28)).toBe(0);
    expect(pairTapProgress(0.49)).toBe(0);
    expect(pairTapProgress(0.5)).toBe(1);
    expect(pairTapProgress(0.75)).toBe(1);
    expect(pairTapProgress(1)).toBe(1);
  });
});
