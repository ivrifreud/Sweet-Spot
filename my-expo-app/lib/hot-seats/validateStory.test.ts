import { describe, expect, it } from 'vitest';

import { validateStory, type HotSeatStory } from '../../src/features/templates/hot-seats/validateStory';

function story(overrides: Partial<HotSeatStory> = {}): HotSeatStory {
  const base: HotSeatStory = {
    id: 'placeholder-preflop-orbit',
    placeholder: true,
    skin: 'garden',
    street: 'preflop',
    blinds: { sb: 1, bb: 2 },
    pot: 3,
    communityCards: [],
    stageTakeaway: 'PLACEHOLDER: the same hand changes with the seat and the action in front of you.',
    seats: [
      seat('UTG', 'fold', ['As', 'Kd'], null),
      seat('HJ', 'fold', ['7c', '6c'], null),
      seat('CO', 'raise', ['Qs', 'Js'], 6),
      seat('BB', 'call', ['Ad', 'Qd'], null, 'The cutoff raised.'),
    ],
  };
  return { ...base, ...overrides, seats: overrides.seats ?? base.seats };
}

function seat(
  position: HotSeatStory['seats'][number]['position'],
  action: HotSeatStory['seats'][number]['scriptedAction'],
  holeCards: HotSeatStory['seats'][number]['holeCards'],
  raiseSize: number | null,
  priorAction = 'The action is on you.'
): HotSeatStory['seats'][number] {
  const frequencies = { fold: 0, check: 0, call: 0, raise: 0 };
  frequencies[action] = 100;
  const legalActions =
    action === 'check' ? (['check', 'raise'] as const) : (['fold', 'call', 'raise'] as const);
  return {
    position,
    stack: 40,
    holeCards,
    scriptedAction: action,
    raiseSize,
    frequencies,
    legalActions: [...legalActions],
    explanation: `PLACEHOLDER: ${position} should ${action}.`,
    priorAction,
  };
}

describe('validateStory', () => {
  it('accepts a four-seat pre-flop story', () => {
    expect(validateStory(story()).ok).toBe(true);
  });

  it('rejects a flop with the wrong number of community cards', () => {
    const result = validateStory(story({ street: 'flop', communityCards: ['Ah', 'Kd'] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues).toContain('board-count');
  });

  it('rejects duplicate positions', () => {
    const seats = story().seats;
    seats[1] = { ...seats[1], position: 'UTG' };
    const result = validateStory(story({ seats }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues).toContain('duplicate-position');
  });

  it('rejects a tied frequency and a scripted action that is not the unique maximum', () => {
    const seats = story().seats;
    seats[0] = {
      ...seats[0],
      frequencies: { fold: 50, check: 0, call: 50, raise: 0 },
    };
    const tied = validateStory(story({ seats }));
    expect(tied.ok).toBe(false);
    if (!tied.ok) expect(tied.issues).toContain('frequency-tie');

    seats[0] = {
      ...seats[0],
      scriptedAction: 'fold',
      frequencies: { fold: 10, check: 0, call: 90, raise: 0 },
    };
    const mismatch = validateStory(story({ seats }));
    expect(mismatch.ok).toBe(false);
    if (!mismatch.ok) expect(mismatch.issues).toContain('frequency-mismatch');
  });

  it('rejects check while a seat is facing a bet', () => {
    const seats = story().seats;
    seats[0] = {
      ...seats[0],
      scriptedAction: 'check',
      raiseSize: null,
      frequencies: { fold: 0, check: 100, call: 0, raise: 0 },
      legalActions: ['check'],
    };
    const result = validateStory(story({ seats }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues).toContain('check-facing-bet');
  });

  it('rejects a raise without one positive size', () => {
    const seats = story().seats;
    seats[2] = { ...seats[2], raiseSize: null };
    const result = validateStory(story({ seats }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues).toContain('raise-size');
  });

  it('rejects a story that is not exactly four seats', () => {
    const result = validateStory({ ...story(), seats: story().seats.slice(0, 3) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues).toContain('seat-count');
  });
});
