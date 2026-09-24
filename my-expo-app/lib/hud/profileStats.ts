import { SPOTS_PER_STAGE } from '../track/tree';

export type ProfileStatsInput = {
  completedCount: number;
  spotsByStage: Record<number, number>;
  streakDays: number;
  streakBestDays: number;
  levelLabel: string;
  worldLabel: string;
  displayName: string;
};

export type ProfileStats = {
  displayName: string;
  levelLabel: string;
  worldLabel: string;
  stagesCompleted: number;
  lessonsCompleted: number;
  streakDays: number;
  streakBestDays: number;
};

/** Sum finished spots across stages. Completed stages count as a full 7. */
export function lessonsCompletedFromProgress(
  completedCount: number,
  spotsByStage: Record<number, number>
): number {
  const completedLessons = Math.max(0, completedCount) * SPOTS_PER_STAGE;
  let inProgress = 0;
  for (const [stageKey, spots] of Object.entries(spotsByStage)) {
    const stageNumber = Number(stageKey);
    if (!Number.isFinite(stageNumber) || stageNumber <= completedCount) continue;
    inProgress += Math.min(SPOTS_PER_STAGE, Math.max(0, spots));
  }
  return completedLessons + inProgress;
}

export function buildProfileStats(input: ProfileStatsInput): ProfileStats {
  return {
    displayName: input.displayName.trim() || 'Player',
    levelLabel: input.levelLabel,
    worldLabel: input.worldLabel,
    stagesCompleted: Math.max(0, input.completedCount),
    lessonsCompleted: lessonsCompletedFromProgress(input.completedCount, input.spotsByStage),
    streakDays: Math.max(0, input.streakDays),
    streakBestDays: Math.max(0, input.streakBestDays),
  };
}
