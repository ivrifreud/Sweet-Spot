export type ChipLayer = {
  index: number;
  translateY: number;
  zIndex: number;
};

/** Absolute-positioned layers for a pile, from its base to its top chip. */
export function getChipLayers(chipCount: number, overlapOffset: number): ChipLayer[] {
  const count = Math.max(0, Math.trunc(chipCount));
  const offset = Math.max(0, overlapOffset);

  return Array.from({ length: count }, (_, index) => ({
    index,
    translateY: index === 0 ? 0 : -index * offset,
    zIndex: index,
  }));
}

/** Height required to contain the chip image and every upward overlap offset. */
export function getChipPileHeight(
  chipImageHeight: number,
  chipCount: number,
  overlapOffset: number
) {
  const count = Math.max(0, Math.trunc(chipCount));
  if (count === 0) return 0;

  return chipImageHeight + (count - 1) * Math.max(0, overlapOffset);
}

/** Chips left in one column after spending; the stack always keeps a floor chip. */
export function remainingPileChips(total: number, spent: number, floor = 1) {
  return Math.max(floor, Math.max(0, Math.trunc(total)) - Math.max(0, Math.trunc(spent)));
}

/**
 * Woodcut-style cluster: tall center pile, shorter stacks tucked behind
 * on each side, one shorter pile overlapping in front.
 */
export type HeroPileSpec = {
  key: 'backLeft' | 'backRight' | 'center' | 'front';
  chips: number;
  xRatio: number;
  bottom: number;
  zIndex: number;
  rotate: number;
  play?: boolean;
};

export const HERO_CHIP_PILES: readonly HeroPileSpec[] = [
  { key: 'backLeft', chips: 5, xRatio: 0, bottom: 16, zIndex: 1, rotate: -3.4 },
  { key: 'backRight', chips: 5, xRatio: 1, bottom: 18, zIndex: 1, rotate: 4.2 },
  { key: 'center', chips: 8, xRatio: 0.52, bottom: 8, zIndex: 2, rotate: 0.4, play: true },
  { key: 'front', chips: 4, xRatio: 0.26, bottom: 0, zIndex: 4, rotate: -1.8 },
];

export const HERO_CLUSTER_WIDTH_RATIO = 3.2;
export const HERO_PLAY_CHIPS = 8;

export function layoutHeroChipCluster(
  chipSize: number,
  chipImageHeight: number,
  overlapOffset: number,
  playChips: number
) {
  const width = chipSize * HERO_CLUSTER_WIDTH_RATIO;
  const piles = HERO_CHIP_PILES.map((spec) => {
    const chips = spec.play ? playChips : spec.chips;
    return {
      ...spec,
      chips,
      x: spec.xRatio * (width - chipSize),
      height: getChipPileHeight(chipImageHeight, chips, overlapOffset),
    };
  });
  const height = piles.reduce((max, pile) => Math.max(max, pile.height + pile.bottom), 0);
  const playPile = piles.find((pile) => pile.play) ?? piles[2];
  return { width, height, piles, playPile };
}
