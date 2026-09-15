import { describe, expect, it } from 'vitest';

import {
  CORRECT_POOL,
  IDLE_POOL,
  INCORRECT_POOL,
  pickQueued,
  shouldReplayDecisionSting,
} from './cues';

describe('decision sting pools', () => {
  it('alternates between the original correct sting and casino coins', () => {
    expect(CORRECT_POOL).toEqual(['correct', 'correctCasinoCoins']);
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

  it('skips the last cue so a queue does not repeat immediately', () => {
    expect(pickQueued(CORRECT_POOL, 'correct', () => 0)).toBe('correctCasinoCoins');
  });

  it('stays inside the pool for every random roll', () => {
    for (let i = 0; i < 8; i += 1) {
      const pick = pickQueued(CORRECT_POOL, 'correctCasinoCoins', () => i / 8);
      expect(CORRECT_POOL).toContain(pick);
      expect(pick).not.toBe('correctCasinoCoins');
    }
  });
});
