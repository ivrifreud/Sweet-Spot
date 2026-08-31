import { describe, expect, it } from 'vitest';

import { nextSpotIndex, recordSpotAttempt, SPOTS_PER_STAGE } from './tree';

describe('stage progress helpers', () => {
  it('resumes at the next unfinished spot', () => {
    expect(nextSpotIndex(0)).toBe(0);
    expect(nextSpotIndex(3)).toBe(3);
    expect(nextSpotIndex(7)).toBe(SPOTS_PER_STAGE - 1);
  });

  it('advances after every attempt, including mistakes', () => {
    expect(recordSpotAttempt(0)).toEqual({ spotsCompleted: 1, stageComplete: false });
    expect(recordSpotAttempt(6)).toEqual({ spotsCompleted: 7, stageComplete: true });
    expect(recordSpotAttempt(7)).toEqual({ spotsCompleted: 7, stageComplete: true });
  });
});
