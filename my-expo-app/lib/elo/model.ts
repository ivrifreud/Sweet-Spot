/** Sprint-sized hidden Elo — mirrors submit_stage_answer. */

export const ELO_K = 16;
/** Default hidden Elo of a Level 1 Stage 1 spot (`spots.spot_elo`). */
export const LEVEL1_STAGE1_SPOT_ELO = 300;

export function expectedScore(playerElo: number, spotElo: number): number {
  return 1 / (1 + 10 ** ((spotElo - playerElo) / 400));
}

export function eloDelta(input: {
  currentElo: number;
  spotElo: number;
  correct: boolean;
  catastrophicIfWrong: boolean;
}): number {
  const score = input.correct ? 1 : 0;
  const expected = expectedScore(input.currentElo, input.spotElo);
  let delta = Math.round(ELO_K * (score - expected));
  if (!input.correct && input.catastrophicIfWrong) {
    delta *= 2;
  }
  return delta;
}

export function applyEloDelta(currentElo: number, delta: number): number {
  return Math.max(0, currentElo + delta);
}
