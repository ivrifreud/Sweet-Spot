import { describe, expect, it } from 'vitest';

import { outcomePointArt, seatResultStamp } from '../../src/features/decision-feedback/resultArt';

describe('seat result stamps', () => {
  it('stamps a hit on a right answer and a miss on a wrong one', () => {
    expect(seatResultStamp({ missed: false, chosenAction: 'Fold' })).toBe('hit');
    expect(seatResultStamp({ missed: true, chosenAction: 'Call' })).toBe('miss');
  });

  it('leaves a seat without a stamp until that seat is answered', () => {
    expect(seatResultStamp({ missed: false, chosenAction: null })).toBeNull();
  });
});

describe('outcome point art', () => {
  it('points up for a clean run and down once any answer is wrong', () => {
    expect(outcomePointArt('correct')).toBe('point-correct');
    expect(outcomePointArt('incorrect')).toBe('point-miss');
  });
});
