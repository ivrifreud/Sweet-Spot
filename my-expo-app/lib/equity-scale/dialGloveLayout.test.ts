import { describe, expect, it } from 'vitest';

import { DIAL_MAX_DEG, DIAL_MIN_DEG } from '../../src/features/templates/equity-scale/dialMath';
import {
  DIAL_GLOVE_CONTACT,
  DIAL_GLOVE_SLEEVE,
  GRIP_END_DEG,
  GRIP_START_DEG,
  dialGlovePose,
  gripAngleForRotation,
  rimPoint,
  rotateAround,
} from '../../src/features/templates/equity-scale/components/dialGloveLayout';

describe('gripAngleForRotation', () => {
  it('keeps the glove on the lower rim across the full outs sweep', () => {
    expect(gripAngleForRotation(DIAL_MIN_DEG)).toBeCloseTo(GRIP_START_DEG);
    expect(gripAngleForRotation(DIAL_MAX_DEG)).toBeCloseTo(GRIP_END_DEG);
    const mid = gripAngleForRotation(0);
    expect(mid).toBeGreaterThan(GRIP_END_DEG);
    expect(mid).toBeLessThan(GRIP_START_DEG);
  });
});

describe('dialGlovePose', () => {
  const anchor = { x: 240, y: 800 };
  const contact = { x: 180, y: 520 };

  it('plants the sleeve on the screen anchor before rotation', () => {
    const pose = dialGlovePose({ anchor, contact });
    expect(pose.left + DIAL_GLOVE_SLEEVE.x * pose.width).toBeCloseTo(anchor.x);
    expect(pose.top + DIAL_GLOVE_SLEEVE.y * pose.height).toBeCloseTo(anchor.y);
  });

  it('puts the fingertips on the rim after rotating around the sleeve', () => {
    const pose = dialGlovePose({ anchor, contact });
    const sleeve = {
      x: pose.left + DIAL_GLOVE_SLEEVE.x * pose.width,
      y: pose.top + DIAL_GLOVE_SLEEVE.y * pose.height,
    };
    const pinch = {
      x: pose.left + DIAL_GLOVE_CONTACT.x * pose.width,
      y: pose.top + DIAL_GLOVE_CONTACT.y * pose.height,
    };
    const placed = rotateAround(pinch, sleeve, pose.rotateDeg);
    expect(placed.x).toBeCloseTo(contact.x, 1);
    expect(placed.y).toBeCloseTo(contact.y, 1);
  });

  it('treats scale 1 as the stretch pose', () => {
    const base = dialGlovePose({ anchor, contact });
    const scaled = dialGlovePose({ anchor, contact, scale: 1 });
    expect(scaled.width).toBeCloseTo(base.width);
    expect(scaled.height).toBeCloseTo(base.height);
    expect(scaled.left).toBeCloseTo(base.left);
    expect(scaled.top).toBeCloseTo(base.top);
  });

  it('doubles width around the sleeve when scale is 2', () => {
    const base = dialGlovePose({ anchor, contact, scale: 1 });
    const scaled = dialGlovePose({ anchor, contact, scale: 2 });
    expect(scaled.width).toBeCloseTo(base.width * 2);
    expect(scaled.height).toBeCloseTo(base.height * 2);
    expect(scaled.left + DIAL_GLOVE_SLEEVE.x * scaled.width).toBeCloseTo(anchor.x);
    expect(scaled.top + DIAL_GLOVE_SLEEVE.y * scaled.height).toBeCloseTo(anchor.y);
  });

  it('places a 6 o’clock grip on the bottom of the dial', () => {
    const point = rimPoint(100, 100, 40, 90);
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(140);
  });
});
