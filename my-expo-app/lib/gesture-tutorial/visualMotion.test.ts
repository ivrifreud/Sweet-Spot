import { describe, expect, it } from 'vitest';

import { horizonHeadingForSwipe, visualMotionForHand } from './visualMotion';

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

  it('aims the glove along the horizon toward the swipe side', () => {
    expect(horizonHeadingForSwipe({ x: 200, y: 450 }, { x: 280, y: 760 })).toBe(0);
    expect(horizonHeadingForSwipe({ x: 280, y: 760 }, { x: 200, y: 450 })).toBe(Math.PI);
    expect(horizonHeadingForSwipe({ x: 100, y: 760 }, { x: 220, y: 360 })).toBe(0);
    expect(horizonHeadingForSwipe({ x: 200, y: 450 }, { x: 200, y: 450 })).toBe(0);
  });
});
