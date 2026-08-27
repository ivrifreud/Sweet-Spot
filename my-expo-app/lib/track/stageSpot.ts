import { STAGE1_SPOTS } from '../calibration/spots';
import { toPeekAndPitchSpot } from '../calibration/presentation';
import type { CalibrationSpot, Placement } from '../calibration/types';
import type { PeekAndPitchSpot } from '../../src/features/templates/peek-and-pitch/types';
import { worldBackdrop } from './tree';

export function stageContent(
  placement: Placement,
  stageNumber: number
): { calibration: CalibrationSpot; table: PeekAndPitchSpot } {
  const calibration = STAGE1_SPOTS[(stageNumber - 1) % STAGE1_SPOTS.length]!;
  return {
    calibration,
    table: {
      ...toPeekAndPitchSpot(calibration, `Stage ${stageNumber}`),
      skin: worldBackdrop(placement),
    },
  };
}
