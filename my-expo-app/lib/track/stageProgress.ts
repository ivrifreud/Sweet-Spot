import { requireSupabase, supabase } from '../supabase';
import { SPOTS_PER_STAGE } from './tree';

export type StageProgressStatus = 'in_progress' | 'completed' | 'locked_out';

export type StageProgressRow = {
  stageNumber: number;
  spotsCompleted: number;
  status: StageProgressStatus;
};

export type StageProgressSession = {
  id: string;
  spotsCompleted: number;
  status: StageProgressStatus;
};

function asStatus(value: string): StageProgressStatus {
  if (value === 'completed' || value === 'locked_out' || value === 'in_progress') {
    return value;
  }
  return 'in_progress';
}

function mapSession(row: {
  id: string;
  spots_completed: number | null;
  status: string;
}): StageProgressSession {
  return {
    id: row.id,
    spotsCompleted: Number(row.spots_completed) || 0,
    status: asStatus(row.status),
  };
}

export async function getOrCreateStageProgress(input: {
  userId: string;
  level: number;
  stageNumber: number;
}): Promise<StageProgressSession> {
  const client = requireSupabase();
  const { data: existing, error: selectError } = await client
    .from('stage_progress')
    .select('id, spots_completed, status')
    .eq('user_id', input.userId)
    .eq('level', input.level)
    .eq('stage_number', input.stageNumber)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);
  if (existing) return mapSession(existing);

  const { data: created, error: insertError } = await client
    .from('stage_progress')
    .insert({
      user_id: input.userId,
      level: input.level,
      stage_number: input.stageNumber,
    })
    .select('id, spots_completed, status')
    .single();

  if (!insertError && created) return mapSession(created);

  const { data: raced, error: retryError } = await client
    .from('stage_progress')
    .select('id, spots_completed, status')
    .eq('user_id', input.userId)
    .eq('level', input.level)
    .eq('stage_number', input.stageNumber)
    .single();

  if (retryError || !raced) {
    throw new Error(insertError?.message ?? 'Could not create stage progress');
  }
  return mapSession(raced);
}

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
