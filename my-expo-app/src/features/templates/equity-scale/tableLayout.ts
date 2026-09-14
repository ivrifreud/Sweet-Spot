/** Kenney card art is 140×190. */
const CARD_ASPECT = 190 / 140;

/** Native scale PNG box. Rendered size is fitted per screen in equityTableLayout. */
export const SCALE_ART = { width: 348, height: 268 };
const PLAYFIELD_TOP_RATIO = 0.25;
const CHIPS_CLEARANCE = 72;
const DIAL_CLUSTER = 192;
const VALUE_ROW_H = 52;
const SIDE_PAD = 28;
const BOARD_GAP = 5;
const HERO_OVERLAP = 0.33;
const BOARD_TO_HERO = 0.88;
const ACTION_CUE = 22;
const CARD_CAPTION = 16;
const TEXTURE = 18;
const INSTRUCTION = 26;
const GAP = 10;
const MIN_HERO = 40;
const MAX_HERO = 64;
const SCALE_MAX_H = 176;

export type EquityTableLayout = {
  scaleTop: number;
  scaleWidth: number;
  scaleHeight: number;
  cardsTop: number;
  valueTop: number;
  heroCardWidth: number;
  boardCardWidth: number;
  boardGap: number;
};

export function equityTableLayout({
  width,
  height,
  topInset,
  bottomInset,
  showingOuts,
  boardCount,
}: {
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
  showingOuts: boolean;
  boardCount: number;
}): EquityTableLayout {
  const n = Math.max(boardCount, 3);
  const available = Math.max(220, width - SIDE_PAD);
  const heroWidth = clamp(
    (available - (n - 1) * BOARD_GAP) / (2 - HERO_OVERLAP + n * BOARD_TO_HERO),
    MIN_HERO,
    MAX_HERO
  );
  const boardWidth = clamp(heroWidth * BOARD_TO_HERO, MIN_HERO - 6, MAX_HERO - 6);
  const cardRowH = Math.max(
    CARD_CAPTION + heroWidth * CARD_ASPECT,
    boardWidth * CARD_ASPECT + TEXTURE
  );
  const spotH = ACTION_CUE + cardRowH + INSTRUCTION;

  const dialTop = height - bottomInset - DIAL_CLUSTER;
  const cardsTop = dialTop - GAP - spotH;
  const valueH = showingOuts ? 0 : VALUE_ROW_H;
  const valueTop = showingOuts ? 0 : cardsTop - GAP - valueH;

  const minScaleTop = Math.max(height * PLAYFIELD_TOP_RATIO, topInset + CHIPS_CLEARANCE);
  const scaleBottomLimit = (showingOuts ? cardsTop : valueTop) - GAP;
  const scaleBudget = Math.max(0, scaleBottomLimit - minScaleTop);
  const scaleHeight = Math.min(SCALE_MAX_H, scaleBudget);
  const extra = Math.max(0, scaleBudget - scaleHeight);
  const scaleTop = minScaleTop + extra / 2;
  const scaleWidth = (SCALE_ART.width / SCALE_ART.height) * scaleHeight;

  return {
    scaleTop,
    scaleWidth,
    scaleHeight,
    cardsTop,
    valueTop,
    heroCardWidth: Math.round(heroWidth),
    boardCardWidth: Math.round(boardWidth),
    boardGap: BOARD_GAP,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
