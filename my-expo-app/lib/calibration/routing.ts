import type {
  CalibrationRouteInput,
  CalibrationRouteResult,
  CalibrationSpot,
  Placement,
  PokerAction,
  SpotAnswer,
  Stage1Result,
  Stage2Result,
} from './types';

const STARTING_ELO: Record<Placement, number> = {
  1: 300,
  2: 850,
  3: 1300,
};

const STAGE1_CATASTROPHIC_THRESHOLD = 2;

export function startingEloForLevel(level: Placement): number {
  return STARTING_ELO[level];
}

export function isAnswerCorrect(spot: CalibrationSpot, chosen: PokerAction): boolean {
  return chosen === spot.correctAnswer;
}

function answersBySpotId(answers: SpotAnswer[]): Map<string, PokerAction> {
  const map = new Map<string, PokerAction>();
  for (const answer of answers) {
    map.set(answer.spotId, answer.chosen);
  }
  return map;
}

export function evaluateStage1(spots: CalibrationSpot[], answers: SpotAnswer[]): Stage1Result {
  const chosenById = answersBySpotId(answers);
  let catastrophicErrors = 0;

  for (const spot of spots) {
    const chosen = chosenById.get(spot.id);
    if (chosen === undefined) continue;
    if (!isAnswerCorrect(spot, chosen) && spot.isCatastrophicIfWrong) {
      catastrophicErrors += 1;
    }
  }

  return {
    catastrophicErrors,
    next: catastrophicErrors >= STAGE1_CATASTROPHIC_THRESHOLD ? 'place_level_1' : 'stage_2',
  };
}

export function evaluateStage2(spots: CalibrationSpot[], answers: SpotAnswer[]): Stage2Result {
  const chosenById = answersBySpotId(answers);
  const unanswered = spots.filter((spot) => !chosenById.has(spot.id));
  if (unanswered.length > 0) {
    throw new Error('Stage 2 requires a full sample before placement');
  }

  let misses = 0;
  for (const spot of spots) {
    const chosen = chosenById.get(spot.id);
    if (chosen === undefined || !isAnswerCorrect(spot, chosen)) {
      misses += 1;
    }
  }

  return {
    misses,
    placement: misses === 0 ? 3 : 2,
  };
}

export function routeCalibration(input: CalibrationRouteInput): CalibrationRouteResult {
  const stage1 = evaluateStage1(input.stage1.spots, input.stage1.answers);

  if (stage1.next === 'place_level_1') {
    return {
      placement: 1,
      reason: 'stage1_catastrophic',
      startingElo: startingEloForLevel(1),
    };
  }

  if (!input.stage2) {
    throw new Error('Stage 2 answers required when Stage 1 does not place Level 1');
  }

  const stage2 = evaluateStage2(input.stage2.spots, input.stage2.answers);
  const placement = stage2.placement;
  return {
    placement,
    reason: placement === 3 ? 'stage2_full_pass' : 'stage2_miss',
    startingElo: startingEloForLevel(placement),
  };
}
