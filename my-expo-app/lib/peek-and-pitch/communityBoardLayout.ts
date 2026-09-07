/** Kenney card art is 140×190. */
export const COMMUNITY_CARD_ASPECT = 190 / 140;

const GAP = 8;
const HINT_GAP = 36;
const MAX_CARD_WIDTH = 80;

type LayoutInput = {
  cardCount: number;
  viewportWidth: number;
  maxWidth: number;
  /** Far felt (dealer / pot edge), in screen Y. */
  farY: number;
  /** Near felt (hero rail), in screen Y. */
  nearY: number;
};

export type CommunityBoardLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  rotateZ: number;
  rotateX: number;
  scale: number;
  hintTop: number;
};

/**
 * Phone-first community-card row: full faces, no 3D pitch (that clips on
 * device), hero-readable, mid-felt, with teaching hints parked underneath.
 */
export function layoutCommunityBoard({
  cardCount,
  viewportWidth,
  maxWidth,
  farY,
  nearY,
}: LayoutInput): CommunityBoardLayout {
  const n = Math.max(1, cardCount);
  const cardWidth = Math.min(MAX_CARD_WIDTH, (maxWidth - GAP * (n - 1)) / n);
  const cardHeight = cardWidth * COMMUNITY_CARD_ASPECT;
  const width = n * cardWidth + (n - 1) * GAP;
  const height = cardHeight;
  const left = viewportWidth / 2 - width / 2;
  const centerY = (farY + nearY) / 2;
  const top = centerY - height / 2;

  return {
    left,
    top,
    width,
    height,
    cardWidth,
    cardHeight,
    gap: GAP,
    rotateZ: 180,
    rotateX: 0,
    scale: 1,
    hintTop: top + height + HINT_GAP,
  };
}
