function clampIndex(value: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, value));
}

/** Heavy scenery only. Nodes/progress stay mounted regardless of this window. */
export function visibleChunkWindow(input: {
  chunkCount: number;
  activeChunkIndex: number;
  travelChunkIndex?: number | null;
  mapActive?: boolean;
}): number[] {
  const { chunkCount } = input;
  if (chunkCount <= 0) return [];
  const active = clampIndex(input.activeChunkIndex, chunkCount);
  const mounted = new Set<number>([active]);
  if (input.travelChunkIndex != null) {
    mounted.add(clampIndex(input.travelChunkIndex, chunkCount));
  }
  return [...mounted].sort((left, right) => left - right);
}

export function settleChunkWindow(activeChunkIndex: number, chunkCount: number): number[] {
  return visibleChunkWindow({ chunkCount, activeChunkIndex, travelChunkIndex: null });
}
