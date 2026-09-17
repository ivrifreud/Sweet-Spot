import { describe, expect, it } from 'vitest';

import {
  EQUITY_PHONE_LAYOUT,
  equityTableLayout,
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
    expect(layout.scaleWidth / layout.scaleHeight).toBeCloseTo(1069 / 698, 2);
    expect(layout.scaleWidth).toBeLessThanOrEqual(IPHONE.width);
    expect(layout.scaleTop).toBeGreaterThan(layout.streetTop + EQUITY_PHONE_LAYOUT.titleH);
    expect(layout.scaleTop).toBeGreaterThan(layout.cardsTop);
    expect(layout.scaleTop + layout.scaleHeight).toBeLessThan(layout.dialTop);
    expect(layout.heroCardWidth).toBeGreaterThan(36);
  });

  it('puts pot plates at the top on stage 2 and the scale in the middle', () => {
    const layout = equityTableLayout({
      ...IPHONE,
      showingOuts: false,
      boardCount: 4,
    });
    const scaleCenter = layout.scaleTop + layout.scaleHeight / 2;

    expect(layout.valueTop).toBeGreaterThanOrEqual(layout.streetTop + EQUITY_PHONE_LAYOUT.titleH);
    expect(layout.valueTop).toBeLessThan(IPHONE.height * 0.22);
    expect(layout.scaleTop).toBeGreaterThan(layout.valueTop + EQUITY_PHONE_LAYOUT.valueRowH);
    expect(scaleCenter).toBeGreaterThan(IPHONE.height * 0.42);
    expect(scaleCenter).toBeLessThan(IPHONE.height * 0.58);
    expect(layout.scaleTop + layout.scaleHeight).toBeLessThan(layout.dialTop);
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
});
