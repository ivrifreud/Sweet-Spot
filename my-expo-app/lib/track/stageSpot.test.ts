import { describe, expect, it } from 'vitest';

import { LEVEL1_STAGE1_SPOTS, STAGE1_SPOTS } from '../calibration/spots';
import { SPOTS_PER_STAGE } from './tree';
import { hotSeatStageItem, stageContent, stageSpots } from './stageSpot';
import { GARDEN_PREFLOP_STORY } from '../../src/features/templates/hot-seats/fixtures';

describe('stage spots', () => {
  it('keeps a 20-hand Level 1 pool that does not reuse calibration IDs', () => {
    expect(LEVEL1_STAGE1_SPOTS).toHaveLength(20);
    const calibrationIds = new Set(STAGE1_SPOTS.map((spot) => spot.id));
    expect(LEVEL1_STAGE1_SPOTS.every((spot) => !calibrationIds.has(spot.id))).toBe(true);
    expect(LEVEL1_STAGE1_SPOTS.every((spot) => spot.spotType === 'level1_stage1')).toBe(true);
  });

  it('mixes five Equity Scale demos into the seven-spot Level 1 stage', () => {
    const bundle = stageSpots(1, 1);
    expect(bundle.calibration).toHaveLength(SPOTS_PER_STAGE);
    expect(new Set(bundle.calibration.map((spot) => spot.id)).size).toBe(SPOTS_PER_STAGE);
    expect(bundle.calibration.every((spot) => spot.spotType === 'level1_stage1')).toBe(true);
    expect(bundle.calibration[0]?.id).toBe('33333333-3333-4333-8333-333333333301');
    expect(bundle.items.map((spot) => spot.templateId)).toEqual([2, 2, 2, 2, 2, 1, 1]);
    const first = bundle.items[0];
    expect(first?.templateId).toBe(2);
    if (first?.templateId === 2) {
      expect(first.table.progressLabel).toBe('Stage 1 · 1 / 7');
    }
  });

  it('deals disjoint seven-hand slices for stage 1 and stage 2', () => {
    const stage1 = new Set(stageSpots(1, 1).calibration.map((spot) => spot.id));
    const stage2 = new Set(stageSpots(1, 2).calibration.map((spot) => spot.id));
    expect([...stage1].some((id) => stage2.has(id))).toBe(false);
    expect(stageSpots(1, 2).calibration[0]?.id).toBe('33333333-3333-4333-8333-333333333308');
  });

  it('indexes into the bundle without completing the stage early', () => {
    expect(stageContent(1, 1, 2).grading.id).toBe(stageSpots(1, 1).calibration[2]?.id);
    const last = stageContent(1, 1, 6);
    expect(last.templateId).toBe(1);
    if (last.templateId === 1) {
      expect(last.table.progressLabel).toBe('Stage 1 · 7 / 7');
    }
  });

  it('keeps The Hot Seats out of the current seven-spot mix', () => {
    const item = hotSeatStageItem(GARDEN_PREFLOP_STORY);
    expect(item.templateId).toBe(7);
    expect(item.table.id).toBe(GARDEN_PREFLOP_STORY.id);
    expect(item.grading.heroPosition).toBe('UTG');
    expect(item.grading.pillar).toBe(1);
    expect(stageSpots(1, 1).items.map((spot) => spot.templateId)).toEqual([2, 2, 2, 2, 2, 1, 1]);
    expect(stageSpots(1, 1).items.some((spot) => spot.templateId === 7)).toBe(false);
  });
});
