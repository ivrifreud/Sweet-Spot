import { describe, expect, it } from 'vitest';

import {
  HERO_GROUND_CONTACT,
  MAP_HERO_HOP_MS,
  MAP_HERO_PIN_SIZE,
  heroPinOrigin,
  mapHeroPinSize,
  percentClearanceAboveHero,
} from './mapHeroPin';
import { shouldAutoWalkOnFocus } from '../track/tree';

describe('map hero pin', () => {
  it('keeps the pin readable next to 53px stage chips', () => {
    expect(MAP_HERO_PIN_SIZE).toBe(72);
    expect(mapHeroPinSize(390)).toBe(72);
    expect(mapHeroPinSize(320)).toBeGreaterThanOrEqual(60);
  });

  it('uses a short hop instead of a walk cycle', () => {
    expect(MAP_HERO_HOP_MS).toBe(450);
  });

  it('still advances the focus target after a stage clears', () => {
    expect(shouldAutoWalkOnFocus(1, 1, 12)).toBe(2);
  });

  it('keeps the feet on the node anchor when a progress label is showing', () => {
    const anchor = { x: 180, y: 420 };
    const bare = heroPinOrigin(anchor, MAP_HERO_PIN_SIZE);
    const withLabel = heroPinOrigin(anchor, MAP_HERO_PIN_SIZE);

    expect(withLabel).toEqual(bare);
    expect(withLabel.x + MAP_HERO_PIN_SIZE / 2).toBe(anchor.x);
    expect(withLabel.y + MAP_HERO_PIN_SIZE).toBe(anchor.y + HERO_GROUND_CONTACT);
    expect(percentClearanceAboveHero(MAP_HERO_PIN_SIZE, 67)).toBeGreaterThan(0);
  });
});
