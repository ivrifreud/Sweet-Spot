import { describe, expect, it } from 'vitest';

import { GARDEN_SWAP_CUE, swapTagProgress } from '../../src/features/templates/hot-seats/hotSeatSwapVideoPlan';
import { lerpFrame, tagHatForSeat } from '../../src/features/templates/hot-seats/sceneLayout';

describe('swap tags', () => {
  it('moves tags from 0 at the clip start to 1 at the landing', () => {
    expect(swapTagProgress(GARDEN_SWAP_CUE.sourceInSeconds)).toBe(0);
    expect(swapTagProgress(GARDEN_SWAP_CUE.sourceOutSeconds)).toBe(1);
    expect(swapTagProgress((GARDEN_SWAP_CUE.sourceInSeconds + GARDEN_SWAP_CUE.sourceOutSeconds) / 2)).toBeCloseTo(
      0.5
    );
  });

  it('sends the next actor from the left hat onto the hero hat', () => {
    const hats = {
      hero: { x: 100, y: 400, width: 120, height: 44 },
      left: { x: 10, y: 40, width: 120, height: 44 },
      far: { x: 100, y: 10, width: 120, height: 44 },
      right: { x: 190, y: 40, width: 120, height: 44 },
    };
    const start = tagHatForSeat(hats, 1, 0, 0);
    const end = tagHatForSeat(hats, 1, 0, 1);
    expect(start).toEqual(hats.left);
    expect(end).toEqual(hats.hero);
    expect(lerpFrame(hats.left, hats.hero, 0.5).x).toBeCloseTo(55);
  });
});
