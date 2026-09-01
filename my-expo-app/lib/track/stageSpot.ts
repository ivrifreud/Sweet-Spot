import { LEVEL1_STAGE1_SPOTS } from '../calibration/spots';
import { toPeekAndPitchSpot } from '../calibration/presentation';
import type { CalibrationSpot, Placement } from '../calibration/types';
import type { PeekAndPitchSpot } from '../../src/features/templates/peek-and-pitch/types';
import { SPOTS_PER_STAGE, nextSpotIndex, worldBackdrop } from './tree';

function slicePool(pool: CalibrationSpot[], stageNumber: number): CalibrationSpot[] {
  const start = ((Math.max(1, stageNumber) - 1) * SPOTS_PER_STAGE) % pool.length;
  return Array.from({ length: SPOTS_PER_STAGE }, (_, index) => pool[(start + index) % pool.length]!);
}

export function stageSpots(
  placement: Placement,
  stageNumber: number
): { calibration: CalibrationSpot[]; tables: PeekAndPitchSpot[] } {
  const calibration = slicePool(LEVEL1_STAGE1_SPOTS, stageNumber);
  const skin = worldBackdrop(placement);
  return {
    calibration,
    tables: calibration.map((spot, index) => ({
      ...toPeekAndPitchSpot(spot, `${index + 1} / ${SPOTS_PER_STAGE}`),
      skin,
    })),
  };
}

export function stageContent(
  placement: Placement,
  stageNumber: number,
  spotIndex = 0
): { calibration: CalibrationSpot; table: PeekAndPitchSpot } {
  const bundle = stageSpots(placement, stageNumber);
  const index = nextSpotIndex(spotIndex);
  return {
    calibration: bundle.calibration[index]!,
    table: bundle.tables[index]!,
  };
}
