import type { PokerAction, SpotAnswer } from './types';

export function resolveCalibrationSubmit(input: {
  answersSoFar: SpotAnswer[];
  spotId: string;
  attempted: PokerAction;
  storedChosen: PokerAction | null;
}): { answers: SpotAnswer[]; persistAttempt: boolean } {
  const chosen = input.storedChosen ?? input.attempted;
  return {
    answers: [
      ...input.answersSoFar.filter((answer) => answer.spotId !== input.spotId),
      { spotId: input.spotId, chosen },
    ],
    persistAttempt: input.storedChosen == null,
  };
}
