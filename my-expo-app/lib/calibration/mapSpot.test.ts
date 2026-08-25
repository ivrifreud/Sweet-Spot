import { describe, expect, it } from 'vitest';

import { nextCalibrationAction } from './flow';
import { mapSpotRow, type SpotRow } from './mapSpot';
import { STAGE1_SPOTS, STAGE2_SPOTS } from './spots';
import type { PokerAction, SpotAnswer } from './types';

const stage1Row: SpotRow = {
  id: '11111111-1111-4111-8111-111111111101',
  spot_type: 'calibration_stage1',
  hole_cards: ['7h', '2d'],
  board: [],
  pot_size: 3,
  villain_action: 'folds to you',
  prompt: 'UTG, 100bb. Folded to you. You hold 72o.',
  hero_position: 'UTG',
  correct_answer: 'fold',
  is_catastrophic_if_wrong: true,
  sequence_order: 1,
};

const stage2Row: SpotRow = {
  id: '22222222-2222-4222-8222-222222222201',
  spot_type: 'calibration_stage2',
  hole_cards: ['Ah', 'Td'],
  board: ['Ts', '7c', '2d', '8h'],
  pot_size: '12',
  villain_action: 'BB bets 3bb on the turn',
  prompt: 'Button vs BB. Top pair. Call.',
  hero_position: 'BTN',
  correct_answer: 'call',
  is_catastrophic_if_wrong: false,
  sequence_order: 1,
};

function answersFor(
  chosenByIndex: (PokerAction | undefined)[],
  spots = STAGE1_SPOTS
): SpotAnswer[] {
  return spots.flatMap((spot, index) => {
    const chosen = chosenByIndex[index];
    if (chosen === undefined) return [];
    return [{ spotId: spot.id, chosen }];
  });
}

describe('mapSpotRow', () => {
  it('maps a Stage 1 seed-shaped row', () => {
    expect(mapSpotRow(stage1Row)).toEqual({
      id: stage1Row.id,
      spotType: 'calibration_stage1',
      sequenceOrder: 1,
      heroPosition: 'UTG',
      holeCards: ['7h', '2d'],
      board: [],
      potSize: 3,
      villainAction: 'folds to you',
      prompt: stage1Row.prompt,
      correctAnswer: 'fold',
      isCatastrophicIfWrong: true,
    });
  });

  it('maps a Stage 2 seed-shaped row and coerces numeric pot_size', () => {
    const mapped = mapSpotRow(stage2Row);
    expect(mapped.spotType).toBe('calibration_stage2');
    expect(mapped.board).toEqual(['Ts', '7c', '2d', '8h']);
    expect(mapped.potSize).toBe(12);
    expect(mapped.correctAnswer).toBe('call');
    expect(mapped.isCatastrophicIfWrong).toBe(false);
  });
});

describe('nextCalibrationAction', () => {
  it('deals the first unanswered Stage 1 spot', () => {
    const action = nextCalibrationAction(STAGE1_SPOTS, STAGE2_SPOTS, []);
    expect(action).toEqual({ type: 'spot', spot: STAGE1_SPOTS[0] });
  });

  it('finalizes after two Stage 1 catastrophic misses', () => {
    const action = nextCalibrationAction(
      STAGE1_SPOTS,
      STAGE2_SPOTS,
      answersFor(['call', 'raise', 'raise'])
    );
    expect(action).toEqual({ type: 'finalize' });
  });

  it('moves to Stage 2 after a clean Stage 1 sample', () => {
    const action = nextCalibrationAction(
      STAGE1_SPOTS,
      STAGE2_SPOTS,
      answersFor(['fold', 'raise', 'fold', 'call', 'fold', 'raise'])
    );
    expect(action).toEqual({ type: 'spot', spot: STAGE2_SPOTS[0] });
  });

  it('finalizes after a full Stage 2 sample', () => {
    const stage1Answers = answersFor(['fold', 'raise', 'fold', 'call', 'fold', 'raise']);
    const stage2Answers = STAGE2_SPOTS.map((spot) => ({
      spotId: spot.id,
      chosen: spot.correctAnswer,
    }));
    const action = nextCalibrationAction(STAGE1_SPOTS, STAGE2_SPOTS, [
      ...stage1Answers,
      ...stage2Answers,
    ]);
    expect(action).toEqual({ type: 'finalize' });
  });
});
