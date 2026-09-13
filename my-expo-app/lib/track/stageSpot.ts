import { LEVEL1_STAGE1_SPOTS } from '../calibration/spots';
import { toPeekAndPitchSpot } from '../calibration/presentation';
import type { CalibrationSpot, Placement } from '../calibration/types';
import type { EquityScaleSpot } from '../../src/features/templates/equity-scale';
import type { PeekAndPitchSpot } from '../../src/features/templates/peek-and-pitch/types';
import { EQUITY_SCALE_DEMO_SPOTS } from './equityScaleSpots';
import { SPOTS_PER_STAGE, nextSpotIndex, worldBackdrop } from './tree';

export type StageTemplateSpot =
  | { templateId: 1; grading: CalibrationSpot; table: PeekAndPitchSpot }
  | { templateId: 2; grading: CalibrationSpot; table: EquityScaleSpot };

function basePool(): StageTemplateSpot[] {
  return [
    ...EQUITY_SCALE_DEMO_SPOTS.map(({ grading, table }): StageTemplateSpot => ({
      templateId: 2,
      grading,
      table,
    })),
    ...LEVEL1_STAGE1_SPOTS.slice(EQUITY_SCALE_DEMO_SPOTS.length).map(
      (grading): StageTemplateSpot => ({
        templateId: 1,
        grading,
        table: toPeekAndPitchSpot(grading, ''),
      })
    ),
  ];
}

function slicePool(pool: StageTemplateSpot[], stageNumber: number): StageTemplateSpot[] {
  const start = ((Math.max(1, stageNumber) - 1) * SPOTS_PER_STAGE) % pool.length;
  return Array.from(
    { length: SPOTS_PER_STAGE },
    (_, index) => pool[(start + index) % pool.length]!
  );
}

export function stageSpots(
  placement: Placement,
  stageNumber: number
): {
  items: StageTemplateSpot[];
  calibration: CalibrationSpot[];
  tables: (PeekAndPitchSpot | EquityScaleSpot)[];
} {
  const sliced = slicePool(basePool(), stageNumber);
  const skin = worldBackdrop(placement);
  const items = sliced.map((item, index): StageTemplateSpot => {
    const progressLabel = `Stage ${stageNumber} · ${index + 1} / ${SPOTS_PER_STAGE}`;
    if (item.templateId === 2) {
      return {
        ...item,
        table: { ...item.table, skin, progressLabel },
      };
    }
    return {
      ...item,
      table: { ...item.table, skin, progressLabel },
    };
  });
  return {
    items,
    calibration: items.map((item) => item.grading),
    tables: items.map((item) => item.table),
  };
}

export function stageContent(
  placement: Placement,
  stageNumber: number,
  spotIndex = 0
): StageTemplateSpot {
  const bundle = stageSpots(placement, stageNumber);
  const index = nextSpotIndex(spotIndex);
  return bundle.items[index]!;
}
