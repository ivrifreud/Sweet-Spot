export type ResultClipKind = 'perfect' | 'miss';

export function shouldShowPerfectCelebration(grade: { stagesCorrect: number } | null): boolean {
  return grade?.stagesCorrect === 3;
}

export function shouldShowMissCelebration(grade: { stagesCorrect: number } | null): boolean {
  return grade?.stagesCorrect === 0;
}

export function resultClipKind(grade: { stagesCorrect: number } | null): ResultClipKind | null {
  if (shouldShowPerfectCelebration(grade)) return 'perfect';
  if (shouldShowMissCelebration(grade)) return 'miss';
  return null;
}

export function shouldShowResultStamps(
  grade: { stagesCorrect: number },
  celebrationFinished: boolean
): boolean {
  void grade;
  void celebrationFinished;
  return true;
}

function clipSeekSeconds(startSeconds: number, durationSeconds?: number): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return Math.min(startSeconds, Math.max(0, durationSeconds - 0.05));
}

/** Start near the beginning so the cheer action is visible (~10s ingest). */
export const CHEERING_START_SECONDS = 0.3;

/** Skip the first seven seconds of the sad-scale ingest. */
export const SAD_SCALE_START_SECONDS = 7;

export function cheeringSeekSeconds(durationSeconds?: number): number {
  return clipSeekSeconds(CHEERING_START_SECONDS, durationSeconds);
}

export function sadScaleSeekSeconds(durationSeconds?: number): number {
  return clipSeekSeconds(SAD_SCALE_START_SECONDS, durationSeconds);
}

/** Seek only after duration is known so web players do not treat an early seek as ended. */
export function resultClipStartTime(
  kind: ResultClipKind,
  durationSeconds?: number
): number | null {
  if (!durationSeconds || durationSeconds <= 0) return null;
  return kind === 'perfect'
    ? cheeringSeekSeconds(durationSeconds)
    : sadScaleSeekSeconds(durationSeconds);
}

export function resultClipMuted(kind: ResultClipKind): boolean {
  return kind !== 'miss';
}

export function finaleCue(grade: {
  decisionCorrect: boolean;
  stagesCorrect: number;
}): 'jackpot' | 'correct' | 'incorrect' {
  if (grade.stagesCorrect === 3) return 'jackpot';
  return grade.decisionCorrect ? 'correct' : 'incorrect';
}

export function stampFinaleSfx(grade: { stagesCorrect: number }): 'jackpot' | null {
  return grade.stagesCorrect === 3 ? 'jackpot' : null;
}
