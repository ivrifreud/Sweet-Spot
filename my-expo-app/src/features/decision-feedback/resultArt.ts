/** Which rubber-hose stamp belongs on one answered seat. */
export function seatResultStamp(row: {
  missed: boolean;
  chosenAction: string | null;
}): 'hit' | 'miss' | null {
  if (row.missed) return 'miss';
  if (row.chosenAction) return 'hit';
  return null;
}

/** Pointing hand for the finished run: every seat right, or one seat wrong. */
export function outcomePointArt(outcome: 'correct' | 'incorrect'): 'point-correct' | 'point-miss' {
  return outcome === 'correct' ? 'point-correct' : 'point-miss';
}
