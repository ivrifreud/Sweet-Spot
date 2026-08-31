import { describe, expect, it } from 'vitest';

import { SPOTS_PER_STAGE } from './tree';
import { stageContent, stageSpots } from './stageSpot';

describe('stage spots', () => {
  it('returns exactly seven unique Level 1 spots', () => {
    const bundle = stageSpots(1, 1);
    expect(bundle.calibration).toHaveLength(SPOTS_PER_STAGE);
    expect(new Set(bundle.calibration.map((spot) => spot.id)).size).toBe(SPOTS_PER_STAGE);
  });

  it('indexes into the bundle without completing the stage early', () => {
    expect(stageContent(1, 1, 2).calibration.id).toBe(stageSpots(1, 1).calibration[2]?.id);
    expect(stageContent(1, 1, 6).table.progressLabel).toBe('7 / 7');
  });
});
