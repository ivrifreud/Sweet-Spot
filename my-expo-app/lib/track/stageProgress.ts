import { supabase } from '../supabase';
import { SPOTS_PER_STAGE } from './tree';

export type StageProgressRow = {
  stageNumber: number;
  spotsCompleted: number;
  status: 'in_progress' | 'completed';
};

export async function loadStageProgress(
  userId: string,
  level: number
): Promise<{ completedCount: number; spotsByStage: Record<number, number> }> {
  if (!supabase) {
    return { completedCount: 0, spotsByStage: {} };
  }

  const { data, error } = await supabase
    .from('stage_progress')
    .select('stage_number, spots_completed, status')
    .eq('user_id', userId)
    .eq('level', level);

  if (error || !data) {
    return { completedCount: 0, spotsByStage: {} };
  }

  const spotsByStage: Record<number, number> = {};
  let completedCount = 0;
  for (const row of data) {
    const stageNumber = Number(row.stage_number);
    const spotsCompleted = Number(row.spots_completed) || 0;
    spotsByStage[stageNumber] = spotsCompleted;
    if (row.status === 'completed' || spotsCompleted >= SPOTS_PER_STAGE) {
      completedCount = Math.max(completedCount, stageNumber);
    }
  }
  return { completedCount, spotsByStage };
}

export async function saveStageProgress(input: {
  userId: string;
  level: number;
  stageNumber: number;
  spotsCompleted: number;
}): Promise<void> {
  if (!supabase) return;
  const status = input.spotsCompleted >= SPOTS_PER_STAGE ? 'completed' : 'in_progress';
  await supabase.from('stage_progress').upsert(
    {
      user_id: input.userId,
      level: input.level,
      stage_number: input.stageNumber,
      spots_completed: input.spotsCompleted,
      status,
    },
    { onConflict: 'user_id,level,stage_number' }
  );
}
