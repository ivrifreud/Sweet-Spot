import { describe, expect, it } from 'vitest';

import {
  approxQuadLength,
  cometDashOffset,
  cometTailLength,
  dialRotatePath,
  fingerPathForStep,
  overlayViewport,
  pointingGloveFrame,
  pointOnArc,
  pointOnQuad,
  rectCenter,
  rectsOverlap,
  spotlightForTarget,
  swipeArcForAction,
  tapOriginForAction,
  tapOriginForTarget,
  warmthTrailLayers,
} from './tutorialGeometry';
import { EQUITY_SCALE_TUTORIAL } from './equityScaleSteps';
import { PEEK_AND_PITCH_TUTORIAL } from './peekAndPitchSteps';

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

  it('places the check glove on the phone overlay, not the desktop window', () => {
    const phone = { width: 393, height: 852 };
    const desktop = { width: 1280, height: 800 };
    const box = overlayViewport(phone, desktop);
    const tip = tapOriginForAction('check', cards, stack, table, box)!;
    const glove = pointingGloveFrame(tip);
    const overlay = { x: 0, y: 0, width: phone.width, height: phone.height };

    expect(box).toEqual(phone);
    expect(tip.x).toBeCloseTo(phone.width / 2);
    expect(tip.y).toBeCloseTo(phone.height / 2);
    expect(rectsOverlap(glove, overlay)).toBe(true);
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
    expect(layers[0]!.length).toBeGreaterThan(layers[1]!.length);
    expect(layers[1]!.length).toBeGreaterThan(layers[2]!.length);
    expect(layers[0]!.opacity).toBeLessThan(layers[2]!.opacity);
  });
});

describe('fingerPathForStep', () => {
  it('keeps Peek and Pitch swipe and tap points finite and on the table', () => {
    for (const step of PEEK_AND_PITCH_TUTORIAL.steps) {
      const path = fingerPathForStep(step, cards, stack, table, viewport);
      for (const point of [path.from, path.control, path.to]) {
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
      }
    }
    const peek = fingerPathForStep(PEEK_AND_PITCH_TUTORIAL.steps[0]!, cards, stack, table, viewport);
    expect(peek.from).toEqual({ x: viewport.width * 0.5, y: viewport.height * 0.5 });
    expect(peek.to).toEqual(rectCenter(cards));
    const call = fingerPathForStep(PEEK_AND_PITCH_TUTORIAL.steps[3]!, cards, stack, table, viewport);
    expect(call.from).toEqual(rectCenter(stack));
    expect(call.to).toEqual(rectCenter(stack));
  });

  it('jumps Call or Fold from the right button to the left button', () => {
    const extras = { dial, lockIn, fold, call };
    const decide = EQUITY_SCALE_TUTORIAL.steps[3]!;
    const path = fingerPathForStep(decide, cards, stack, table, viewport, extras);
    expect(path.from.x).toBeGreaterThan(path.to.x);
    expect(path.from).toEqual(rectCenter(call));
    expect(path.to).toEqual(rectCenter(fold));
  });
});

const dial = { x: 121, y: 620, width: 148, height: 148 };
const lockIn = { x: 298, y: 684, width: 84, height: 84 };
const fold = { x: 8, y: 684, width: 84, height: 84 };
const call = { x: 298, y: 684, width: 84, height: 84 };

describe('dialRotatePath', () => {
  it('traces the right half-circle from the top of the dial to the bottom', () => {
    const path = dialRotatePath(dial);
    const center = rectCenter(dial);

    expect(path.center).toEqual(center);
    expect(path.radius).toBeCloseTo(148 * 0.42, 5);
    expect(path.from.x).toBeCloseTo(center.x, 5);
    expect(path.from.y).toBeLessThan(center.y);
    expect(path.to.x).toBeCloseTo(center.x, 5);
    expect(path.to.y).toBeGreaterThan(center.y);
    expect(pointOnArc(path, 0)).toEqual(path.from);
    expect(pointOnArc(path, 1)).toEqual(path.to);
    const mid = pointOnArc(path, 0.5);
    expect(mid.x).toBeGreaterThan(center.x);
    expect(mid.y).toBeCloseTo(center.y, 5);
    expect(path.d.startsWith('M ')).toBe(true);
    expect(path.d).toContain(' A ');
  });
});

describe('scale tap and spotlight targets', () => {
  it('places lock-in, fold, and call taps on their buttons', () => {
    const extras = { dial, lockIn, fold, call };
    expect(tapOriginForTarget('lockIn', cards, stack, viewport, extras)).toEqual(rectCenter(lockIn));
    expect(tapOriginForTarget('foldButton', cards, stack, viewport, extras)).toEqual(rectCenter(fold));
    expect(tapOriginForTarget('callButton', cards, stack, viewport, extras)).toEqual(rectCenter(call));
  });

  it('pools light on the dial and on the decision buttons', () => {
    const extras = { dial, lockIn, fold, call };
    const dialSpot = spotlightForTarget('dial', cards, stack, viewport, extras);
    expect(dialSpot.origin).toEqual(rectCenter(dial));
    const foldSpot = spotlightForTarget('foldButton', cards, stack, viewport, extras);
    expect(foldSpot.origin).toEqual(rectCenter(fold));
  });
});
