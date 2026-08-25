import { requireSupabase } from '../supabase';
import { mapChipStackPayload, mapStageAnswerPayload } from './model';
import type { ChipStackState, StageAnswerResult, StagePokerAction } from './types';

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getChipStack(): Promise<ChipStackState> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_chip_stack');
  throwIfError(error);

  return mapChipStackPayload(data as Parameters<typeof mapChipStackPayload>[0]);
}

export async function submitStageAnswer(input: {
  stageProgressId: string;
  spotId: string;
  chosenAnswer: StagePokerAction;
}): Promise<StageAnswerResult> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('submit_stage_answer', {
    p_stage_progress_id: input.stageProgressId,
    p_spot_id: input.spotId,
    p_chosen_answer: input.chosenAnswer,
  });
  throwIfError(error);

  return mapStageAnswerPayload(data as Parameters<typeof mapStageAnswerPayload>[0]);
}
