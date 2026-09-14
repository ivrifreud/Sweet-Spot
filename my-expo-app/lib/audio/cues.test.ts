import { describe, expect, it } from 'vitest';

import { CORRECT_POOL, IDLE_POOL, INCORRECT_POOL, pickQueued } from './cues';

describe('decision sting pools', () => {
  it('plays one correct cue and one incorrect cue', () => {
    expect(CORRECT_POOL).toEqual(['correct']);
    expect(INCORRECT_POOL).toEqual(['incorrect']);
  });
});

describe('pickQueued', () => {
  it('returns the only item in a one-cue pool', () => {
    expect(pickQueued(['snore'] as const, 'snore', () => 0.9)).toBe('snore');
    expect(pickQueued(CORRECT_POOL, 'correct', () => 0.9)).toBe('correct');
    expect(pickQueued(INCORRECT_POOL, 'incorrect', () => 0.9)).toBe('incorrect');
  });

  it('skips the last cue so a queue does not repeat immediately', () => {
    expect(pickQueued(IDLE_POOL, 'idleSnore', () => 0)).toBe('idleYawn');
  });

  it('stays inside the pool for every random roll', () => {
    for (let i = 0; i < 8; i += 1) {
      const pick = pickQueued(IDLE_POOL, 'idleYawn', () => i / 8);
      expect(IDLE_POOL).toContain(pick);
      expect(pick).not.toBe('idleYawn');
    }
  });
});
