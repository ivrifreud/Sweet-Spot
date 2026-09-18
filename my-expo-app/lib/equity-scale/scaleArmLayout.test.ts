import { describe, expect, it } from 'vitest';

import { SCALE_MAX_TILT_DEG } from '../../src/features/templates/equity-scale/dialMath';
import {
  SCALE_ARM_PIVOTS,
  dialValueToTilt,
  frameBlendOpacity,
  panDeltaY,
  scaleArmPose,
  scaleFrameIndex,
  scaleFramePosition,
} from '../../src/features/templates/equity-scale/components/scaleArmLayout';

describe('dialValueToTilt', () => {
  it('maps the dial center to a level beam and the ends to opposite max leans', () => {
    expect(dialValueToTilt(35, 0, 70)).toBe(0);
    expect(dialValueToTilt(0, 0, 70)).toBe(-SCALE_MAX_TILT_DEG);
    expect(dialValueToTilt(70, 0, 70)).toBe(SCALE_MAX_TILT_DEG);
  });

  it('turns a higher dial reading into the opposite pan of a lower reading', () => {
    const low = scaleArmPose(dialValueToTilt(10, 0, 70));
    const high = scaleArmPose(dialValueToTilt(60, 0, 70));
    expect(panDeltaY('left', low.leftRotateDeg)).toBeGreaterThan(0);
    expect(panDeltaY('right', low.rightRotateDeg)).toBeLessThan(0);
    expect(panDeltaY('left', high.leftRotateDeg)).toBeLessThan(0);
    expect(panDeltaY('right', high.rightRotateDeg)).toBeGreaterThan(0);
  });
});

describe('scaleArmPose', () => {
  it('holds both hands level when the beam is balanced', () => {
    expect(scaleArmPose(0)).toEqual({ leftRotateDeg: 0, rightRotateDeg: 0 });
  });

  it('drops the right pan and lifts the left pan for a clockwise (positive) tilt', () => {
    const pose = scaleArmPose(8);
    expect(pose.leftRotateDeg).toBe(8);
    expect(pose.rightRotateDeg).toBe(8);
    expect(panDeltaY('left', pose.leftRotateDeg)).toBeLessThan(0);
    expect(panDeltaY('right', pose.rightRotateDeg)).toBeGreaterThan(0);
  });

  it('drops the left pan and lifts the right pan for a counter-clockwise tilt', () => {
    const pose = scaleArmPose(-8);
    expect(pose.leftRotateDeg).toBe(-8);
    expect(pose.rightRotateDeg).toBe(-8);
    expect(panDeltaY('left', pose.leftRotateDeg)).toBeGreaterThan(0);
    expect(panDeltaY('right', pose.rightRotateDeg)).toBeLessThan(0);
  });

  it('mirrors the two pans so they never travel in the same screen direction', () => {
    const pose = scaleArmPose(5);
    expect(pose.leftRotateDeg).toBe(pose.rightRotateDeg);
    expect(panDeltaY('left', pose.leftRotateDeg)).toBe(-panDeltaY('right', pose.rightRotateDeg));
    expect(Math.sign(panDeltaY('left', pose.leftRotateDeg))).not.toBe(
      Math.sign(panDeltaY('right', pose.rightRotateDeg))
    );
  });

  it('clamps travel to the hardware tilt limit', () => {
    const high = scaleArmPose(90);
    const low = scaleArmPose(-90);
    expect(high.rightRotateDeg).toBe(SCALE_MAX_TILT_DEG);
    expect(high.leftRotateDeg).toBe(SCALE_MAX_TILT_DEG);
    expect(low.leftRotateDeg).toBe(-SCALE_MAX_TILT_DEG);
    expect(low.rightRotateDeg).toBe(-SCALE_MAX_TILT_DEG);
  });
});

describe('scaleFrameIndex', () => {
  it('buckets tilt onto 2-degree frames so neighboring poses barely differ', () => {
    expect(scaleFrameIndex(-28)).toBe(0);
    expect(scaleFrameIndex(-14)).toBe(7);
    expect(scaleFrameIndex(0)).toBe(14);
    expect(scaleFrameIndex(14)).toBe(21);
    expect(scaleFrameIndex(28)).toBe(28);
  });

  it('shows only the level frame when the beam is at rest', () => {
    expect(scaleFramePosition(0)).toBe(14);
    expect(frameBlendOpacity(14, 14)).toBe(1);
    expect(frameBlendOpacity(14, 13)).toBe(0);
    expect(frameBlendOpacity(14, 15)).toBe(0);
    expect(frameBlendOpacity(14.5, 14)).toBeCloseTo(0.5);
    expect(frameBlendOpacity(14.5, 15)).toBeCloseTo(0.5);
    expect(frameBlendOpacity(14.5, 13)).toBe(0);
  });
});

describe('scale arm pivots', () => {
  it('plants each hose in a shoulder socket, not the canvas center', () => {
    expect(SCALE_ARM_PIVOTS.left.x).toBeGreaterThan(0.3);
    expect(SCALE_ARM_PIVOTS.left.x).toBeLessThan(0.42);
    expect(SCALE_ARM_PIVOTS.right.x).toBeGreaterThan(0.58);
    expect(SCALE_ARM_PIVOTS.right.x).toBeLessThan(0.7);
    expect(SCALE_ARM_PIVOTS.left.y).toBeCloseTo(SCALE_ARM_PIVOTS.right.y, 2);
    expect(SCALE_ARM_PIVOTS.left.y).toBeGreaterThan(0.35);
    expect(SCALE_ARM_PIVOTS.left.y).toBeLessThan(0.55);
  });
});
