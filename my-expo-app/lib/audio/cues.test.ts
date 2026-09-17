import { describe, expect, it } from 'vitest';

import {
  CORRECT_LAYER_CUES,
  CORRECT_POOL,
  IDLE_POOL,
  INCORRECT_POOL,
  pickQueued,
  shouldReplayDecisionSting,
} from './cues';

describe('decision sting pools', () => {
  it('plays the correct sting with a confetti bed, and never casino coins on a normal hit', () => {
    expect(CORRECT_POOL).toEqual(['correct']);
    expect(CORRECT_LAYER_CUES).toEqual(['correct', 'confetti']);
    expect(INCORRECT_POOL).toEqual(['incorrect']);
  });

  it('has no idle snore or yawn queue', () => {
    expect(IDLE_POOL).toEqual([]);
  });
});

describe('shouldReplayDecisionSting', () => {
  it('blocks a second play for the same feedback key', () => {
    expect(shouldReplayDecisionSting('hand-1', undefined)).toBe(true);
    expect(shouldReplayDecisionSting('hand-1', 'hand-1')).toBe(false);
    expect(shouldReplayDecisionSting('hand-2', 'hand-1')).toBe(true);
  });
});

describe('pickQueued', () => {
  it('returns the only item in a one-cue pool', () => {
    expect(pickQueued(['snore'] as const, 'snore', () => 0.9)).toBe('snore');
    expect(pickQueued(INCORRECT_POOL, 'incorrect', () => 0.9)).toBe('incorrect');
  });

  it('returns the only correct sting when the pool is a single cue', () => {
    expect(pickQueued(CORRECT_POOL, 'correct', () => 0)).toBe('correct');
  });
});
