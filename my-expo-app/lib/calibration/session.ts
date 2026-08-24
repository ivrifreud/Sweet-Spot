import { requireSupabase } from '../supabase';
import { evaluateStage1, isAnswerCorrect, startingEloForLevel } from './routing';
import { mapSpotRow, type SpotRow } from './mapSpot';
import type { CalibrationSpot, Placement, PokerAction, SpotAnswer } from './types';

export type LoadedSpots = {
  stage1: CalibrationSpot[];
  stage2: CalibrationSpot[];
};

export type OpenSession = {
  kind: 'in_progress';
  sessionId: string;
  stage: 1 | 2;
  answers: SpotAnswer[];
};

export type PlacedSession = {
  kind: 'placed';
  sessionId: string;
  placement: Placement;
  startingElo: number;
};

export type CalibrationSessionState = OpenSession | PlacedSession;

type SessionRow = {
  id: string;
  stage: number;
  status: string;
};

type AttemptRow = {
  spot_id: string;
  chosen_answer: PokerAction | null;
};

function placementFromStatus(status: string): Placement | null {
  if (status === 'placed_level_1') return 1;
  if (status === 'placed_level_2') return 2;
  if (status === 'placed_level_3') return 3;
  return null;
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function loadCalibrationSpots(): Promise<LoadedSpots> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('spots')
    .select(
      'id, spot_type, hole_cards, board, pot_size, villain_action, prompt, hero_position, correct_answer, is_catastrophic_if_wrong, sequence_order',
    )
    .in('spot_type', ['calibration_stage1', 'calibration_stage2'])
    .order('sequence_order', { ascending: true });

  throwIfError(error);

  const mapped = (data ?? []).map((row) => mapSpotRow(row as SpotRow));
  const stage1 = mapped.filter((spot) => spot.spotType === 'calibration_stage1');
  const stage2 = mapped.filter((spot) => spot.spotType === 'calibration_stage2');
  return { stage1, stage2 };
}

async function loadAnswers(sessionId: string): Promise<SpotAnswer[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('spot_attempts')
    .select('spot_id, chosen_answer')
    .eq('session_id', sessionId)
    .eq('session_type', 'calibration');

  throwIfError(error);

  return ((data ?? []) as AttemptRow[])
    .filter((row) => row.chosen_answer)
    .map((row) => ({ spotId: row.spot_id, chosen: row.chosen_answer as PokerAction }));
}

export async function getOrCreateSession(userId: string): Promise<CalibrationSessionState> {
  const supabase = requireSupabase();
  const { data: existing, error: loadError } = await supabase
    .from('calibration_sessions')
    .select('id, stage, status')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfError(loadError);

  const row = existing as SessionRow | null;
  if (row) {
    const placement = placementFromStatus(row.status);
    if (placement) {
      return {
        kind: 'placed',
        sessionId: row.id,
        placement,
        startingElo: startingEloForLevel(placement),
      };
    }

    return {
      kind: 'in_progress',
      sessionId: row.id,
      stage: row.stage === 2 ? 2 : 1,
      answers: await loadAnswers(row.id),
    };
  }

  const { data: created, error: insertError } = await supabase
    .from('calibration_sessions')
    .insert({ user_id: userId })
    .select('id, stage, status')
    .single();

  throwIfError(insertError);
  const createdRow = created as SessionRow;

  return {
    kind: 'in_progress',
    sessionId: createdRow.id,
    stage: 1,
    answers: [],
  };
}

export async function submitAnswer(input: {
  sessionId: string;
  userId: string;
  spot: CalibrationSpot;
  chosen: PokerAction;
  stage1: CalibrationSpot[];
  answersSoFar: SpotAnswer[];
}): Promise<SpotAnswer[]> {
  const supabase = requireSupabase();
  const answers = [
    ...input.answersSoFar.filter((answer) => answer.spotId !== input.spot.id),
    { spotId: input.spot.id, chosen: input.chosen },
  ];

  const { data: existing, error: existingError } = await supabase
    .from('spot_attempts')
    .select('id')
    .eq('session_id', input.sessionId)
    .eq('spot_id', input.spot.id)
    .maybeSingle();

  throwIfError(existingError);

  if (!existing) {
    const { error: insertError } = await supabase.from('spot_attempts').insert({
      user_id: input.userId,
      spot_id: input.spot.id,
      session_type: 'calibration',
      session_id: input.sessionId,
      is_correct: isAnswerCorrect(input.spot, input.chosen),
      chosen_answer: input.chosen,
    });
    throwIfError(insertError);
  }

  const stage1Ids = new Set(input.stage1.map((spot) => spot.id));
  const stage1Answers = answers.filter((answer) => stage1Ids.has(answer.spotId));
  const stage1Result = evaluateStage1(input.stage1, stage1Answers);

  const { error: updateError } = await supabase
    .from('calibration_sessions')
    .update({
      spots_answered: answers.length,
      errors_count: stage1Result.catastrophicErrors,
      stage: stage1Result.next === 'stage_2' ? 2 : 1,
    })
    .eq('id', input.sessionId);

  throwIfError(updateError);

  return answers;
}

export type FinalizeResult = {
  placement: Placement;
  startingElo: number;
  reason: string;
};

export async function finalizeSession(sessionId: string): Promise<FinalizeResult> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('place_from_calibration', {
    session_id: sessionId,
  });
  throwIfError(error);

  const payload = data as {
    placement: number;
    starting_elo: number;
    reason: string;
  };

  return {
    placement: payload.placement as Placement,
    startingElo: payload.starting_elo,
    reason: payload.reason,
  };
}
