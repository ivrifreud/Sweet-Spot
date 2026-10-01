import { describe, expect, it } from 'vitest';

import {
  ARRIVE_PROGRESS,
  HERO_CARD_ANCHOR,
  LEFT_CARD_ANCHOR,
  LOCK_ROTATION_DEG,
  LOCK_SCALE,
  swapPose,
} from '../../src/features/templates/hot-seats/seatSwapPose';

describe('swapPose', () => {
  it('starts on the painting with the left player in his chair', () => {
    const pose = swapPose(0);
    expect(pose.cutout).toMatchObject({
      x: LEFT_CARD_ANCHOR.x,
      y: LEFT_CARD_ANCHOR.y,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
    expect(pose.plate).toEqual({ scale: 1, x: 0, y: 0 });
    expect(pose.thumb).toEqual({ y: 0, opacity: 1 });
  });

  it('lands his card anchor on the hero cards before the overshoot', () => {
    const pose = swapPose(ARRIVE_PROGRESS);
    expect(Math.abs(pose.cutout.x - HERO_CARD_ANCHOR.x)).toBeLessThan(1);
    expect(Math.abs(pose.cutout.y - HERO_CARD_ANCHOR.y)).toBeLessThan(1);
    expect(pose.cutout.scale).toBeCloseTo(LOCK_SCALE, 1);
    expect(pose.cutout.rotation).toBeCloseTo(LOCK_ROTATION_DEG, 1);
  });

  it('ends on the same frame it started from', () => {
    const pose = swapPose(1);
    expect(pose.plate).toEqual({ scale: 1, x: 0, y: 0 });
    expect(pose.cutout.opacity).toBe(0);
    expect(pose.fillOpacity).toBe(0);
    expect(pose.originalOpacity).toBe(1);
    expect(pose.thumb).toEqual({ y: 0, opacity: 1 });
  });

  it('carries the anchor down and right across the felt', () => {
    const start = 80 / 720;
    let previous = swapPose(start).cutout;
    for (let step = 1; step <= 36; step += 1) {
      const progress = start + ((ARRIVE_PROGRESS - start) * step) / 36;
      const next = swapPose(progress).cutout;
      expect(next.x).toBeGreaterThan(previous.x);
      expect(next.y).toBeGreaterThan(previous.y);
      previous = next;
    }
  });

  it('settles from the overshoot onto the exact lock before the fade', () => {
    const lock = swapPose(580 / 720).cutout;
    expect(lock.x).toBeCloseTo(HERO_CARD_ANCHOR.x, 6);
    expect(lock.y).toBeCloseTo(HERO_CARD_ANCHOR.y, 6);
    expect(lock.scale).toBeCloseTo(LOCK_SCALE, 6);
    expect(lock.opacity).toBe(1);

    const peak = swapPose(520 / 720).cutout;
    expect(peak.y).toBeGreaterThan(HERO_CARD_ANCHOR.y);
    expect(peak.scale).toBeCloseTo(LOCK_SCALE * 1.04, 6);
  });

  it('never moves backwards in opacity once the fade starts', () => {
    let previous = swapPose(580 / 720);
    for (let step = 1; step <= 14; step += 1) {
      const next = swapPose((580 + step * 10) / 720);
      expect(next.cutout.opacity).toBeLessThanOrEqual(previous.cutout.opacity);
      expect(next.originalOpacity).toBeGreaterThanOrEqual(previous.originalOpacity);
      previous = next;
    }
  });
});
