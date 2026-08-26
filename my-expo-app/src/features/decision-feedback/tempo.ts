export type FeedbackTempo = 'fold' | 'raise' | 'default';

/** Fold snaps; raise lingers so the chip toss can read. */
export function tempoScale(tempo: FeedbackTempo): number {
  if (tempo === 'fold') return 0.55;
  if (tempo === 'raise') return 1.45;
  return 1;
}
