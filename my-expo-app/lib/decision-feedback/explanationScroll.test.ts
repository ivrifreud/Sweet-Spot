import { describe, expect, it } from 'vitest';

import {
  EXPLANATION_BOX_MAX_HEIGHT,
  FEEDBACK_PASS_THROUGH,
  continueAfterExplanationTouch,
  explanationOverflows,
  explanationPointerEvents,
} from './explanationScroll';

describe('feedback explanation scroll', () => {
  it('keeps the coach card pass-through so only the lesson can take a drag', () => {
    expect(FEEDBACK_PASS_THROUGH).toBe('box-none');
  });

  it('scrolls once the lesson is taller than the box', () => {
    expect(explanationOverflows(EXPLANATION_BOX_MAX_HEIGHT)).toBe(false);
    expect(explanationOverflows(EXPLANATION_BOX_MAX_HEIGHT + 1)).toBe(true);
    expect(explanationOverflows(40)).toBe(false);
  });

  it('gives an overflowing lesson its own touch target', () => {
    expect(explanationPointerEvents(false)).toBe('box-none');
    expect(explanationPointerEvents(true)).toBe('auto');
  });

  it('does not treat a drag through the lesson as tap-to-continue', () => {
    expect(continueAfterExplanationTouch({ overflows: true, dragged: true })).toBe(false);
    expect(continueAfterExplanationTouch({ overflows: true, dragged: false })).toBe(true);
    expect(continueAfterExplanationTouch({ overflows: false, dragged: true })).toBe(true);
  });
});
