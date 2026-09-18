import { describe, expect, it } from 'vitest';

import { DIAL_MAX_DEG, DIAL_MIN_DEG } from '../../src/features/templates/equity-scale/dialMath';
import {
  DIAL_HAND_TILT_MAX_DEG,
  DIAL_PIVOT_ORIGIN,
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

  it('plants the thumb on the right rim and sends the sleeve off the phone', () => {
    const pose = dialHandPose(0, 148);
    const thumbX = pose.left + 0.2 * pose.width;
    expect(thumbX).toBeGreaterThan(148 * 0.7);
    expect(thumbX).toBeLessThan(148 * 0.95);
    expect(pose.left + pose.width).toBeGreaterThan(148 * 1.8);
    expect(pose.top + pose.height).toBeGreaterThan(148 * 1.5);
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
