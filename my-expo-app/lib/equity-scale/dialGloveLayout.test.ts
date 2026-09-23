import { describe, expect, it } from 'vitest';

import {
  DIAL_MAX_DEG,
  DIAL_MIN_DEG,
} from '../../src/features/templates/equity-scale/dialMath';
import {
  DIAL_GLOVE_CONTACT,
  DIAL_HAND_TILT_MAX_DEG,
  DIAL_PIVOT_ORIGIN,
  dialGloveLayoutBox,
  dialHandPose,
  dialHandTilt,
  rotateAround,
} from '../../src/features/templates/equity-scale/components/dialGloveLayout';

describe('dial pivot', () => {
  it('pins rotation to the geometric center so a hub point does not orbit', () => {
    expect(DIAL_PIVOT_ORIGIN).toEqual({ x: 0.5, y: 0.5 });
    const hub = { x: 84, y: 84 };
    const spun = rotateAround(hub, hub, 90);
    expect(spun.x).toBeCloseTo(84);
    expect(spun.y).toBeCloseTo(84);
  });

  it('keeps a rim point at a constant radius while spinning in place', () => {
    const origin = { x: 84, y: 84 };
    const rim = { x: 84 + 60, y: 84 };
    const spun = rotateAround(rim, origin, 40);
    const before = Math.hypot(rim.x - origin.x, rim.y - origin.y);
    const after = Math.hypot(spun.x - origin.x, spun.y - origin.y);
    expect(after).toBeCloseTo(before);
    expect(spun.x).not.toBeCloseTo(rim.x);
  });
});

describe('dialHandPose', () => {
  it('keeps a fixed box so the glove never stretches with the wheel', () => {
    const rest = dialHandPose(0, 148);
    const min = dialHandPose(DIAL_MIN_DEG, 148);
    const max = dialHandPose(DIAL_MAX_DEG, 148);
    expect(min.width).toBe(rest.width);
    expect(max.width).toBe(rest.width);
    expect(min.height).toBe(rest.height);
    expect(max.height).toBe(rest.height);
  });

  it('centers the Hanan pinch gap on the dial so the disc sits in the open mouth', () => {
    const dialSize = 148;
    const pose = dialHandPose(0, dialSize);
    const gapX = pose.left + DIAL_GLOVE_CONTACT.x * pose.width;
    const gapY = pose.top + DIAL_GLOVE_CONTACT.y * pose.height;
    expect(gapX).toBeCloseTo(dialSize / 2, 5);
    expect(gapY).toBeCloseTo(dialSize / 2, 5);
    expect(pose.left + pose.width).toBeGreaterThan(dialSize);
    expect(pose.top + pose.height).toBeGreaterThan(dialSize * 0.9);
  });

  it('rocks the same pinch a little: up on the left, down on the right', () => {
    const rest = dialHandPose(0, 148);
    const min = dialHandPose(DIAL_MIN_DEG, 148);
    const max = dialHandPose(DIAL_MAX_DEG, 148);
    expect(dialHandTilt(0)).toBe(0);
    expect(dialHandTilt(DIAL_MIN_DEG)).toBe(-DIAL_HAND_TILT_MAX_DEG);
    expect(dialHandTilt(DIAL_MAX_DEG)).toBe(DIAL_HAND_TILT_MAX_DEG);
    expect(rest.rotateDeg).toBe(0);
    expect(min.rotateDeg).toBe(-DIAL_HAND_TILT_MAX_DEG);
    expect(max.rotateDeg).toBe(DIAL_HAND_TILT_MAX_DEG);
    expect(min.left).toBe(rest.left);
    expect(max.top).toBe(rest.top);
  });
});

describe('dialGloveLayoutBox', () => {
  it('reserves a parent box that contains the full two-layer glove, including rotation', () => {
    const dialSize = 148;
    const box = dialGloveLayoutBox(dialSize);
    expect(box.width).toBeGreaterThan(dialSize);
    expect(box.height).toBeGreaterThan(dialSize);
    expect(box.dialLeft + dialSize).toBeLessThanOrEqual(box.width + 0.01);
    expect(box.dialTop + dialSize).toBeLessThanOrEqual(box.height + 0.01);
    expect(box.overflowBelow).toBeGreaterThan(0);

    for (const rotation of [DIAL_MIN_DEG, 0, DIAL_MAX_DEG]) {
      const pose = dialHandPose(rotation, dialSize);
      const originX = box.gloveLeft + DIAL_GLOVE_CONTACT.x * pose.width;
      const originY = box.gloveTop + DIAL_GLOVE_CONTACT.y * pose.height;
      const corners = [
        { x: box.gloveLeft, y: box.gloveTop },
        { x: box.gloveLeft + pose.width, y: box.gloveTop },
        { x: box.gloveLeft, y: box.gloveTop + pose.height },
        { x: box.gloveLeft + pose.width, y: box.gloveTop + pose.height },
      ];
      for (const corner of corners) {
        const spun = rotateAround(corner, { x: originX, y: originY }, pose.rotateDeg);
        expect(spun.x).toBeGreaterThanOrEqual(-0.5);
        expect(spun.y).toBeGreaterThanOrEqual(-0.5);
        expect(spun.x).toBeLessThanOrEqual(box.width + 0.5);
        expect(spun.y).toBeLessThanOrEqual(box.height + 0.5);
      }
    }
  });

  it('keeps the rotate origin inside the layout box so Android can rotate without clipping the glove', () => {
    const box = dialGloveLayoutBox(148);
    const pose = dialHandPose(0, 148);
    const originX = box.gloveLeft + DIAL_GLOVE_CONTACT.x * pose.width;
    const originY = box.gloveTop + DIAL_GLOVE_CONTACT.y * pose.height;
    expect(originX).toBeGreaterThan(0);
    expect(originY).toBeGreaterThan(0);
    expect(originX).toBeLessThan(box.width);
    expect(originY).toBeLessThan(box.height);
    expect(box.gloveLeft + pose.width).toBeLessThanOrEqual(box.width + 0.01);
    expect(box.gloveTop + pose.height).toBeLessThanOrEqual(box.height + 0.01);
  });
});
