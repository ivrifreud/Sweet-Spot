import { describe, expect, it } from 'vitest';

import { equityTableLayout } from '../../src/features/templates/equity-scale/tableLayout';

const IPHONE = { width: 390, height: 844, topInset: 47, bottomInset: 34 };
const SE = { width: 320, height: 667, topInset: 20, bottomInset: 0 };

describe('equityTableLayout', () => {
  it('keeps the scale below Benny and the cards above the dial on a tall phone', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: true,
      boardCount: 4,
    });

    expect(layout.scaleTop).toBeGreaterThanOrEqual(IPHONE.height * 0.18 - 0.5);
    expect(layout.scaleHeight).toBeLessThanOrEqual(176);
    expect(layout.scaleHeight).toBeGreaterThan(140);
    expect(layout.scaleTop + layout.scaleHeight + 8).toBeLessThanOrEqual(layout.cardsTop);
    expect(layout.cardsTop).toBeGreaterThan(layout.scaleTop + layout.scaleHeight);
    expect(layout.heroCardWidth).toBeGreaterThan(42);
    expect(layout.boardCardWidth).toBeGreaterThan(38);

    const dialTop = IPHONE.height - IPHONE.bottomInset - 192;
    expect(layout.cardsTop).toBeLessThan(dialTop);
  });

  it('fits a five-card board next to hole cards without overflowing the rail', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: true,
      boardCount: 5,
    });
    const heroSpan = layout.heroCardWidth * (2 - 0.33);
    const boardSpan = layout.boardCardWidth * 5 + layout.boardGap * 4;
    expect(heroSpan + boardSpan).toBeLessThanOrEqual(IPHONE.width - 24);
  });

  it('leaves room for pot-odds plates between the scale and the cards', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: false,
      boardCount: 4,
    });
    expect(layout.valueTop).toBeGreaterThan(layout.scaleTop + layout.scaleHeight);
    expect(layout.cardsTop).toBeGreaterThan(layout.valueTop + 48);

    const dialTop = IPHONE.height - IPHONE.bottomInset - 192;
    expect(dialTop - layout.cardsTop).toBeGreaterThan(150);
  });

  it('still separates the scale, cards, and dial on a short phone', () => {
    const layout = equityTableLayout({
      ...SE,
      showingOuts: true,
      boardCount: 5,
    });
    expect(layout.scaleTop + layout.scaleHeight).toBeLessThanOrEqual(layout.cardsTop);
    expect(layout.heroCardWidth).toBeGreaterThanOrEqual(40);
  });
});
