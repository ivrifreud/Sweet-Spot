import { describe, expect, it } from 'vitest';

import {
  approxQuadLength,
  cometDashOffset,
  cometTailLength,
  pointOnQuad,
  rectCenter,
  spotlightForTarget,
  swipeArcForAction,
  tapOriginForAction,
  warmthTrailLayers,
} from './tutorialGeometry';

const cards = { x: 200, y: 700, width: 160, height: 120 };
const stack = { x: 40, y: 710, width: 120, height: 100 };
const table = { x: 220, y: 360 };
const viewport = { width: 400, height: 900 };

describe('tutorialGeometry', () => {
  it('pools light on the hole cards for peek and fold', () => {
    const spot = spotlightForTarget('cards', cards, stack, viewport);
    expect(spot.origin).toEqual(rectCenter(cards));
    expect(spot.radius).toBeGreaterThan(40);
  });

  it('pools light on the chip stack for call and raise', () => {
    const spot = spotlightForTarget('stack', cards, stack, viewport);
    expect(spot.origin).toEqual(rectCenter(stack));
  });

  it('pools light in the middle of the screen for check', () => {
    const spot = spotlightForTarget('felt', cards, stack, viewport);
    expect(spot.origin).toEqual({ x: 200, y: 450 });
    expect(spot.origin.y).toBeGreaterThan(viewport.height * 0.4);
    expect(spot.origin.y).toBeLessThan(viewport.height * 0.6);
  });

  it('peeks from the screen middle down next to the hole cards', () => {
    const arc = swipeArcForAction('peek', cards, stack, table, viewport);
    expect(arc).not.toBeNull();
    expect(arc!.from.x).toBeCloseTo(viewport.width * 0.5, 0);
    expect(arc!.from.y).toBeCloseTo(viewport.height * 0.5, 0);
    expect(arc!.to.x).toBeCloseTo(rectCenter(cards).x, 0);
    expect(arc!.to.y).toBeCloseTo(rectCenter(cards).y, 0);
    expect(arc!.to.y).toBeGreaterThan(arc!.from.y);
  });

  it('folds from the hole cards up toward the screen middle', () => {
    const arc = swipeArcForAction('fold', cards, stack, table, viewport);
    expect(arc).not.toBeNull();
    expect(arc!.from.x).toBeCloseTo(rectCenter(cards).x, 0);
    expect(arc!.from.y).toBeCloseTo(rectCenter(cards).y, 0);
    expect(arc!.to.x).toBeCloseTo(viewport.width * 0.5, 0);
    expect(arc!.to.y).toBeCloseTo(viewport.height * 0.5, 0);
    expect(arc!.to.y).toBeLessThan(arc!.from.y);
  });

  it('swipes raise from the chip stock into the middle of the table', () => {
    const arc = swipeArcForAction('raise', cards, stack, table, viewport);
    expect(arc).not.toBeNull();
    expect(arc!.from.x).toBeCloseTo(rectCenter(stack).x);
    expect(arc!.from.y).toBeCloseTo(rectCenter(stack).y);
    expect(arc!.to.x).toBeCloseTo(table.x);
    expect(arc!.to.y).toBeCloseTo(table.y);
  });

  it('places call on the stack and check in the screen middle', () => {
    expect(tapOriginForAction('call', cards, stack, table, viewport)).toEqual(rectCenter(stack));
    expect(tapOriginForAction('check', cards, stack, table, viewport)).toEqual({
      x: 200,
      y: 450,
    });
  });

  it('keeps only a tiny bow on peek and fold', () => {
    for (const action of ['peek', 'fold'] as const) {
      const arc = swipeArcForAction(action, cards, stack, table, viewport)!;
      const chord = Math.hypot(arc.to.x - arc.from.x, arc.to.y - arc.from.y);
      const length = approxQuadLength(arc.from, arc.control, arc.to);
      const midX = (arc.from.x + arc.to.x) / 2;
      expect(length).toBeGreaterThan(chord);
      expect(length).toBeLessThan(chord * 1.06);
      expect(Math.abs(arc.control.x - midX)).toBeLessThan(36);
    }
  });

  it('keeps a light swipe bow longer than the chord', () => {
    const arc = swipeArcForAction('fold', cards, stack, table, viewport)!;
    const chord = Math.hypot(arc.to.x - arc.from.x, arc.to.y - arc.from.y);
    expect(approxQuadLength(arc.from, arc.control, arc.to)).toBeGreaterThan(chord);
    expect(pointOnQuad(arc.from, arc.control, arc.to, 0)).toEqual(arc.from);
    expect(pointOnQuad(arc.from, arc.control, arc.to, 1)).toEqual(arc.to);
  });

  it('keeps the comet dash behind the live fingertip', () => {
    expect(cometTailLength(200)).toBe(80);
    expect(cometDashOffset(0, 200, 80)).toBe(80);
    expect(cometDashOffset(0.5, 200, 80)).toBe(-20);
    expect(cometDashOffset(1, 200, 80)).toBe(-120);
  });

  it('builds a rounded warmth trail that tapers and cools behind the fingertip', () => {
    const layers = warmthTrailLayers(200);

    expect(layers.map((layer) => layer.role)).toEqual(['vapor', 'warmth', 'ember']);
    expect(layers.map((layer) => layer.width)).toEqual([30, 17, 7]);
    expect(layers[0]!.length).toBeGreaterThan(layers[1]!.length);
    expect(layers[1]!.length).toBeGreaterThan(layers[2]!.length);
    expect(layers[0]!.opacity).toBeLessThan(layers[2]!.opacity);
  });
});
