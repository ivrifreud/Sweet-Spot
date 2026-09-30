/** Painted tables are 571×1024. Both worlds share this blocking. */
export const TABLE_ART_SIZE = { width: 571, height: 1024 };

/** Trimmed `chip-stack.png` is 640×660. Player stacks keep this pile. */
const STACK_ASPECT = 660 / 640;
/** Cropped `family-pot.png` is 1024×683. The shared pot uses this scatter. */
const FAMILY_POT_ASPECT = 683 / 1024;
const CARD_ASPECT = 190 / 140;

const CARD_GAP = 8;
const CLUSTER_GAP = 10;
const MAX_CARD_WIDTH = 80;
const MIN_CARD_WIDTH = 48;
const POT_PREFERRED_WIDTH = 100;
const POT_MIN_WIDTH = 72;
const HERO_STACK_WIDTH = 44;
const OPPONENT_STACK_WIDTH = 34;

/** Roomier rhythm for modern phones. Compact keeps the same bands on a short screen. */
const RHYTHMS = [
  { gap: 8, positionHeight: 36, storyHeight: 80 },
  { gap: 8, positionHeight: 36, storyHeight: 64 },
] as const;

/** Opponent stacks end on the felt, just under the painted hands. */
const OPPONENT_BOTTOM = 0.392;

/** Family cards sit on this line. The pot itself sits in the middle of the green. */
const CLUSTER_CENTER_Y = 0.485;
const POT_CENTER_Y = 0.5;

/**
 * Garden hero holes on the 571×1024 painting.
 * Each face fills its black shape and leaves a 2px ink border.
 * Index 0, the left card, is underneath: center (245, 862), 113×193, −12° anti-clockwise.
 * Index 1, the right card, is on top and wider: center (339, 851), 125×188, +11° clockwise.
 * The outlined thumb is painted after both faces.
 */
const GARDEN_HOLE_SLOTS = [
  { cx: 245 / 571, cy: 862 / 1024, width: 113 / 571, height: 193 / 1024, rotation: -12 },
  { cx: 339 / 571, cy: 851 / 1024, width: 125 / 571, height: 188 / 1024, rotation: 11 },
] as const;

/** Stacks sit on the felt in front of each painted body. */
const OPPONENT_ANCHORS = {
  left: 0.28,
  far: 0.5,
  right: 0.72,
} as const;

export type SceneFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StackFrame = SceneFrame & {
  imageHeight: number;
};

export type PotFrame = SceneFrame & {
  chipHeight: number;
};

export type HoleSlotFrame = SceneFrame & {
  rotation: number;
};

export type HotSeatSceneLayout = {
  art: SceneFrame;
  board: SceneFrame & { cardWidth: number; gap: number };
  pot: PotFrame;
  position: SceneFrame;
  story: SceneFrame;
  heroCards: SceneFrame;
  holeSlots: HoleSlotFrame[];
  heroStack: StackFrame;
  opponents: { left: StackFrame; far: StackFrame; right: StackFrame };
};

type LayoutInput = {
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
  /** Zero keeps the pot in the middle. A flop parks it beside the family cards. */
  communityCount?: number;
};

export function coverTableArt(width: number, height: number): SceneFrame {
  const scale = Math.max(width / TABLE_ART_SIZE.width, height / TABLE_ART_SIZE.height);
  const frameWidth = TABLE_ART_SIZE.width * scale;
  const frameHeight = TABLE_ART_SIZE.height * scale;
  return {
    x: (width - frameWidth) / 2,
    y: (height - frameHeight) / 2,
    width: frameWidth,
    height: frameHeight,
  };
}

export function opponentSeatIndexes(activeIndex: number) {
  return {
    left: (activeIndex + 1) % 4,
    far: (activeIndex + 2) % 4,
    right: (activeIndex + 3) % 4,
  };
}

export function layoutHotSeatScene({
  width,
  height,
  topInset,
  bottomInset,
  communityCount = 0,
}: LayoutInput): HotSeatSceneLayout {
  const art = coverTableArt(width, height);
  const rhythm = height >= 800 ? RHYTHMS[0] : RHYTHMS[1];
  const minGap = height >= 800 ? 8 : 4;
  const holeSlots = GARDEN_HOLE_SLOTS.map((slot) => placeHole(art, slot));
  const heroCards = unionFrames(holeSlots);
  const { board, pot } = placeCluster(
    art,
    width,
    communityCount,
    heroCards.y,
    rhythm,
    minGap
  );
  const readoutX = 12 + HERO_STACK_WIDTH + 12;
  const readoutWidth = Math.min(width - readoutX - 16, 300);
  const clusterBottom = Math.max(board.y + board.height, pot.y + pot.height);
  const position = {
    x: readoutX,
    y: clusterBottom + rhythm.gap,
    width: readoutWidth,
    height: rhythm.positionHeight,
  };
  const story = {
    x: readoutX,
    y: position.y + position.height + rhythm.gap,
    width: readoutWidth,
    height: rhythm.storyHeight,
  };
  const heroStack = placeHeroStack(art, height, bottomInset, clusterBottom + minGap, heroCards.y);
  const stackBottom = art.y + art.height * OPPONENT_BOTTOM;
  const opponents = {
    left: placeOpponent(art, OPPONENT_ANCHORS.left, stackBottom),
    far: placeOpponent(art, OPPONENT_ANCHORS.far, stackBottom),
    right: placeOpponent(art, OPPONENT_ANCHORS.right, stackBottom),
  };

  clampBelow(opponents.left, topInset);
  clampBelow(opponents.far, topInset);
  clampBelow(opponents.right, topInset);

  return { art, board, pot, position, story, heroCards, holeSlots, heroStack, opponents };
}

function placeCluster(
  art: SceneFrame,
  screenWidth: number,
  communityCount: number,
  heroTop: number,
  rhythm: (typeof RHYTHMS)[number],
  minGap: number
) {
  const centerY = art.y + art.height * CLUSTER_CENTER_Y;
  const potCenterY = art.y + art.height * (communityCount > 0 ? CLUSTER_CENTER_Y : POT_CENTER_Y);

  if (communityCount <= 0) {
    const potWidth = POT_PREFERRED_WIDTH;
    const potHeight = potWidth * FAMILY_POT_ASPECT;
    return {
      board: {
        x: screenWidth / 2,
        y: potCenterY,
        width: 0,
        height: 0,
        cardWidth: 0,
        gap: CARD_GAP,
      },
      pot: {
        x: screenWidth / 2 - potWidth / 2,
        y: potCenterY - potHeight / 2,
        width: potWidth,
        height: potHeight,
        chipHeight: potHeight,
      },
    };
  }

  let { cardWidth, potWidth } = fitFamilyRow(screenWidth, communityCount);
  const plaqueBlock =
    rhythm.gap + rhythm.positionHeight + rhythm.gap + rhythm.storyHeight + minGap;
  const maxHalf = Math.max(0, heroTop - plaqueBlock - centerY);
  cardWidth = Math.min(cardWidth, (maxHalf * 2) / CARD_ASPECT);
  potWidth = Math.min(potWidth, (maxHalf * 2) / FAMILY_POT_ASPECT);

  const cardHeight = cardWidth * CARD_ASPECT;
  const potHeight = potWidth * FAMILY_POT_ASPECT;
  const boardWidth = communityCount * cardWidth + (communityCount - 1) * CARD_GAP;
  const groupWidth = boardWidth + CLUSTER_GAP + potWidth;
  const groupX = (screenWidth - groupWidth) / 2;
  return {
    board: {
      x: groupX,
      y: centerY - cardHeight / 2,
      width: boardWidth,
      height: cardHeight,
      cardWidth,
      gap: CARD_GAP,
    },
    pot: {
      x: groupX + boardWidth + CLUSTER_GAP,
      y: centerY - potHeight / 2,
      width: potWidth,
      height: potHeight,
      chipHeight: potHeight,
    },
  };
}

function fitFamilyRow(screenWidth: number, count: number) {
  const maxGroup = screenWidth - 24;
  const gaps = (count - 1) * CARD_GAP;
  const row = (cardWidth: number) => count * cardWidth + gaps;
  let cardWidth = MAX_CARD_WIDTH;
  let potWidth = POT_PREFERRED_WIDTH;

  if (row(cardWidth) + CLUSTER_GAP + potWidth > maxGroup) {
    cardWidth = (maxGroup - CLUSTER_GAP - potWidth - gaps) / count;
  }
  if (cardWidth < MIN_CARD_WIDTH) {
    cardWidth = MIN_CARD_WIDTH;
    potWidth = maxGroup - CLUSTER_GAP - row(cardWidth);
    if (potWidth < POT_MIN_WIDTH) {
      potWidth = POT_MIN_WIDTH;
      cardWidth = (maxGroup - CLUSTER_GAP - potWidth - gaps) / count;
    }
  }
  return { cardWidth, potWidth };
}

function placeHole(
  art: SceneFrame,
  slot: { cx: number; cy: number; width: number; height: number; rotation: number }
): HoleSlotFrame {
  const width = slot.width * art.width;
  const height = slot.height * art.height;
  return {
    x: art.x + slot.cx * art.width - width / 2,
    y: art.y + slot.cy * art.height - height / 2,
    width,
    height,
    rotation: slot.rotation,
  };
}

function unionFrames(frames: SceneFrame[]): SceneFrame {
  const left = Math.min(...frames.map((frame) => frame.x));
  const top = Math.min(...frames.map((frame) => frame.y));
  const right = Math.max(...frames.map((frame) => frame.x + frame.width));
  const bottom = Math.max(...frames.map((frame) => frame.y + frame.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function placeHeroStack(
  art: SceneFrame,
  screenHeight: number,
  bottomInset: number,
  minTop: number,
  heroTop: number
): StackFrame {
  const width = HERO_STACK_WIDTH;
  const imageHeight = width * STACK_ASPECT;
  const feltBottom = art.y + art.height * 0.58;
  const maxBottom = Math.min(screenHeight - bottomInset - 8, heroTop);
  let bottom = Math.min(feltBottom, maxBottom);
  if (bottom - imageHeight < minTop) bottom = Math.min(maxBottom, minTop + imageHeight);
  return {
    x: 12,
    y: bottom - imageHeight,
    width,
    height: imageHeight,
    imageHeight,
  };
}

function placeOpponent(art: SceneFrame, anchorX: number, pileBottom: number): StackFrame {
  const imageHeight = OPPONENT_STACK_WIDTH * STACK_ASPECT;
  const centerX = art.x + anchorX * art.width;
  return {
    x: centerX - OPPONENT_STACK_WIDTH / 2,
    y: pileBottom - imageHeight,
    width: OPPONENT_STACK_WIDTH,
    height: imageHeight,
    imageHeight,
  };
}

function clampBelow(frame: StackFrame, topInset: number) {
  const minY = topInset + 8;
  if (frame.y < minY) frame.y = minY;
}
