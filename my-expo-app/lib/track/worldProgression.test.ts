import { describe, expect, it } from 'vitest';

import {
  LOCAL_CASINO_LAYER_UNLOCKS,
  filmFlickerAlpha,
  shouldApplyFilmTreatment,
  visibleProgressionLayers,
} from './worldProgression';

function chunkWith(unlocks: readonly number[]) {
  return {
    progressionLayers: unlocks.map((unlockAfterStage) => ({
      unlockAfterStage,
      source: unlockAfterStage,
    })),
  };
}

describe('LOCAL_CASINO_LAYER_UNLOCKS', () => {
  it('unlocks Town Gate after stages 1–4, Main Street after 5–8, and Casino Rise after 9–12', () => {
    expect(LOCAL_CASINO_LAYER_UNLOCKS.a).toEqual([1, 2, 3, 4]);
    expect(LOCAL_CASINO_LAYER_UNLOCKS.b).toEqual([5, 6, 7, 8]);
    expect(LOCAL_CASINO_LAYER_UNLOCKS.c).toEqual([9, 10, 11, 12]);
  });
});

describe('visibleProgressionLayers', () => {
  const townGate = chunkWith(LOCAL_CASINO_LAYER_UNLOCKS.a);
  const mainStreet = chunkWith(LOCAL_CASINO_LAYER_UNLOCKS.b);
  const casinoRise = chunkWith(LOCAL_CASINO_LAYER_UNLOCKS.c);

  it('shows no overlays at zero progress', () => {
    expect(visibleProgressionLayers(townGate, 0)).toEqual([]);
    expect(visibleProgressionLayers(mainStreet, 0)).toEqual([]);
    expect(visibleProgressionLayers(casinoRise, 0)).toEqual([]);
  });

  it('shows only unlocked Town Gate layers for partial progress', () => {
    expect(visibleProgressionLayers(townGate, 1).map((layer) => layer.unlockAfterStage)).toEqual([
      1,
    ]);
    expect(visibleProgressionLayers(townGate, 3).map((layer) => layer.unlockAfterStage)).toEqual([
      1, 2, 3,
    ]);
    expect(visibleProgressionLayers(mainStreet, 3)).toEqual([]);
    expect(visibleProgressionLayers(casinoRise, 3)).toEqual([]);
  });

  it('opens the next chunk only after its first stage threshold', () => {
    expect(visibleProgressionLayers(townGate, 4)).toHaveLength(4);
    expect(visibleProgressionLayers(mainStreet, 4)).toEqual([]);
    expect(visibleProgressionLayers(mainStreet, 5)).toHaveLength(1);
    expect(visibleProgressionLayers(mainStreet, 8)).toHaveLength(4);
    expect(visibleProgressionLayers(casinoRise, 8)).toEqual([]);
    expect(visibleProgressionLayers(casinoRise, 9)).toHaveLength(1);
  });

  it('shows every overlay when the town is complete', () => {
    expect(visibleProgressionLayers(townGate, 12)).toHaveLength(4);
    expect(visibleProgressionLayers(mainStreet, 12)).toHaveLength(4);
    expect(visibleProgressionLayers(casinoRise, 12)).toHaveLength(4);
  });

  it('returns layers sorted by unlock stage even if authored out of order', () => {
    const shuffled = {
      progressionLayers: [
        { unlockAfterStage: 4, source: 4 },
        { unlockAfterStage: 1, source: 1 },
        { unlockAfterStage: 3, source: 3 },
        { unlockAfterStage: 2, source: 2 },
      ],
    };
    expect(visibleProgressionLayers(shuffled, 4).map((layer) => layer.unlockAfterStage)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('never leaks a future layer', () => {
    for (const completedCount of [0, 1, 4, 5, 8, 9, 12]) {
      for (const chunk of [townGate, mainStreet, casinoRise]) {
        for (const layer of visibleProgressionLayers(chunk, completedCount)) {
          expect(layer.unlockAfterStage).toBeLessThanOrEqual(completedCount);
        }
      }
    }
  });

  it('keeps Benny chunks empty at every completed count', () => {
    const bennys = { progressionLayers: [] };
    expect(visibleProgressionLayers(bennys, 0)).toEqual([]);
    expect(visibleProgressionLayers(bennys, 12)).toEqual([]);
  });
});

describe('film treatment', () => {
  it('applies grain and flicker only on the Local Casino map', () => {
    expect(shouldApplyFilmTreatment('local-casino')).toBe(true);
    expect(shouldApplyFilmTreatment('bennys-garden')).toBe(false);
    expect(shouldApplyFilmTreatment('vip-room')).toBe(false);
  });

  it('disables flicker when reduced motion is on', () => {
    expect(filmFlickerAlpha({ reducedMotion: true, maxFlicker: 0.02, pulse: 1 })).toBe(0);
    expect(filmFlickerAlpha({ reducedMotion: false, maxFlicker: 0.02, pulse: 1 })).toBe(0.02);
    expect(filmFlickerAlpha({ reducedMotion: false, maxFlicker: 0.02, pulse: 0.5 })).toBe(0.01);
  });
});
