import { describe, expect, it } from 'vitest';

import { getBackdropLayout, mapBackdropPoint } from './config';

const IMAGE = { width: 1024, height: 1536 };
const IPHONE = { width: 390, height: 844 };
const IPAD = { width: 768, height: 1024 };

describe('getBackdropLayout', () => {
  it('width-top on a phone shows the full art width and does not crop the sides', () => {
    const layout = getBackdropLayout(IMAGE, IPHONE, 'width-top');
    expect(layout.left).toBe(0);
    expect(layout.top).toBe(0);
    expect(layout.width).toBe(IPHONE.width);
    expect(layout.height).toBeCloseTo((IMAGE.height / IMAGE.width) * IPHONE.width);
    expect(layout.width).toBeLessThanOrEqual(IPHONE.width);
  });

  it('cover on a phone crops the left and right of a 2:3 backdrop', () => {
    const layout = getBackdropLayout(IMAGE, IPHONE, 'cover');
    expect(layout.width).toBeGreaterThan(IPHONE.width);
    expect(layout.left).toBeLessThan(0);
  });

  it('cover on a 9:16 mobile crop fills the phone height', () => {
    const portrait = { width: 1080, height: 1920 };
    const layout = getBackdropLayout(portrait, IPHONE, 'cover', { x: 0.5, y: 0.82 });
    expect(layout.height).toBeGreaterThanOrEqual(IPHONE.height);
    expect(layout.top).toBeLessThanOrEqual(0);
  });
});

describe('mapBackdropPoint', () => {
  it('maps the left edge of the art onto the left edge of a phone in width-top', () => {
    const point = mapBackdropPoint({ x: 0, y: 0.2 }, IMAGE, IPHONE, 'width-top');
    expect(point.x).toBe(0);
    expect(point.y).toBeGreaterThan(0);
  });

  it('maps the left edge off-screen on a phone in cover', () => {
    const point = mapBackdropPoint({ x: 0, y: 0.2 }, IMAGE, IPHONE, 'cover');
    expect(point.x).toBeLessThan(0);
  });
});
