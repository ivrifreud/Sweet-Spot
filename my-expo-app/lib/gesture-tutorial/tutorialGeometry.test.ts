import { describe, expect, it } from 'vitest';

import {
  approxQuadLength,
  buildTearDropOutline,
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
  CONTACT_GLOW_RADIUS,
  sampleTrailCenterline,
  smoothClosedOutline,
  outlineToSvgPathD,
  spotlightForTarget,
  swipeArcForAction,
  tapOriginForAction,
  tapOriginForTarget,
  tutorialCopyTop,
  warmthTrailProfile,
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

  it('builds a warmth trail profile that tapers and cools behind the fingertip', () => {
    const profile = warmthTrailProfile(200);

    expect(profile.tipHalfWidth).toBeGreaterThan(6);
    expect(profile.tipHalfWidth).toBeLessThanOrEqual(CONTACT_GLOW_RADIUS * 0.55);
    expect(profile.tailLength).toBeLessThan(cometTailLength(200));
    expect(profile.taperPower).toBeGreaterThan(1);
    expect(profile.heatStops.map((stop) => stop.offset)).toEqual([0, 0.28, 0.62, 1]);
    expect(profile.heatStops[0]!.opacity).toBeGreaterThan(profile.heatStops[3]!.opacity);
    expect(profile.heatStops[3]!.opacity).toBe(0);
  });

  it('builds a finger-sized dial trail that matches the contact glow', () => {
    const profile = warmthTrailProfile(Math.PI * 120, 'finger');

    expect(profile.tipHalfWidth).toBeLessThanOrEqual(CONTACT_GLOW_RADIUS * 0.35);
    expect(profile.tipHalfWidth * 2).toBeLessThanOrEqual(CONTACT_GLOW_RADIUS);
    expect(profile.tailLength).toBeLessThanOrEqual(42);
    expect(profile.tailLength).toBeLessThan(warmthTrailProfile(Math.PI * 120).tailLength);
  });

  it('parks tutorial copy in the upper center clear of a low hand path', () => {
    const top = tutorialCopyTop(
      viewport,
      { from: { x: 200, y: 720 }, control: { x: 200, y: 780 }, to: { x: 200, y: 840 } },
      48,
      96
    );
    expect(top).toBeGreaterThanOrEqual(48);
    expect(top).toBeLessThan(viewport.height * 0.35);
    expect(top + 96 + 36).toBeLessThanOrEqual(720);
  });

  it('shifts tutorial copy above a mid-screen dial hand', () => {
    const handMinY = 380;
    const top = tutorialCopyTop(
      viewport,
      { from: { x: 280, y: handMinY }, control: { x: 300, y: 460 }, to: { x: 280, y: 540 } },
      48,
      96
    );
    expect(top + 96 + 36).toBeLessThanOrEqual(handMinY);
  });

  it('samples a centerline behind the fingertip along a quad path', () => {
    const from = { x: 0, y: 0 };
    const control = { x: 50, y: 0 };
    const to = { x: 100, y: 0 };
    const pathLength = approxQuadLength(from, control, to);
    const profile = warmthTrailProfile(pathLength);
    const points = sampleTrailCenterline({
      kind: 'quad',
      from,
      control,
      to,
      along: 1,
      pathLength,
      tailLength: profile.tailLength,
      tipInset: 0,
      samples: 8,
    });

    expect(points.length).toBe(9);
    expect(points[0]).toEqual(pointOnQuad(from, control, to, 1));
    expect(points[points.length - 1]!.x).toBeLessThan(points[0]!.x);
    for (const point of points) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
    }
  });

  it('pins the trail tip to the fingertip so the tear-drop comes out of the finger', () => {
    const from = { x: 0, y: 0 };
    const control = { x: 50, y: 0 };
    const to = { x: 100, y: 0 };
    const pathLength = approxQuadLength(from, control, to);
    const profile = warmthTrailProfile(pathLength);
    const finger = pointOnQuad(from, control, to, 1);
    const points = sampleTrailCenterline({
      kind: 'quad',
      from,
      control,
      to,
      along: 1,
      pathLength,
      tailLength: profile.tailLength,
      samples: 8,
    });
    expect(points[0]).toEqual(finger);
  });

  it('lets the tear-drop nose sit on the fingertip glow instead of hovering beside it', () => {
    const from = { x: 0, y: 0 };
    const control = { x: 50, y: 0 };
    const to = { x: 100, y: 0 };
    const pathLength = approxQuadLength(from, control, to);
    const profile = warmthTrailProfile(pathLength);
    const centerline = sampleTrailCenterline({
      kind: 'quad',
      from,
      control,
      to,
      along: 1,
      pathLength,
      tailLength: profile.tailLength,
      samples: 12,
    });
    const tip = centerline[0]!;
    const outline = buildTearDropOutline(centerline, profile);
    const farthestForward = Math.max(...outline.map((point) => point.x));
    expect(farthestForward).toBeGreaterThanOrEqual(tip.x);
    expect(farthestForward).toBeLessThanOrEqual(tip.x + CONTACT_GLOW_RADIUS);
    const nearest = outline.reduce((best, point) => {
      const gap = Math.hypot(point.x - tip.x, point.y - tip.y);
      return gap < best ? gap : best;
    }, Infinity);
    expect(nearest).toBeLessThan(8);
  });

  it('samples a dial centerline behind the fingertip along the arc', () => {
    const dial = { x: 100, y: 100, width: 120, height: 120 };
    const path = dialRotatePath(dial);
    const pathLength = Math.PI * path.radius;
    const profile = warmthTrailProfile(pathLength);
    const points = sampleTrailCenterline({
      kind: 'dial',
      center: path.center,
      radius: path.radius,
      along: 1,
      pathLength,
      tailLength: profile.tailLength,
      tipInset: 0,
      samples: 8,
    });

    expect(points.length).toBe(9);
    expect(points[0]).toEqual(pointOnArc(path, 1));
    expect(points[points.length - 1]!.y).toBeLessThan(points[0]!.y);
  });

  it('flips the dial tail to the other side for anti-clockwise travel', () => {
    const dial = { x: 100, y: 100, width: 120, height: 120 };
    const path = dialRotatePath(dial);
    const pathLength = Math.PI * path.radius;
    const profile = warmthTrailProfile(pathLength);
    const clockwise = sampleTrailCenterline({
      kind: 'dial',
      center: path.center,
      radius: path.radius,
      along: 0.5,
      direction: 1,
      pathLength,
      tailLength: profile.tailLength,
      samples: 8,
    });
    const antiClockwise = sampleTrailCenterline({
      kind: 'dial',
      center: path.center,
      radius: path.radius,
      along: 0.5,
      direction: -1,
      pathLength,
      tailLength: profile.tailLength,
      samples: 8,
    });

    expect(clockwise[clockwise.length - 1]!.y).toBeLessThan(clockwise[0]!.y);
    expect(antiClockwise[antiClockwise.length - 1]!.y).toBeGreaterThan(antiClockwise[0]!.y);
  });

  it('builds a closed tear-drop outline that is widest at the tip and pointed at the tail', () => {
    const from = { x: 0, y: 0 };
    const control = { x: 50, y: 0 };
    const to = { x: 100, y: 0 };
    const pathLength = approxQuadLength(from, control, to);
    const profile = warmthTrailProfile(pathLength);
    const centerline = sampleTrailCenterline({
      kind: 'quad',
      from,
      control,
      to,
      along: 1,
      pathLength,
      tailLength: profile.tailLength,
      tipInset: 0,
      samples: 12,
    });
    const outline = buildTearDropOutline(centerline, profile);

    expect(outline.length).toBeGreaterThan(centerline.length);
    expect(outline[0]).toEqual(outline[outline.length - 1]);

    const tip = centerline[0]!;
    const mid = centerline[Math.floor(centerline.length / 2)]!;
    const tail = centerline[centerline.length - 1]!;
    const tipWidth = maxLateralSpan(outline, tip);
    const midWidth = maxLateralSpan(outline, mid);
    const tailWidth = maxLateralSpan(outline, tail);

    expect(tipWidth).toBeGreaterThan(midWidth);
    expect(midWidth).toBeGreaterThan(tailWidth);
    expect(tailWidth).toBeLessThan(4);
  });

  it('Chaikin-smooths a closed outline into more points without sharp corners', () => {
    const box = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
    ];
    const smoothed = smoothClosedOutline(box, 3);
    expect(smoothed.length).toBeGreaterThan(box.length);
    expect(smoothed[0]).toEqual(smoothed[smoothed.length - 1]);
    for (const point of smoothed) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
    }
  });

  it('builds an SVG path string from a closed outline', () => {
    const outline = [
      { x: 0, y: 0 },
      { x: 10, y: 2 },
      { x: 20, y: 0 },
      { x: 10, y: -2 },
      { x: 0, y: 0 },
    ];
    const d = outlineToSvgPathD(outline);
    expect(d.startsWith('M ')).toBe(true);
    expect(d.includes('C ')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
  });
});

function maxLateralSpan(outline: { x: number; y: number }[], along: { x: number; y: number }) {
  let max = 0;
  for (const point of outline) {
    const dy = Math.abs(point.y - along.y);
    const dx = Math.abs(point.x - along.x);
    if (dx < 8) {
      max = Math.max(max, dy * 2);
    }
  }
  return max;
}

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
