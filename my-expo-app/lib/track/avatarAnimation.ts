export const WALK_FRAME_COUNT = 4;

/** Stable frame selection for both Reanimated worklets and unit tests. */
export function walkFrameIndex(
  progress: number,
  totalFrames: number,
  frameCount = WALK_FRAME_COUNT
): number {
  'worklet';
  if (frameCount <= 1 || totalFrames <= 0) return 0;
  const safeProgress = Math.max(0, Math.min(progress, 0.999999));
  return Math.floor(safeProgress * totalFrames) % frameCount;
}
