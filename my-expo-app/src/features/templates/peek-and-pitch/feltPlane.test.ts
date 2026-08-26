import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FELT_PLANE,
  HOLE_OVERLAP,
  collideWithFelt,
  cornerPeel,
  cornerWeight,
  depthOnFelt,
  packetPeelWeight,
  packetU,
  peelAngleDeg,
  peelLift,
  peelSliceTilt,
  peekPull,
  poseOnFelt,
} from './feltPlane';

describe('poseOnFelt', () => {
  it('keeps hero-rail cards at full size and the near pitch', () => {
    const pose = poseOnFelt(0, DEFAULT_FELT_PLANE);
    expect(pose.scale).toBe(1);
    expect(pose.rotateX).toBe(DEFAULT_FELT_PLANE.nearRotateX);
  });

  it('matches the far pitch and scale at the pot', () => {
    const pose = poseOnFelt(1, DEFAULT_FELT_PLANE);
    expect(pose.scale).toBe(DEFAULT_FELT_PLANE.farScale);
    expect(pose.rotateX).toBe(DEFAULT_FELT_PLANE.farRotateX);
  });

  it('stays between the near and far poses at mid-table', () => {
    const pose = poseOnFelt(0.5, DEFAULT_FELT_PLANE);
    expect(pose.scale).toBeLessThan(1);
    expect(pose.scale).toBeGreaterThan(DEFAULT_FELT_PLANE.farScale);
    expect(pose.rotateX).toBeGreaterThan(DEFAULT_FELT_PLANE.nearRotateX);
    expect(pose.rotateX).toBeLessThan(DEFAULT_FELT_PLANE.farRotateX);
  });
});

describe('depthOnFelt', () => {
  it('is 0 on the hero rail and 1 at the far edge', () => {
    expect(depthOnFelt(800, 800, 200)).toBe(0);
    expect(depthOnFelt(200, 800, 200)).toBe(1);
  });

  it('clamps points past the far edge', () => {
    expect(depthOnFelt(100, 800, 200)).toBe(1);
  });
});

describe('peekPull', () => {
  it('stays almost flat during the contact stage', () => {
    expect(peekPull(0)).toBe(0);
    expect(peekPull(0.16)).toBeCloseTo(0.08);
  });

  it('arches through the mid stage then reaches a full peek', () => {
    expect(peekPull(0.48)).toBeCloseTo(0.42);
    expect(peekPull(1)).toBe(1);
    expect(peekPull(0.3)).toBeGreaterThan(peekPull(0.16));
    expect(peekPull(0.3)).toBeLessThan(peekPull(0.48));
  });
});

describe('peelSliceTilt', () => {
  it('keeps the far band flatter than the near band at full peek', () => {
    expect(peelSliceTilt(0, 8, 1)).toBeLessThan(peelSliceTilt(7, 8, 1));
  });

  it('is flat at rest', () => {
    expect(peelSliceTilt(7, 8, 0)).toBe(0);
  });
});

describe('peelLift', () => {
  it('stays glued to the felt at the far edge', () => {
    expect(peelLift(0, 1)).toBe(0);
  });

  it('lifts the near edge and stays below a hard fold', () => {
    expect(peelLift(1, 1)).toBeGreaterThan(0.9);
    expect(peelLift(0.5, 1)).toBeLessThan(peelLift(1, 1));
  });

  it('starts flat — the first step is much smaller than the last', () => {
    const start = peelLift(0.1, 1) - peelLift(0, 1);
    const end = peelLift(1, 1) - peelLift(0.9, 1);
    expect(start).toBeLessThan(end);
  });
});

describe('peelAngleDeg', () => {
  it('does not hinge at the felt', () => {
    expect(Math.abs(peelAngleDeg(0, 1))).toBeLessThan(8);
  });

  it('stays inside the cap so slices cannot crease', () => {
    expect(Math.abs(peelAngleDeg(1, 1))).toBeLessThanOrEqual(26);
  });
});

describe('cornerWeight', () => {
  it('keeps the far-left glued down', () => {
    expect(cornerWeight(0, 0)).toBe(0);
  });

  it('peaks at the near-right pinch corner', () => {
    expect(cornerWeight(1, 1)).toBeGreaterThan(cornerWeight(0.5, 0.5));
    expect(cornerWeight(1, 1)).toBeGreaterThan(0.85);
  });
});

describe('packetPeelWeight', () => {
  it('maps the tucked left card onto the left of the packet', () => {
    expect(packetU(0, 0, HOLE_OVERLAP)).toBe(0);
    expect(packetU(0, 1, HOLE_OVERLAP)).toBeLessThan(packetU(1, 1, HOLE_OVERLAP));
    expect(packetU(1, 1, HOLE_OVERLAP)).toBeCloseTo(1);
  });

  it('lifts both near edges together at full peek', () => {
    const leftNear = packetPeelWeight(0, 0.5, 1, HOLE_OVERLAP);
    const rightNear = packetPeelWeight(1, 0.5, 1, HOLE_OVERLAP);
    expect(leftNear).toBeGreaterThan(0.45);
    expect(rightNear).toBeGreaterThan(0.45);
    expect(Math.abs(leftNear - rightNear)).toBeLessThan(0.35);
  });
});

describe('cornerPeel', () => {
  it('does not lift the opposite corner', () => {
    expect(cornerPeel(0, 0, 1).rise).toBe(0);
  });

  it('twists the pinched corner instead of folding a straight hinge', () => {
    const pinch = cornerPeel(1, 1, 1);
    const mid = cornerPeel(0.5, 0.5, 1);
    expect(pinch.rise).toBeGreaterThan(mid.rise);
    expect(Math.abs(pinch.rotateY)).toBeGreaterThan(0);
  });
});

describe('collideWithFelt', () => {
  it('matches the plane pose when the card has landed', () => {
    const landed = collideWithFelt(1, 0, DEFAULT_FELT_PLANE);
    const pose = poseOnFelt(1, DEFAULT_FELT_PLANE);
    expect(landed.rotateX).toBe(pose.rotateX);
    expect(landed.scale).toBe(pose.scale);
  });
});
