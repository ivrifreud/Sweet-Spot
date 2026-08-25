import { describe, expect, it } from 'vitest';

import { canCheckSpot, pokerActionForDecision, toPeekAndPitchSpot } from './presentation';
import { CALIBRATION_SPOTS } from './spots';
import type { CalibrationSpot } from './types';

const preflop: CalibrationSpot = {
  id: 'preflop',
  spotType: 'calibration_stage1',
  sequenceOrder: 2,
  heroPosition: 'BTN',
  holeCards: ['Ah', 'Ks'],
  board: [],
  potSize: 8,
  villainAction: 'CO opens to 2.5bb',
  prompt: 'Button, 100bb. CO opens.',
  correctAnswer: 'raise',
  isCatastrophicIfWrong: false,
};

const checkedFlop: CalibrationSpot = {
  ...preflop,
  id: 'checked-flop',
  spotType: 'calibration_stage2',
  sequenceOrder: 4,
  heroPosition: 'CO',
  holeCards: ['8s', '8d'],
  board: ['8h', '4c', '2s'],
  potSize: 10,
  villainAction: 'BB checks',
};

describe('calibration presentation', () => {
  it('maps a pre-flop calibration spot into a fixed table spot', () => {
    expect(toPeekAndPitchSpot(preflop, 'Stage 1 · 2 / 6')).toEqual({
      id: 'preflop',
      skin: 'garden',
      heroCards: ['Ah', 'Ks'],
      board: [],
      position: 'BTN',
      actionLine: 'CO opens to 2.5bb',
      potLabel: '8bb',
      heroStackLabel: '100bb',
      prompt: 'Button, 100bb. CO opens.',
      progressLabel: 'Stage 1 · 2 / 6',
      canCheck: false,
    });
  });

  it('preserves every post-flop community card', () => {
    expect(toPeekAndPitchSpot(checkedFlop, 'Stage 2 · 4 / 6').board).toEqual(['8h', '4c', '2s']);
    expect(canCheckSpot(checkedFlop)).toBe(true);
  });

  it('maps a legal Check gesture to the persisted call action', () => {
    expect(pokerActionForDecision('check', checkedFlop)).toBe('call');
  });

  it('rejects Check when the player is facing action', () => {
    expect(() => pokerActionForDecision('check', preflop)).toThrow(
      'Check is not legal when facing a bet'
    );
  });

  it('adapts all 12 seeded calibration hands without changing their cards', () => {
    expect(CALIBRATION_SPOTS).toHaveLength(12);

    for (const spot of CALIBRATION_SPOTS) {
      const tableSpot = toPeekAndPitchSpot(spot, `Spot ${spot.sequenceOrder}`);
      expect(tableSpot.id).toBe(spot.id);
      expect(tableSpot.heroCards).toEqual(spot.holeCards);
      expect(tableSpot.board).toEqual(spot.board);
      expect(tableSpot.position).toBe(spot.heroPosition);
    }
  });
});
