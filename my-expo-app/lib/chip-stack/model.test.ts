import { describe, expect, it } from 'vitest';

import { effectiveChipStack, mapChipStackPayload, mapStageAnswerPayload } from './model';

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
