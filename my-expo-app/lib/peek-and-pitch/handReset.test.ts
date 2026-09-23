import { describe, expect, it } from 'vitest';

import {
  PEEK_ANIMATIONS_TO_CANCEL,
  PEEK_SHARED_VALUES_AFTER_RESET,
  nextHandResetGeneration,
  shouldApplyDealComplete,
} from './handReset';

describe('peek hand reset', () => {
  it('cancels every deal actor and zeroes shared values', () => {
    expect(PEEK_ANIMATIONS_TO_CANCEL).toEqual(['deal', 'peek', 'muck', 'commit']);
    expect(PEEK_SHARED_VALUES_AFTER_RESET).toEqual({
      peek: 0,
      muck: 0,
      commit: 0,
      deal: 0,
      stackPress: 0,
      stackDragX: 0,
      stackDragY: 0,
    });
  });

  it('drops a stale deal-complete callback after resetKey advances', () => {
    const active = nextHandResetGeneration(3);
    expect(shouldApplyDealComplete(3, active, true)).toBe(false);
    expect(shouldApplyDealComplete(active, active, true)).toBe(true);
    expect(shouldApplyDealComplete(active, active, false)).toBe(false);
  });
});
