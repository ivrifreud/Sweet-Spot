export type ProgressionLayer<TSource = unknown> = {
  unlockAfterStage: number;
  source: TSource;
};

export type ProgressionChunk<TSource = unknown> = {
  progressionLayers: readonly ProgressionLayer<TSource>[];
};

export const LOCAL_CASINO_LAYER_UNLOCKS = {
  a: [1, 2, 3, 4],
  b: [5, 6, 7, 8],
  c: [9, 10, 11, 12],
} as const;

export function visibleProgressionLayers<TSource>(
  chunk: ProgressionChunk<TSource>,
  completedCount: number
): ProgressionLayer<TSource>[] {
  return chunk.progressionLayers
    .filter((layer) => layer.unlockAfterStage <= completedCount)
    .slice()
    .sort((left, right) => left.unlockAfterStage - right.unlockAfterStage);
}

export function shouldApplyFilmTreatment(worldId: string): boolean {
  return worldId === 'local-casino';
}

export function filmFlickerAlpha(input: {
  reducedMotion: boolean;
  maxFlicker: number;
  pulse: number;
}): number {
  if (input.reducedMotion) return 0;
  const pulse = Math.min(1, Math.max(0, input.pulse));
  return Math.min(input.maxFlicker, pulse * input.maxFlicker);
}
