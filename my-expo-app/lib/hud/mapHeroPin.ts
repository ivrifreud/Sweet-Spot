/** Hero pin above the current map node — replaces the walking avatar. */
export const MAP_HERO_PIN_SIZE = 72;
export const MAP_HERO_HOP_MS = 450;
/** Shoes overlap the node anchor so the feet meet the plate. */
export const HERO_GROUND_CONTACT = 6;

/** Sprite top-left. The feet stay on the anchor; a progress label must not lift them. */
export function heroPinOrigin(
  anchor: { x: number; y: number },
  size: number
): { x: number; y: number } {
  return {
    x: anchor.x - size / 2,
    y: anchor.y - size + HERO_GROUND_CONTACT,
  };
}

/** Slide the percent up above Benny's head. The ring and his feet stay put. */
export function percentClearanceAboveHero(heroSize: number, ringSize: number): number {
  const heroTop = heroSize - HERO_GROUND_CONTACT;
  const ringTop = ringSize / 2;
  return Math.max(0, Math.ceil(heroTop - ringTop + 4));
}

const HERO_REFERENCE_WIDTH = 390;

/** Hero pin scales with the map the same way the chip does. */
export function mapHeroPinSize(mapWidth = HERO_REFERENCE_WIDTH): number {
  const scaled = Math.round((mapWidth * MAP_HERO_PIN_SIZE) / HERO_REFERENCE_WIDTH);
  return Math.min(96, Math.max(60, scaled));
}
