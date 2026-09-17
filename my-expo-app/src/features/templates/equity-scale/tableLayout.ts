/** Kenney card art is 140×190. */
const CARD_ASPECT = 190 / 140;

/** Native scale PNG box (1069×698). Rendered size is fitted per screen. */
export const SCALE_ART = { width: 1069, height: 698 };

/**
 * Phone placement knobs for the Equity Scale.
 * Edit these if a layer sits too high, too low, or too close to another control.
 *
 * EQUITY_PHONE_LAYOUT.stage1ScaleMaxH — stage 1 scale size (felt, not the rim)
 * EQUITY_PHONE_LAYOUT.stage2ScaleMaxH — stage 2 scale size
 * EQUITY_PHONE_LAYOUT.stage2ScaleCenterRatio — 0.5 = vertical middle of the phone
 * EQUITY_PHONE_LAYOUT.titleH — ON THE FLOP / ON THE TURN band
 * EQUITY_PHONE_LAYOUT.valueRowH — pot / odds / price / locked-outs block
 * EQUITY_PHONE_LAYOUT.dialSize — center wheel
 * EQUITY_PHONE_LAYOUT.buttonSize — Fold / Call / Lock In
 * EQUITY_PHONE_LAYOUT.controlGap — air between a side button and the dial
 * EQUITY_PHONE_LAYOUT.sideInset — Fold/Call distance from the screen edge
 * EQUITY_PHONE_LAYOUT.tableLift — how far the controls sit above the home indicator
 */
export const EQUITY_PHONE_LAYOUT = {
  titleH: 56,
  valueRowH: 100,
  gap: 8,
  dialSize: 148,
  buttonSize: 84,
  controlGap: 12,
  sideInset: 8,
  tableLift: 40,
  stage1ScaleMaxH: 300,
  stage2ScaleMaxH: 320,
  stage2ScaleCenterRatio: 0.5,
  minHero: 36,
  maxHero: 56,
} as const;

const BOARD_GAP = 5;
const HERO_OVERLAP = 0.33;
const BOARD_TO_HERO = 0.88;
const CARD_CAPTION = 14;

export type EquityTableLayout = {
  streetTop: number;
  scaleTop: number;
  scaleWidth: number;
  scaleHeight: number;
  cardsTop: number;
  valueTop: number;
  dialTop: number;
  dialSize: number;
  buttonSize: number;
  sideInset: number;
  actionBottom: number;
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
  const available = Math.max(200, width - EQUITY_PHONE_LAYOUT.sideInset * 2);
  const heroWidth = clamp(
    (available - (n - 1) * BOARD_GAP) / (2 - HERO_OVERLAP + n * BOARD_TO_HERO),
    EQUITY_PHONE_LAYOUT.minHero,
    EQUITY_PHONE_LAYOUT.maxHero
  );
  const boardWidth = clamp(
    heroWidth * BOARD_TO_HERO,
    EQUITY_PHONE_LAYOUT.minHero - 4,
    EQUITY_PHONE_LAYOUT.maxHero - 4
  );
  const cardRowH = Math.max(CARD_CAPTION + heroWidth * CARD_ASPECT, boardWidth * CARD_ASPECT);
  const streetTop = topInset + 4;
  const valueTop = showingOuts ? 0 : streetTop + EQUITY_PHONE_LAYOUT.titleH + EQUITY_PHONE_LAYOUT.gap;
  const cardsTop = showingOuts
    ? streetTop + EQUITY_PHONE_LAYOUT.titleH + EQUITY_PHONE_LAYOUT.gap
    : valueTop + EQUITY_PHONE_LAYOUT.valueRowH + EQUITY_PHONE_LAYOUT.gap;
  const cardsBottom = cardsTop + cardRowH;

  const dialSize = EQUITY_PHONE_LAYOUT.dialSize;
  const actionBottom = bottomInset + EQUITY_PHONE_LAYOUT.tableLift;
  const dialTop = height - actionBottom - dialSize;
  const buttonBudget =
    (width - EQUITY_PHONE_LAYOUT.sideInset * 2 - dialSize - EQUITY_PHONE_LAYOUT.controlGap * 2) / 2;
  const buttonSize = clamp(Math.floor(buttonBudget), 44, EQUITY_PHONE_LAYOUT.buttonSize);

  const maxScaleH = showingOuts
    ? EQUITY_PHONE_LAYOUT.stage1ScaleMaxH
    : EQUITY_PHONE_LAYOUT.stage2ScaleMaxH;
  const scaleCeiling = dialTop - EQUITY_PHONE_LAYOUT.gap;
  const scaleFloor = cardsBottom + EQUITY_PHONE_LAYOUT.gap;
  const scaleBudget = Math.max(0, scaleCeiling - scaleFloor);
  const artAspect = SCALE_ART.width / SCALE_ART.height;
  const heightFromWidth = width / artAspect;
  const scaleHeight = Math.min(maxScaleH, scaleBudget, heightFromWidth);
  const scaleWidth = artAspect * scaleHeight;

  let scaleTop: number;
  if (showingOuts) {
    scaleTop = scaleCeiling - scaleHeight;
  } else {
    const center = height * EQUITY_PHONE_LAYOUT.stage2ScaleCenterRatio;
    scaleTop = clamp(center - scaleHeight / 2, scaleFloor, scaleCeiling - scaleHeight);
  }

  return {
    streetTop,
    scaleTop,
    scaleWidth,
    scaleHeight,
    cardsTop,
    valueTop,
    dialTop,
    dialSize,
    buttonSize,
    sideInset: EQUITY_PHONE_LAYOUT.sideInset,
    actionBottom,
    heroCardWidth: Math.round(heroWidth),
    boardCardWidth: Math.round(boardWidth),
    boardGap: BOARD_GAP,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
