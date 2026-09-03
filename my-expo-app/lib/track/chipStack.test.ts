import { describe, expect, it, vi } from 'vitest';

import { CHIP_REGEN_MS, resolveChipStack } from './chipStack';

vi.mock('../supabase', () => ({ supabase: null }));

describe('resolveChipStack', () => {
  const burnedAt = '2026-08-31T08:00:00.000Z';
  const burnedAtMs = Date.parse(burnedAt);

  it('returns a countdown target while an incomplete stack regenerates', () => {
    expect(resolveChipStack(1, burnedAt, burnedAtMs + 1_000)).toEqual({
      remaining: 1,
      regenAt: new Date(burnedAtMs + CHIP_REGEN_MS).toISOString(),
    });
  });

  it('returns a full stack once the twelve-hour cooldown has passed', () => {
    expect(resolveChipStack(0, burnedAt, burnedAtMs + CHIP_REGEN_MS)).toEqual({
      remaining: 3,
      regenAt: null,
    });
  });

  it('does not show a timer for a full stack', () => {
    expect(resolveChipStack(3, burnedAt, burnedAtMs + 1_000)).toEqual({
      remaining: 3,
      regenAt: null,
    });
  });
});
