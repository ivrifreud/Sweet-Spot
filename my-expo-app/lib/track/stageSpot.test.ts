import { describe, expect, it } from 'vitest';

import { LEVEL1_STAGE1_SPOTS, STAGE1_SPOTS } from '../calibration/spots';
import { SPOTS_PER_STAGE } from './tree';
import { stageContent, stageSpots } from './stageSpot';

describe('stage spots', () => {
  it('keeps a 20-hand Level 1 pool that does not reuse calibration IDs', () => {
    expect(LEVEL1_STAGE1_SPOTS).toHaveLength(20);
    const calibrationIds = new Set(STAGE1_SPOTS.map((spot) => spot.id));
    expect(LEVEL1_STAGE1_SPOTS.every((spot) => !calibrationIds.has(spot.id))).toBe(true);
    expect(LEVEL1_STAGE1_SPOTS.every((spot) => spot.spotType === 'level1_stage1')).toBe(true);
  });

  it('returns exactly seven unique Level 1 spots for stage 1', () => {
    const bundle = stageSpots(1, 1);
    expect(bundle.calibration).toHaveLength(SPOTS_PER_STAGE);
    expect(new Set(bundle.calibration.map((spot) => spot.id)).size).toBe(SPOTS_PER_STAGE);
    expect(bundle.calibration.every((spot) => spot.spotType === 'level1_stage1')).toBe(true);
    expect(bundle.calibration[0]?.id).toBe('33333333-3333-4333-8333-333333333301');
    expect(bundle.calibration.map((spot) => spot.id)).toEqual(
      LEVEL1_STAGE1_SPOTS.slice(0, 7).map((spot) => spot.id)
    );
  });

  it('deals disjoint seven-hand slices for stage 1 and stage 2', () => {
    const stage1 = new Set(stageSpots(1, 1).calibration.map((spot) => spot.id));
    const stage2 = new Set(stageSpots(1, 2).calibration.map((spot) => spot.id));
    expect([...stage1].some((id) => stage2.has(id))).toBe(false);
    expect(stageSpots(1, 2).calibration[0]?.id).toBe('33333333-3333-4333-8333-333333333308');
  });

  it('indexes into the bundle without completing the stage early', () => {
    expect(stageContent(1, 1, 2).calibration.id).toBe(stageSpots(1, 1).calibration[2]?.id);
    expect(stageContent(1, 1, 6).table.progressLabel).toBe('7 / 7');
  });
});
