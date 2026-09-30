/** Painted tables are 571×1024. Both worlds share this blocking. */
export const TABLE_ART_SIZE = { width: 571, height: 1024 };

/** Trimmed `chip-stack.png` is 640×660. */
const STACK_ASPECT = 660 / 640;
const CARD_ASPECT = 190 / 140;

const CARD_GAP = 8;
const RESERVED_BOARD_CARDS = 3;
const POT_WIDTH = 84;
const CLUSTER_GAP = 10;
const HERO_STACK_WIDTH = 44;
const OPPONENT_STACK_WIDTH = 34;

/** Roomier rhythm for modern phones. Compact keeps the same bands on a short screen. */
const RHYTHMS = [
  { gap: 8, positionHeight: 36, storyHeight: 80, cardWidth: 52 },
  { gap: 8, positionHeight: 36, storyHeight: 64, cardWidth: 46 },
] as const;

/** Opponent stacks end on the felt, just under the painted hands. */
const OPPONENT_BOTTOM = 0.392;

/** Family cards sit on this line. The pot itself sits in the middle of the green. */
const CLUSTER_CENTER_Y = 0.485;
const POT_CENTER_Y = 0.5;

/**
 * Garden hero holes, in art fractions. Centers and sizes match the black
 * cards in `bennys-garden.png`. The right card sits behind the fingers.
 */
const GARDEN_HOLE_SLOTS = [
  { cx: 262 / 571, cy: 852 / 1024, width: 146 / 571, height: 180 / 1024, rotation: -4 },
  { cx: 343 / 571, cy: 858 / 1024, width: 142 / 571, height: 164 / 1024, rotation: 8 },
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
  const holeSlots = GARDEN_HOLE_SLOTS.map((slot) => placeHole(art, slot));
  const heroCards = unionFrames(holeSlots);
  const { board, pot } = placeCluster(art, width, rhythm.cardWidth, communityCount);
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
  const heroStack = placeHeroStack(art, height, bottomInset);
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
  cardWidth: number,
  communityCount: number
) {
  const centerY = art.y + art.height * CLUSTER_CENTER_Y;
  const potCenterY = art.y + art.height * (communityCount > 0 ? CLUSTER_CENTER_Y : POT_CENTER_Y);
  let width = cardWidth;
  let cardHeight = width * CARD_ASPECT;
  const potWidth = POT_WIDTH;
  const potHeight = potWidth * STACK_ASPECT;
  const showBoard = communityCount > 0;
  let boardWidth = RESERVED_BOARD_CARDS * width + (RESERVED_BOARD_CARDS - 1) * CARD_GAP;
  const extras = showBoard ? CLUSTER_GAP + potWidth : 0;
  const maxGroup = screenWidth - 24;
  if (boardWidth + extras > maxGroup) {
    boardWidth = maxGroup - extras;
    width = (boardWidth - (RESERVED_BOARD_CARDS - 1) * CARD_GAP) / RESERVED_BOARD_CARDS;
    cardHeight = width * CARD_ASPECT;
  }
  const groupWidth = showBoard ? boardWidth + CLUSTER_GAP + potWidth : potWidth;
  const groupX = (screenWidth - groupWidth) / 2;
  const board = {
    x: groupX,
    y: centerY - cardHeight / 2,
    width: boardWidth,
    height: cardHeight,
    cardWidth: width,
    gap: CARD_GAP,
  };
  const pot = {
    x: showBoard ? board.x + board.width + CLUSTER_GAP : screenWidth / 2 - potWidth / 2,
    y: potCenterY - potHeight / 2,
    width: potWidth,
    height: potHeight,
    chipHeight: potHeight,
  };
  return { board, pot };
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

function placeHeroStack(art: SceneFrame, screenHeight: number, bottomInset: number): StackFrame {
  const width = HERO_STACK_WIDTH;
  const imageHeight = width * STACK_ASPECT;
  const feltBottom = art.y + art.height * 0.58;
  const maxBottom = screenHeight - bottomInset - 8;
  const bottom = Math.min(feltBottom, maxBottom);
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
