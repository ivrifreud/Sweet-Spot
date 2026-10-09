import type { HotSeatSkin } from './types';

/** Painted tables are 571×1024. Both worlds share this blocking. */
export const TABLE_ART_SIZE = { width: 571, height: 1024 };

/** Trimmed stack paintings are close to square. Frames use the tallest pile. */
const STACK_ASPECT = 773 / 719;
/** Cropped `family-pot.png` is 1024×683. The shared pot uses this scatter. */
const FAMILY_POT_ASPECT = 683 / 1024;
const CARD_ASPECT = 190 / 140;

const CARD_GAP = 8;
const CLUSTER_GAP = 10;
const MAX_CARD_WIDTH = 80;
const MIN_CARD_WIDTH = 48;
const POT_PREFERRED_WIDTH = 100;
const POT_MIN_WIDTH = 72;
const HERO_STACK_WIDTH = 48;
const OPPONENT_STACK_WIDTH = 34;

/** One rounded label above each opponent. The ends are full circles. */
const TAG_LABEL = { width: 112, height: 68 };

/** Leave control. The left seat's words have to sit clear of this square. */
export const LEAVE_BUTTON = {
  left: 12,
  size: 48,
  top(topInset: number) {
    return Math.max(2, topInset - 34);
  },
};
const TAG_WIDTH = 118;
const TAG_GAP = 8;
const ACTION_SIZE_ROW = 36;
const ACTION_ROW = 48;
const ACTION_GAP = 8;
export const ACTION_BAND_HEIGHT = ACTION_SIZE_ROW + ACTION_GAP + ACTION_ROW;

/** Opponent stacks end on the felt, just under the painted hands. */
const OPPONENT_BOTTOM = 0.392;

/** Family cards sit on this line. The pot itself sits in the middle of the green. */
const CLUSTER_CENTER_Y = 0.485;
const POT_CENTER_Y = 0.5;

/**
 * Hero cards on the 571×1024 paintings, in source-art pixels.
 * Each slot is the live face. The face covers the painted black card shape.
 * The left card is underneath. The right card overlaps it and stays under the thumb.
 * The right card's side lies on the black finger line.
 * One slot fits every rank and suit; only the face art changes.
 */
const FACE_INSET_ART = 6;
const CORNER_RADIUS_ART = 14;
const HOLE_SLOTS = [
  { cx: 254, cy: 858, width: 168, height: 228, rotation: -13, radius: CORNER_RADIUS_ART },
  { cx: 328, cy: 858, width: 148, height: 230, rotation: 7, radius: 6 },
] as const;

/**
 * Side stacks sit on the open felt just inward of each painted hand,
 * toward the middle of the table, so they do not cover those cards.
 * The far stack stays in front of the player across the table.
 */
const OPPONENT_ANCHORS = {
  left: 0.36,
  far: 0.5,
  right: 0.66,
} as const;

/** Crown tops of the three bowlers, plus a near-rim rest for the swapping hero tag. */
const HAT_CROWNS = {
  left: { cx: 100, cy: 186 },
  far: { cx: 286, cy: 178 },
  right: { cx: 469, cy: 186 },
  hero: { cx: 286, cy: 640 },
} as const;

export type HatSlot = 'hero' | 'left' | 'far' | 'right';
const HAT_SLOTS: HatSlot[] = ['hero', 'left', 'far', 'right'];

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
  /** Uniform black frame, in screen pixels, on every edge of this card. */
  faceInset: number;
  /** Outer corner radius in screen pixels. The face radius is one inset smaller. */
  cornerRadius: number;
};

export type HotSeatSceneLayout = {
  art: SceneFrame;
  board: SceneFrame & { cardWidth: number; gap: number };
  pot: PotFrame;
  arrival: SceneFrame;
  actions: SceneFrame;
  hats: Record<HatSlot, SceneFrame>;
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
  skin?: HotSeatSkin;
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

export function lerpFrame(from: SceneFrame, to: SceneFrame, progress: number): SceneFrame {
  const amount = Math.min(1, Math.max(0, progress));
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
    width: from.width + (to.width - from.width) * amount,
    height: from.height + (to.height - from.height) * amount,
  };
}

export function tagHatForSeat(
  hats: Record<HatSlot, SceneFrame>,
  seatIndex: number,
  activeIndex: number,
  progress: number
): SceneFrame {
  const fromSlot = ((seatIndex - activeIndex) % 4 + 4) % 4;
  const toSlot = (fromSlot + 3) % 4;
  return lerpFrame(hats[HAT_SLOTS[fromSlot]!], hats[HAT_SLOTS[toSlot]!], progress);
}

export function layoutHotSeatScene({
  width,
  height,
  topInset,
  bottomInset,
  communityCount = 0,
}: LayoutInput): HotSeatSceneLayout {
  const art = coverTableArt(width, height);
  const minGap = height >= 800 ? 8 : 4;
  const holeSlots = HOLE_SLOTS.map((slot) => placeHole(art, slot));
  const heroCards = unionFrames(holeSlots);
  const { board, pot } = placeCluster(
    art,
    width,
    communityCount,
    heroCards.y,
    minGap
  );
  const clusterBottom = Math.max(board.y + board.height, pot.y + pot.height);
  const side = 16;
  const actions = {
    x: side,
    y: heroCards.y - ACTION_BAND_HEIGHT - minGap,
    width: width - side * 2,
    height: ACTION_BAND_HEIGHT,
  };
  const stackBottom = art.y + art.height * OPPONENT_BOTTOM;
  const opponents = {
    left: placeOpponent(art, OPPONENT_ANCHORS.left, stackBottom),
    far: placeOpponent(art, OPPONENT_ANCHORS.far, stackBottom),
    right: placeOpponent(art, OPPONENT_ANCHORS.right, stackBottom),
  };
  const heroStack = placeHeroStack(art, actions.y, [board, pot, actions, heroCards, opponents.left, opponents.far, opponents.right]);
  const arrivalWidth = Math.min(342, width - 32);
  const arrivalRoom = heroCards.y - (clusterBottom + minGap);
  const arrivalHeight = Math.min(148, Math.max(44, arrivalRoom));
  const arrival = {
    x: (width - arrivalWidth) / 2,
    y: clusterBottom + minGap,
    width: arrivalWidth,
    height: arrivalHeight,
  };
  const hats = placeSeatTags(art, width, topInset);

  clampBelow(opponents.left, topInset);
  clampBelow(opponents.far, topInset);
  clampBelow(opponents.right, topInset);

  return { art, board, pot, arrival, actions, hats, heroCards, holeSlots, heroStack, opponents };
}

function placeCluster(
  art: SceneFrame,
  screenWidth: number,
  communityCount: number,
  heroTop: number,
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
  const actionBlock = ACTION_BAND_HEIGHT + minGap;
  const maxHalf = Math.max(0, heroTop - actionBlock - centerY);
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
  slot: { cx: number; cy: number; width: number; height: number; rotation: number; radius: number }
): HoleSlotFrame {
  const scale = art.width / TABLE_ART_SIZE.width;
  const width = slot.width * scale;
  const height = slot.height * scale;
  return {
    x: art.x + slot.cx * scale - width / 2,
    y: art.y + slot.cy * scale - height / 2,
    width,
    height,
    rotation: slot.rotation,
    faceInset: FACE_INSET_ART * scale,
    cornerRadius: slot.radius * scale,
  };
}

function unionFrames(frames: SceneFrame[]): SceneFrame {
  const left = Math.min(...frames.map((frame) => frame.x));
  const top = Math.min(...frames.map((frame) => frame.y));
  const right = Math.max(...frames.map((frame) => frame.x + frame.width));
  const bottom = Math.max(...frames.map((frame) => frame.y + frame.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function placeHeroStack(art: SceneFrame, actionTop: number, obstacles: SceneFrame[]): StackFrame {
  const width = HERO_STACK_WIDTH;
  const imageHeight = width * STACK_ASPECT;
  const blocked = obstacles.filter((frame) => frame.width > 8 && frame.height > 8);
  let chosen = { x: 12, y: actionTop - imageHeight - 8 };
  for (let y = actionTop - imageHeight - 8; y > art.y + 48; y -= 14) {
    const candidate = { x: 12, y, width, height: imageHeight };
    if (blocked.every((frame) => !framesOverlap(candidate, frame))) {
      chosen = { x: candidate.x, y: candidate.y };
      break;
    }
  }
  return { ...chosen, width, height: imageHeight, imageHeight };
}

function framesOverlap(a: SceneFrame, b: SceneFrame) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
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

function placeSeatTags(art: SceneFrame, screenWidth: number, topInset: number): Record<HatSlot, SceneFrame> {
  const scale = art.width / TABLE_ART_SIZE.width;
  const center = (crown: { cx: number; cy: number }) => ({
    x: art.x + crown.cx * scale,
    y: art.y + crown.cy * scale,
  });
  const left = center(HAT_CROWNS.left);
  const farCrown = center(HAT_CROWNS.far);
  const right = center(HAT_CROWNS.right);
  const hero = center(HAT_CROWNS.hero);
  const edge = 8;
  const splitLeft = (left.x + farCrown.x) / 2;
  const splitRight = (farCrown.x + right.x) / 2;
  const plate = (crownX: number, crownY: number, start: number, end: number): SceneFrame => {
    const room = Math.max(72, end - start);
    const width = Math.min(TAG_LABEL.width, TAG_WIDTH, room);
    const height = TAG_LABEL.height;
    const x = Math.min(Math.max(start, crownX - width / 2), end - width);
    const y = Math.max(topInset + 2, crownY - height - 10);
    return { x, y, width, height };
  };
  const far = plate(farCrown.x, farCrown.y, splitLeft + TAG_GAP / 2, splitRight - TAG_GAP / 2);
  return {
    left: clearLeaveButton(
      plate(left.x, left.y, edge, splitLeft - TAG_GAP / 2),
      topInset,
      far.x
    ),
    far,
    right: plate(right.x, right.y, splitRight + TAG_GAP / 2, screenWidth - edge),
    hero: plate(hero.x, hero.y, screenWidth / 2 - 70, screenWidth / 2 + 70),
  };
}

/** Drop the left words below the leave button so they are not covered. */
function clearLeaveButton(plate: SceneFrame, topInset: number, farX: number): SceneFrame {
  const leave = {
    x: LEAVE_BUTTON.left,
    y: LEAVE_BUTTON.top(topInset),
    width: LEAVE_BUTTON.size,
    height: LEAVE_BUTTON.size,
  };
  const y = Math.max(plate.y, leave.y + leave.height + 8);
  let next = { ...plate, y };
  const limit = farX - TAG_GAP;
  for (let step = 0; step < 8; step += 1) {
    if (!framesOverlap(next, leave)) return next;
    const shifted = next.x + 8;
    if (shifted + next.width > limit) break;
    next = { ...next, x: shifted };
  }
  return next;
}

function clampBelow(frame: StackFrame, topInset: number) {
  const minY = topInset + 8;
  if (frame.y < minY) frame.y = minY;
}
