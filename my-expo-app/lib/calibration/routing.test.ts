import { describe, expect, it } from 'vitest';

import {
  evaluateStage1,
  evaluateStage2,
  isAnswerCorrect,
  routeCalibration,
  startingEloForLevel,
} from './routing';
import { STAGE1_SPOTS, STAGE2_SPOTS } from './spots';
import type { CalibrationSpot, PokerAction, SpotAnswer } from './types';

function answersFor(
  spots: CalibrationSpot[],
  chosenByIndex: (PokerAction | undefined)[]
): SpotAnswer[] {
  return spots.flatMap((spot, index) => {
    const chosen = chosenByIndex[index];
    if (chosen === undefined) return [];
    return [{ spotId: spot.id, chosen }];
  });
}

function allCorrect(spots: CalibrationSpot[]): SpotAnswer[] {
  return spots.map((spot) => ({ spotId: spot.id, chosen: spot.correctAnswer }));
}

describe('startingEloForLevel', () => {
  it('uses mid-bucket starting Elo for each placement', () => {
    expect(startingEloForLevel(1)).toBe(300);
    expect(startingEloForLevel(2)).toBe(850);
    expect(startingEloForLevel(3)).toBe(1300);
  });
});

describe('isAnswerCorrect', () => {
  it('matches the authored answer key exactly', () => {
    const spot = STAGE1_SPOTS[0];
    expect(isAnswerCorrect(spot, 'fold')).toBe(true);
    expect(isAnswerCorrect(spot, 'call')).toBe(false);
    expect(isAnswerCorrect(spot, 'raise')).toBe(false);
  });
});

describe('evaluateStage1', () => {
  it.each([
    {
      label: '0 catastrophic errors',
      chosen: ['fold', 'raise', 'fold', 'call', 'fold', 'raise'] as PokerAction[],
      next: 'stage_2',
      errors: 0,
    },
    {
      label: '1 catastrophic error',
      chosen: ['call', 'raise', 'fold', 'call', 'fold', 'raise'] as PokerAction[],
      next: 'stage_2',
      errors: 1,
    },
  ])('routes to stage 2 with $label', ({ chosen, next, errors }) => {
    const result = evaluateStage1(STAGE1_SPOTS, answersFor(STAGE1_SPOTS, chosen));
    expect(result).toEqual({ catastrophicErrors: errors, next });
  });

  it('places Level 1 at 2 catastrophic errors and ignores leftover spots', () => {
    const result = evaluateStage1(
      STAGE1_SPOTS,
      answersFor(STAGE1_SPOTS, ['call', 'raise', 'raise'])
    );
    expect(result.next).toBe('place_level_1');
    expect(result.catastrophicErrors).toBe(2);
  });

  it('does not count a non-catastrophic miss toward Level 1', () => {
    const result = evaluateStage1(
      STAGE1_SPOTS,
      answersFor(STAGE1_SPOTS, ['fold', 'fold', 'fold', 'fold', 'fold', 'fold'])
    );
    expect(result.catastrophicErrors).toBe(0);
    expect(result.next).toBe('stage_2');
  });
});

describe('evaluateStage2', () => {
  it('places Level 3 on a full EV+ pass', () => {
    expect(evaluateStage2(STAGE2_SPOTS, allCorrect(STAGE2_SPOTS))).toEqual({
      misses: 0,
      placement: 3,
    });
  });

  it('places Level 2 on any miss after a full sample', () => {
    const answers = allCorrect(STAGE2_SPOTS);
    answers[0] = { ...answers[0], chosen: 'fold' };
    expect(evaluateStage2(STAGE2_SPOTS, answers)).toEqual({
      misses: 1,
      placement: 2,
    });
  });

  it('refuses to place before every Stage 2 spot is answered', () => {
    expect(() => evaluateStage2(STAGE2_SPOTS, allCorrect(STAGE2_SPOTS).slice(0, 5))).toThrow(
      'Stage 2 requires a full sample before placement'
    );
  });
});

describe('routeCalibration', () => {
  it('returns Level 1 unchanged when Stage 2 is also supplied after a Stage 1 fail', () => {
    const result = routeCalibration({
      stage1: {
        spots: STAGE1_SPOTS,
        answers: answersFor(STAGE1_SPOTS, ['call', 'raise', 'raise']),
      },
      stage2: {
        spots: STAGE2_SPOTS,
        answers: allCorrect(STAGE2_SPOTS),
      },
    });
    expect(result).toEqual({
      placement: 1,
      reason: 'stage1_catastrophic',
      startingElo: 300,
    });
  });

  it('places Level 3 after Stage 1 advance and a Stage 2 full pass', () => {
    const result = routeCalibration({
      stage1: { spots: STAGE1_SPOTS, answers: allCorrect(STAGE1_SPOTS) },
      stage2: { spots: STAGE2_SPOTS, answers: allCorrect(STAGE2_SPOTS) },
    });
    expect(result).toEqual({
      placement: 3,
      reason: 'stage2_full_pass',
      startingElo: 1300,
    });
  });

  it('places Level 2 after Stage 1 advance and any Stage 2 miss', () => {
    const stage2Answers = allCorrect(STAGE2_SPOTS);
    stage2Answers[2] = { ...stage2Answers[2], chosen: 'call' };
    const result = routeCalibration({
      stage1: { spots: STAGE1_SPOTS, answers: allCorrect(STAGE1_SPOTS) },
      stage2: { spots: STAGE2_SPOTS, answers: stage2Answers },
    });
    expect(result).toEqual({
      placement: 2,
      reason: 'stage2_miss',
      startingElo: 850,
    });
  });

  it('throws when Stage 2 is required but missing', () => {
    expect(() =>
      routeCalibration({
        stage1: { spots: STAGE1_SPOTS, answers: allCorrect(STAGE1_SPOTS) },
      })
    ).toThrow('Stage 2 answers required when Stage 1 does not place Level 1');
  });
});
