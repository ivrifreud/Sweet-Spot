import { evaluateStage1 } from './routing';
import type { CalibrationSpot, SpotAnswer } from './types';

export type NextCalibrationAction = { type: 'spot'; spot: CalibrationSpot } | { type: 'finalize' };

export function nextCalibrationAction(
  stage1: CalibrationSpot[],
  stage2: CalibrationSpot[],
  answers: SpotAnswer[]
): NextCalibrationAction {
  const stage1Ids = new Set(stage1.map((spot) => spot.id));
  const stage1Answers = answers.filter((answer) => stage1Ids.has(answer.spotId));
  const stage1Result = evaluateStage1(stage1, stage1Answers);

  if (stage1Result.next === 'place_level_1') {
    return { type: 'finalize' };
  }

  const answeredIds = new Set(answers.map((answer) => answer.spotId));
  const nextStage1 = stage1.find((spot) => !answeredIds.has(spot.id));
  if (nextStage1) {
    return { type: 'spot', spot: nextStage1 };
  }

  const nextStage2 = stage2.find((spot) => !answeredIds.has(spot.id));
  if (nextStage2) {
    return { type: 'spot', spot: nextStage2 };
  }

  return { type: 'finalize' };
}
