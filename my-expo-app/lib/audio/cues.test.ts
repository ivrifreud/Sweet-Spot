import { describe, expect, it } from 'vitest';

import { CORRECT_POOL, IDLE_POOL, INCORRECT_POOL, pickQueued } from './cues';

describe('pickQueued', () => {
  it('returns the only item in a one-cue pool', () => {
    expect(pickQueued(['snore'] as const, 'snore', () => 0.9)).toBe('snore');
  });

  it('skips the last cue so a queue does not repeat immediately', () => {
    expect(pickQueued(CORRECT_POOL, 'correctClown', () => 0)).toBe('correctMelody');
    expect(pickQueued(INCORRECT_POOL, 'incorrectPiano', () => 0)).not.toBe('incorrectPiano');
    expect(pickQueued(IDLE_POOL, 'idleSnore', () => 0)).toBe('idleYawn');
  });

  it('stays inside the pool for every random roll', () => {
    for (let i = 0; i < 8; i += 1) {
      const pick = pickQueued(CORRECT_POOL, 'correctCheer', () => i / 8);
      expect(CORRECT_POOL).toContain(pick);
      expect(pick).not.toBe('correctCheer');
    }
  });
});
