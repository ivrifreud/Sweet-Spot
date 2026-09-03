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
