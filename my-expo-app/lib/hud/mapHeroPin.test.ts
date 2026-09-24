import { describe, expect, it } from 'vitest';

import { MAP_HERO_HOP_MS, MAP_HERO_PIN_SIZE } from './mapHeroPin';
import { shouldAutoWalkOnFocus } from '../track/tree';

describe('map hero pin', () => {
  it('keeps the pin readable next to 53px stage chips', () => {
    expect(MAP_HERO_PIN_SIZE).toBe(72);
  });

  it('uses a short hop instead of a walk cycle', () => {
    expect(MAP_HERO_HOP_MS).toBe(450);
  });

  it('still advances the focus target after a stage clears', () => {
    expect(shouldAutoWalkOnFocus(1, 1, 12)).toBe(2);
  });
});
