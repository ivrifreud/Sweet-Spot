import { LEVEL1_STAGE1_SPOTS } from '../calibration/spots';
import { toPeekAndPitchSpot } from '../calibration/presentation';
import type { CalibrationSpot, Placement } from '../calibration/types';
import type { PeekAndPitchSpot } from '../../src/features/templates/peek-and-pitch/types';
import { SPOTS_PER_STAGE, nextSpotIndex, worldBackdrop } from './tree';

export function stageSpots(
  placement: Placement,
  stageNumber: number
): { calibration: CalibrationSpot[]; tables: PeekAndPitchSpot[] } {
  const pool = LEVEL1_STAGE1_SPOTS;
  const offset = ((Math.max(1, stageNumber) - 1) * 2) % pool.length;
  const calibration = [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, SPOTS_PER_STAGE);
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
