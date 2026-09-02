import { describe, expect, it } from 'vitest';

import {
  applyLocalRegen,
  effectiveChipStack,
  formatRegenCountdown,
  mapChipStackPayload,
  mapStageAnswerPayload,
} from './model';

const BURNED_AT = '2026-08-25T06:00:00.000Z';

describe('effectiveChipStack', () => {
  it('keeps a full stack available without a cooldown', () => {
    expect(
      effectiveChipStack(
        { chips: 3, lastBurnedAt: BURNED_AT },
        new Date('2026-08-25T06:01:00.000Z')
      )
    ).toEqual({ chips: 3, lockedOut: false, regenAt: null });
  });

  it('keeps a partial stack and exposes its refill time before 12 hours', () => {
    expect(
      effectiveChipStack(
        { chips: 2, lastBurnedAt: BURNED_AT },
        new Date('2026-08-25T17:59:59.999Z')
      )
    ).toEqual({
      chips: 2,
      lockedOut: false,
      regenAt: '2026-08-25T18:00:00.000Z',
    });
  });

  it('keeps an empty stack locked before the cooldown expires', () => {
    expect(
      effectiveChipStack(
        { chips: 0, lastBurnedAt: BURNED_AT },
        new Date('2026-08-25T17:59:59.999Z')
      )
    ).toEqual({
      chips: 0,
      lockedOut: true,
      regenAt: '2026-08-25T18:00:00.000Z',
    });
  });

  it('refills the stack at the exact 12-hour boundary', () => {
    expect(
      effectiveChipStack(
        { chips: 0, lastBurnedAt: BURNED_AT },
        new Date('2026-08-25T18:00:00.000Z')
      )
    ).toEqual({ chips: 3, lockedOut: false, regenAt: null });
  });
});

describe('applyLocalRegen', () => {
  const locked = {
    chips: 0 as const,
    lockedOut: true,
    regenAt: '2026-08-25T18:00:00.000Z',
  };

  it('keeps a locked stack before the cooldown expires', () => {
    expect(applyLocalRegen(locked, new Date('2026-08-25T17:59:59.999Z'))).toEqual(locked);
  });

  it('refills at the exact regen boundary', () => {
    expect(applyLocalRegen(locked, new Date('2026-08-25T18:00:00.000Z'))).toEqual({
      chips: 3,
      lockedOut: false,
      regenAt: null,
    });
  });

  it('refills after the cooldown has passed', () => {
    expect(applyLocalRegen(locked, new Date('2026-08-25T18:00:00.001Z'))).toEqual({
      chips: 3,
      lockedOut: false,
      regenAt: null,
    });
  });

  it('leaves a stack with no regen timestamp unchanged', () => {
    const full = { chips: 3 as const, lockedOut: false, regenAt: null };
    expect(applyLocalRegen(full, new Date('2026-08-25T18:00:00.000Z'))).toEqual(full);
  });
});

describe('formatRegenCountdown', () => {
  const regenAt = '2026-08-25T18:00:00.000Z';

  it('formats hours and minutes', () => {
    expect(formatRegenCountdown(regenAt, new Date('2026-08-25T10:48:00.000Z'))).toBe('7h 12m');
  });

  it('formats remaining minutes under an hour', () => {
    expect(formatRegenCountdown(regenAt, new Date('2026-08-25T17:41:01.000Z'))).toBe('19m');
  });

  it('uses less than a minute when under 60 seconds or already due', () => {
    expect(formatRegenCountdown(regenAt, new Date('2026-08-25T17:59:01.000Z'))).toBe(
      'less than a minute'
    );
    expect(formatRegenCountdown(regenAt, new Date('2026-08-25T18:00:01.000Z'))).toBe(
      'less than a minute'
    );
  });
});

describe('RPC payload mapping', () => {
  it('maps an unlocked chip stack', () => {
    expect(
      mapChipStackPayload({
        chips: 2,
        locked_out: false,
        regen_at: '2026-08-25T18:00:00+00:00',
      })
    ).toEqual({
      chips: 2,
      lockedOut: false,
      regenAt: '2026-08-25T18:00:00+00:00',
    });
  });

  it('maps an idempotent locked-out answer response', () => {
    expect(
      mapStageAnswerPayload({
        is_correct: false,
        chips: 0,
        locked_out: true,
        regen_at: '2026-08-25T18:00:00+00:00',
        stage_status: 'locked_out',
        already_submitted: true,
        current_elo: 284,
      })
    ).toEqual({
      isCorrect: false,
      chips: 0,
      lockedOut: true,
      regenAt: '2026-08-25T18:00:00+00:00',
      stageStatus: 'locked_out',
      alreadySubmitted: true,
      currentElo: 284,
    });
  });

  it('rejects an inconsistent lock state', () => {
    expect(() =>
      mapChipStackPayload({
        chips: 1,
        locked_out: true,
        regen_at: '2026-08-25T18:00:00+00:00',
      })
    ).toThrow('Inconsistent chip stack');
  });
});
