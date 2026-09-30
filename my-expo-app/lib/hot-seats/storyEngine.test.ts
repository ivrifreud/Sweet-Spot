import { describe, expect, it } from 'vitest';

import { buildArrivalCopy } from '../../src/features/templates/hot-seats/arrivalCopy';
import {
  CASINO_FLOP_STORY,
  GARDEN_PREFLOP_STORY,
} from '../../src/features/templates/hot-seats/fixtures';
import {
  begin,
  cameraLanded,
  cameraReady,
  cardCleared,
  decide,
  gesturesUnlocked,
} from '../../src/features/templates/hot-seats/storyEngine';
import { motionPlan, railPoint, slotForSeat, WHOOSH_MS } from '../../src/features/templates/hot-seats/seatRail';
import {
  buildHotSeatFeedback,
  settleHotSeatResult,
} from '../../src/features/templates/hot-seats/feedback';

function openSeat(story: typeof GARDEN_PREFLOP_STORY, state = begin(story)) {
  return cardCleared(cameraReady(state));
}

describe('Hot Seats story engine', () => {
  it('starts the first seat by arriving, with no decision yet', () => {
    const state = begin(GARDEN_PREFLOP_STORY);
    expect(state.phase).toBe('arriving');
    expect(state.seatIndex).toBe(0);
    expect(gesturesUnlocked(state)).toBe(false);
  });

  it('locks gestures until the arrival card has cleared', () => {
    const arrived = cameraReady(begin(GARDEN_PREFLOP_STORY));
    expect(arrived.phase).toBe('card');
    expect(gesturesUnlocked(arrived)).toBe(false);
    const live = cardCleared(arrived);
    expect(live.phase).toBe('deciding');
    expect(gesturesUnlocked(live)).toBe(true);
  });

  it('ends the whole story on a wrong answer at any seat', () => {
    const first = decide(openSeat(GARDEN_PREFLOP_STORY), 'call');
    expect(first.phase).toBe('explaining');
    expect(first.outcome).toBe('loss');
    expect(first.failedSeatIndex).toBe(0);

    let state = openSeat(CASINO_FLOP_STORY);
    state = cameraLanded(decide(state, 'check'));
    state = openSeat(CASINO_FLOP_STORY, state);
    state = cameraLanded(decide(state, 'check'));
    state = openSeat(CASINO_FLOP_STORY, state);
    const missed = decide(state, 'check');
    expect(missed.outcome).toBe('loss');
    expect(missed.failedSeatIndex).toBe(2);
  });

  it('swings to the next seat only after a correct decision', () => {
    const swapping = decide(openSeat(CASINO_FLOP_STORY), 'check');
    expect(swapping.phase).toBe('swapping');
    const next = cameraLanded(swapping);
    expect(next.phase).toBe('arriving');
    expect(next.seatIndex).toBe(1);
  });

  it('wins only after four correct decisions', () => {
    let state = begin(CASINO_FLOP_STORY);
    CASINO_FLOP_STORY.seats.forEach((seat, index) => {
      state = decide(openSeat(CASINO_FLOP_STORY, state), seat.scriptedAction);
      if (index < 3) state = cameraLanded(state);
    });
    expect(state.phase).toBe('explaining');
    expect(state.outcome).toBe('win');
    expect(state.failedSeatIndex).toBeNull();
  });

  it('ignores decisions outside the deciding phase and illegal actions', () => {
    const arriving = begin(GARDEN_PREFLOP_STORY);
    expect(decide(arriving, 'fold')).toBe(arriving);
    const live = openSeat(GARDEN_PREFLOP_STORY);
    expect(decide(live, 'check')).toBe(live);
    expect(cameraLanded(live)).toBe(live);
  });
});

describe('Hot Seats presentation rules', () => {
  it('speaks the four arrival facts from the seat', () => {
    expect(buildArrivalCopy(GARDEN_PREFLOP_STORY.seats[3])).toBe(
      'You are the big blind. You have 36bb. The cutoff raised. You are next to act.'
    );
  });

  it('moves the next seat clockwise into the bottom anchor', () => {
    expect(slotForSeat(1, 0)).toBe(1);
    expect(railPoint(1, 0)).toEqual({ x: -124, y: 28 });
    expect(railPoint(1, 1)).toEqual({ x: 0, y: 188 });
  });

  it('uses a 720ms whoosh and a fade when motion is reduced', () => {
    expect(WHOOSH_MS).toBe(720);
    expect(motionPlan(false, false)).toMatchObject({ kind: 'whoosh', durationMs: 720, whoosh: true });
    expect(motionPlan(false, true)).toMatchObject({ kind: 'settle', whoosh: false });
    expect(motionPlan(true, false)).toMatchObject({ kind: 'fade', durationMs: 180, whoosh: false });
  });

  it('shows every seat after a loss and marks only the miss', () => {
    const loss = decide(openSeat(GARDEN_PREFLOP_STORY), 'raise');
    const feedback = buildHotSeatFeedback(loss);
    expect(feedback.rows).toHaveLength(4);
    expect(feedback.rows.filter((row) => row.missed)).toHaveLength(1);
    expect(feedback.rows[0]).toMatchObject({ missed: true, chosenAction: 'Raise' });
    expect(feedback.copy.outcome).toBe('incorrect');
    expect(feedback.copy.explanation).toContain('PLACEHOLDER');
  });

  it('burns one Chip and records one spot for the whole story', () => {
    expect(settleHotSeatResult({ outcome: 'loss', chips: 3, spotsCompleted: 1 })).toEqual({
      burned: true,
      remainingChips: 2,
      spotsCompleted: 2,
      stageComplete: false,
    });
    expect(settleHotSeatResult({ outcome: 'win', chips: 3, spotsCompleted: 6 })).toMatchObject({
      burned: false,
      remainingChips: 3,
      spotsCompleted: 7,
      stageComplete: true,
    });
  });
});
