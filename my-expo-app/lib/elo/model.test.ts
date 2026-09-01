import { describe, expect, it } from 'vitest';

import { applyEloDelta, eloDelta, expectedScore, LEVEL1_STAGE1_SPOT_ELO } from './model';

describe('hidden Elo delta', () => {
  it('awards +8 and deducts -8 when player Elo matches a Level 1 spot', () => {
    expect(expectedScore(300, LEVEL1_STAGE1_SPOT_ELO)).toBe(0.5);
    expect(
      eloDelta({
        currentElo: 300,
        spotElo: LEVEL1_STAGE1_SPOT_ELO,
        correct: true,
        catastrophicIfWrong: false,
      })
    ).toBe(8);
    expect(
      eloDelta({
        currentElo: 300,
        spotElo: LEVEL1_STAGE1_SPOT_ELO,
        correct: false,
        catastrophicIfWrong: false,
      })
    ).toBe(-8);
  });

  it('doubles a miss when the spot is catastrophic', () => {
    expect(
      eloDelta({
        currentElo: 300,
        spotElo: LEVEL1_STAGE1_SPOT_ELO,
        correct: false,
        catastrophicIfWrong: true,
      })
    ).toBe(-16);
  });

  it('does not double a correct answer on a catastrophic-flagged spot', () => {
    expect(
      eloDelta({
        currentElo: 300,
        spotElo: LEVEL1_STAGE1_SPOT_ELO,
        correct: true,
        catastrophicIfWrong: true,
      })
    ).toBe(8);
  });

  it('punishes a high-Elo miss on an easy spot more than a low-Elo miss', () => {
    const highMiss = eloDelta({
      currentElo: 1300,
      spotElo: LEVEL1_STAGE1_SPOT_ELO,
      correct: false,
      catastrophicIfWrong: false,
    });
    const lowMiss = eloDelta({
      currentElo: 100,
      spotElo: LEVEL1_STAGE1_SPOT_ELO,
      correct: false,
      catastrophicIfWrong: false,
    });
    expect(highMiss).toBeLessThan(lowMiss);
    expect(highMiss).toBe(-16);
    expect(lowMiss).toBe(-4);
  });

  it('clamps Elo at zero', () => {
    expect(applyEloDelta(10, -16)).toBe(0);
    expect(applyEloDelta(300, 8)).toBe(308);
  });
});
