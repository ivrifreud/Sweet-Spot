import { describe, expect, it } from 'vitest';

import {
  DIAL_MAX_DEG,
  DIAL_MIN_DEG,
  SCALE_MAX_TILT_DEG,
  dialAngleToValue,
} from '../../src/features/templates/equity-scale/dialMath';
import {
  dialAngleToScaleTilt,
  dialValueToTilt,
  panOffset,
  rotateAboutPoint,
} from '../../src/features/templates/equity-scale/components/scaleArmLayout';
import {
  SCALE_RIG_LAYERS,
  SCALE_RIG_PIVOTS,
  SCALE_RIG_RINGS,
} from '../../src/features/templates/equity-scale/components/scaleRigLayout.generated';

type Step =
  | { translateX: number }
  | { translateY: number }
  | { rotate: string };

/** Apply an RN transform list (default origin = box centre) to a point in box-local px. */
function applyTransform(steps: Step[], local: { x: number; y: number }, w: number, h: number) {
  let x = local.x - w / 2;
  let y = local.y - h / 2;
  const ops = [...steps].reverse();
  for (const op of ops) {
    if ('translateX' in op) x += op.translateX;
    else if ('translateY' in op) y += op.translateY;
    else {
      const t = (parseFloat(op.rotate) * Math.PI) / 180;
      [x, y] = [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
    }
  }
  return { x: x + w / 2, y: y + h / 2 };
}

describe('dialValueToTilt', () => {
  it('maps the dial center to a level beam and the ends to opposite max leans', () => {
    expect(dialValueToTilt(35, 0, 70)).toBe(0);
    expect(dialValueToTilt(0, 0, 70)).toBe(-SCALE_MAX_TILT_DEG);
    expect(dialValueToTilt(70, 0, 70)).toBe(SCALE_MAX_TILT_DEG);
  });
});

describe('dialAngleToScaleTilt', () => {
  it('is level at rest and leans fully at the dial stops', () => {
    expect(dialAngleToScaleTilt(0)).toBe(0);
    expect(dialAngleToScaleTilt(DIAL_MAX_DEG)).toBe(SCALE_MAX_TILT_DEG);
    expect(dialAngleToScaleTilt(DIAL_MIN_DEG)).toBe(-SCALE_MAX_TILT_DEG);
    expect(dialAngleToScaleTilt(400)).toBe(SCALE_MAX_TILT_DEG);
  });

  it('lands on the same tilt as the snapped dial value at every detent', () => {
    for (let outs = 0; outs <= 20; outs++) {
      const angle = DIAL_MIN_DEG + (outs / 20) * (DIAL_MAX_DEG - DIAL_MIN_DEG);
      expect(dialAngleToValue(angle, 0, 20)).toBe(outs);
      expect(dialAngleToScaleTilt(angle)).toBeCloseTo(dialValueToTilt(outs, 0, 20), 6);
    }
  });
});

describe('rotateAboutPoint', () => {
  it('keeps the shoulder pivot fixed while the hose rotates', () => {
    const box = SCALE_RIG_LAYERS.hoseLeft;
    const pivot = SCALE_RIG_PIVOTS.left;
    const local = { x: pivot.x - box.x, y: pivot.y - box.y };
    for (const deg of [-SCALE_MAX_TILT_DEG, -9, 0, 13, SCALE_MAX_TILT_DEG]) {
      const moved = applyTransform(rotateAboutPoint(box, pivot, deg, 1) as Step[], local, box.w, box.h);
      expect(moved.x).toBeCloseTo(local.x, 6);
      expect(moved.y).toBeCloseTo(local.y, 6);
    }
  });

  it('carries the glove ring to the same place panOffset moves the pan', () => {
    const box = SCALE_RIG_LAYERS.hoseRight;
    const pivot = SCALE_RIG_PIVOTS.right;
    const ring = SCALE_RIG_RINGS.right;
    const deg = 21;
    const local = { x: ring.x - box.x, y: ring.y - box.y };
    const moved = applyTransform(rotateAboutPoint(box, pivot, deg, 1) as Step[], local, box.w, box.h);
    const { dx, dy } = panOffset(ring, pivot, deg, 1);
    expect(moved.x - local.x).toBeCloseTo(dx, 6);
    expect(moved.y - local.y).toBeCloseTo(dy, 6);
  });
});

describe('panOffset', () => {
  it('does not move the pans when the beam is level', () => {
    expect(panOffset(SCALE_RIG_RINGS.left, SCALE_RIG_PIVOTS.left, 0, 1)).toEqual({ dx: 0, dy: 0 });
  });

  it('drops the left pan and lifts the right pan for a counter-clockwise tilt', () => {
    const left = panOffset(SCALE_RIG_RINGS.left, SCALE_RIG_PIVOTS.left, -SCALE_MAX_TILT_DEG, 1);
    const right = panOffset(SCALE_RIG_RINGS.right, SCALE_RIG_PIVOTS.right, -SCALE_MAX_TILT_DEG, 1);
    expect(left.dy).toBeGreaterThan(0);
    expect(right.dy).toBeLessThan(0);
  });

  it('scales with the on-screen size of the art', () => {
    const full = panOffset(SCALE_RIG_RINGS.left, SCALE_RIG_PIVOTS.left, 17, 1);
    const third = panOffset(SCALE_RIG_RINGS.left, SCALE_RIG_PIVOTS.left, 17, 1 / 3);
    expect(third.dx).toBeCloseTo(full.dx / 3, 6);
    expect(third.dy).toBeCloseTo(full.dy / 3, 6);
  });
});
