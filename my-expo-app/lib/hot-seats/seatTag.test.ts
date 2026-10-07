import { describe, expect, it } from 'vitest';

import { GARDEN_PREFLOP_STORY } from '../../src/features/templates/hot-seats/fixtures';
import {
  formatSeatAction,
  seatTagLines,
  seatTagTone,
  stackTier,
} from '../../src/features/templates/hot-seats/seatTag';
import { raiseSizePair } from '../../src/features/templates/hot-seats/raiseSizes';

describe('seat tags', () => {
  it('shows the seat until they act, then a full action sentence', () => {
    const waiting = seatTagLines({
      seatIndex: 2,
      position: 'CO',
      stack: 42,
      action: null,
      raiseSize: null,
      facingRaise: false,
      street: 'preflop',
    });
    expect(waiting.title).toBe('CO');
    expect(waiting.detail).toBe('42 BB');
    expect(waiting.actionLabel).toBeNull();
    expect(waiting.tone).toBe('idle');

    const acted = seatTagLines({
      seatIndex: 2,
      position: 'cutoff',
      stack: 42,
      action: 'raise',
      raiseSize: 6,
      facingRaise: false,
      street: 'preflop',
    });
    expect(acted.title).toBe('CO');
    expect(acted.actionLabel).toBe('CO raised 6BB');
    expect(acted.tone).toBe('raise');
    expect(acted.stackLabel).toBe('42 BB');
  });

  it('says folded, raised, limped, or called', () => {
    expect(formatSeatAction('UTG', 'fold', null, false, 'preflop')).toBe('UTG folded');
    expect(formatSeatAction('CO', 'raise', 3, false, 'preflop')).toBe('CO raised 3BB');
    expect(formatSeatAction('cutoff', 'raise', 9, true, 'preflop')).toBe('CO raised 9BB');
    expect(formatSeatAction('HJ', 'call', null, false, 'preflop')).toBe('HJ limped');
    expect(formatSeatAction('BB', 'call', null, true, 'preflop')).toBe('BB called');
    expect(formatSeatAction('SB', 'check', null, false, 'flop')).toBe('SB checked');
  });

  it('paints fold red, call teal, and raise gold', () => {
    expect(seatTagTone('fold')).toBe('fold');
    expect(seatTagTone('call')).toBe('call');
    expect(seatTagTone('raise')).toBe('raise');
    expect(seatTagTone('check')).toBe('idle');
    expect(seatTagTone(null)).toBe('idle');
  });
});

describe('stack paintings', () => {
  it('picks small, medium, or large from the authored stack', () => {
    expect(stackTier(29)).toBe('small');
    expect(stackTier(30)).toBe('medium');
    expect(stackTier(69)).toBe('medium');
    expect(stackTier(70)).toBe('large');
    expect(stackTier(GARDEN_PREFLOP_STORY.seats[0]!.stack)).toBe('medium');
  });
});

describe('raise size pair', () => {
  it('keeps the scripted size and a nearby decoy, shuffled per seat', () => {
    const cutoff = raiseSizePair({
      storyId: GARDEN_PREFLOP_STORY.id,
      seatIndex: 2,
      scriptedAction: 'raise',
      raiseSize: 6,
      street: 'preflop',
    });
    expect(cutoff.sizes).toHaveLength(2);
    expect(cutoff.sizes).toContain(6);
    expect(cutoff.correct).toBe(6);
    const decoy = cutoff.sizes.find((size) => size !== 6)!;
    expect(decoy).not.toBe(6);
    expect(decoy).toBeGreaterThanOrEqual(3);
    expect(decoy).toBeLessThanOrEqual(10);
    expect(decoy / 6).toBeGreaterThanOrEqual(0.5);
    expect(decoy / 6).toBeLessThanOrEqual(1.6);

    const again = raiseSizePair({
      storyId: GARDEN_PREFLOP_STORY.id,
      seatIndex: 2,
      scriptedAction: 'raise',
      raiseSize: 6,
      street: 'preflop',
    });
    expect(again.sizes).toEqual(cutoff.sizes);

    const nextSeat = raiseSizePair({
      storyId: GARDEN_PREFLOP_STORY.id,
      seatIndex: 3,
      scriptedAction: 'call',
      raiseSize: null,
      street: 'preflop',
    });
    expect(nextSeat.correct).toBeNull();
    expect(nextSeat.sizes[0]).not.toBe(nextSeat.sizes[1]);
    nextSeat.sizes.forEach((size) => {
      expect(size).toBeGreaterThanOrEqual(2);
      expect(size).toBeLessThanOrEqual(10);
    });
  });
});
