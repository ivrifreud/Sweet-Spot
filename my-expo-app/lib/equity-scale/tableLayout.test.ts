import { describe, expect, it } from 'vitest';

import {
  EQUITY_PHONE_LAYOUT,
  SCALE_ART,
  equityTableLayout,
  equityTutorialHits,
} from '../../src/features/templates/equity-scale/tableLayout';

const IPHONE = { width: 390, height: 844, topInset: 47, bottomInset: 34 };
const SE = { width: 320, height: 667, topInset: 20, bottomInset: 0 };

describe('equityTableLayout phone playfield', () => {
  it('plants a bigger stage-1 scale on the felt, below the street title', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: true,
      boardCount: 3,
    });

    expect(layout.scaleHeight).toBeGreaterThan(176);
    expect(layout.scaleWidth / layout.scaleHeight).toBeCloseTo(
      SCALE_ART.width / SCALE_ART.height,
      2
    );
    expect(layout.scaleWidth).toBeLessThanOrEqual(
      IPHONE.width - EQUITY_PHONE_LAYOUT.scaleSideInset * 2 + 0.01
    );
    expect(layout.scaleTop).toBeGreaterThan(layout.streetTop + EQUITY_PHONE_LAYOUT.titleH);
    expect(layout.scaleTop).toBeGreaterThan(layout.cardsTop);
    expect(layout.scaleTop + layout.scaleHeight).toBeLessThan(layout.dialTop);
    expect(layout.heroCardWidth).toBeGreaterThan(36);
    expect(layout.cardsTop).toBeLessThan(IPHONE.topInset + EQUITY_PHONE_LAYOUT.titleH + 16);
  });

  it('puts hole cards under the title and pot plates below them on stage 2', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: false,
      boardCount: 4,
    });
    const scaleCenter = layout.scaleTop + layout.scaleHeight / 2;

    expect(layout.cardsTop).toBeGreaterThan(layout.streetTop);
    expect(layout.valueTop).toBeGreaterThan(layout.cardsTop);
    expect(layout.scaleTop).toBeGreaterThan(layout.valueTop + EQUITY_PHONE_LAYOUT.valueRowH);
    expect(scaleCenter).toBeGreaterThan(IPHONE.height * 0.42);
    expect(scaleCenter).toBeLessThan(IPHONE.height * 0.58);
    expect(layout.scaleTop + layout.scaleHeight).toBeLessThan(layout.dialTop);
  });

  it('centers the scale on the phone so tilted pans keep side air', () => {
    for (const showingOuts of [true, false]) {
      const layout = equityTableLayout({
        ...IPHONE,
        showingOuts,
        boardCount: 3,
      });
      const side = (IPHONE.width - layout.scaleWidth) / 2;
      expect(side).toBeGreaterThanOrEqual(EQUITY_PHONE_LAYOUT.scaleSideInset - 0.5);
    }
  });

  it('keeps side buttons smaller than the center dial with a gap between them', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: false,
      boardCount: 4,
    });
    const occupied = layout.buttonSize * 2 + layout.dialSize + EQUITY_PHONE_LAYOUT.controlGap * 2;

    expect(layout.buttonSize).toBeLessThan(layout.dialSize);
    expect(layout.buttonSize).toBeGreaterThanOrEqual(44);
    expect(occupied).toBeLessThanOrEqual(IPHONE.width - layout.sideInset * 2);
  });

  it('still fits cards and the dial on a short phone', () => {
    const layout = equityTableLayout({
      ...SE,
      showingOuts: true,
      boardCount: 5,
    });
    expect(layout.scaleTop + layout.scaleHeight).toBeLessThanOrEqual(layout.dialTop);
    expect(layout.heroCardWidth).toBeGreaterThanOrEqual(36);
    expect(layout.buttonSize * 2 + layout.dialSize).toBeLessThan(SE.width);
  });

  it('keeps a five-card board inside a phone-width row', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: true,
      boardCount: 5,
    });
    const matPadX = 7;
    const rowGap = 8;
    const overlap = Math.round(layout.heroCardWidth * 0.33);
    const heroBlock = layout.heroCardWidth * 2 - overlap + matPadX * 2;
    const boardBlock = layout.boardCardWidth * 5 + layout.boardGap * 4 + matPadX * 2;
    expect(heroBlock + rowGap + boardBlock).toBeLessThanOrEqual(IPHONE.width - 24);
  });

  it('places tutorial hits on the dial and the side buttons', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: true,
      boardCount: 3,
    });
    const hits = equityTutorialHits(layout, IPHONE);
    expect(hits.dialHit.x + hits.dialHit.width / 2).toBeCloseTo(IPHONE.width / 2);
    expect(hits.dialHit.y).toBe(layout.dialTop);
    expect(hits.foldHit.x).toBe(layout.sideInset);
    expect(hits.lockInHit.x + hits.lockInHit.width).toBeCloseTo(
      IPHONE.width - layout.sideInset
    );
    expect(hits.callHit).toEqual(hits.lockInHit);
  });
});
