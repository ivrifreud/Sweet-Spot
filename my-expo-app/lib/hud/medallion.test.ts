import { describe, expect, it } from 'vitest';

import { HUD_CROPS, medallionImageBox, medallionInnerSize } from './medallion';

describe('medallionInnerSize', () => {
  it('subtracts ink hairline and gold rim on both sides', () => {
    expect(medallionInnerSize(40)).toBe(34);
    expect(medallionInnerSize(2)).toBe(0);
  });
});

describe('medallionImageBox', () => {
  it('fills the circle exactly with no zoom', () => {
    expect(medallionImageBox(40)).toEqual({ width: 34, height: 34, left: 0, top: 0 });
  });

  it('centers a zoomed image on the focus point', () => {
    const box = medallionImageBox(40, { zoom: 1.5 });
    expect(box.width).toBeCloseTo(51);
    expect(box.left).toBeCloseTo(-8.5);
    expect(box.top).toBeCloseTo(-8.5);
  });

  it('keeps tall art proportional and honors focusY', () => {
    const box = medallionImageBox(40, { zoom: 1, aspect: 1.2, focusY: 0.4 });
    expect(box.height).toBeCloseTo(40.8);
    expect(box.top).toBeCloseTo(17 - 40.8 * 0.4);
  });

  it('every HUD crop zooms far enough to hide the baked square frame', () => {
    for (const crop of Object.values(HUD_CROPS)) {
      const box = medallionImageBox(40, crop);
      const inner = medallionInnerSize(40);
      // Circle must stay inside the image on every side.
      expect(box.left).toBeLessThanOrEqual(0);
      expect(box.top).toBeLessThanOrEqual(0);
      expect(box.left + box.width).toBeGreaterThanOrEqual(inner);
      expect(box.top + box.height).toBeGreaterThanOrEqual(inner);
      expect(crop.zoom).toBeGreaterThanOrEqual(1.2);
    }
  });
});
