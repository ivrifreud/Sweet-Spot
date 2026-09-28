/** Hero pin above the current map node — replaces the walking avatar. */
export const MAP_HERO_PIN_SIZE = 72;
export const MAP_HERO_HOP_MS = 450;

const HERO_REFERENCE_WIDTH = 390;

/** Hero pin scales with the map the same way the chip does. */
export function mapHeroPinSize(mapWidth = HERO_REFERENCE_WIDTH): number {
  const scaled = Math.round((mapWidth * MAP_HERO_PIN_SIZE) / HERO_REFERENCE_WIDTH);
  return Math.min(96, Math.max(60, scaled));
}
