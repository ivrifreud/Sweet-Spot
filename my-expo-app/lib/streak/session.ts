import { requireSupabase } from '../supabase';
import { mapStreakPayload } from './model';
import type { StreakState } from './types';

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getStreakState(): Promise<StreakState> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_streak_state');
  throwIfError(error);
  return mapStreakPayload(data as Parameters<typeof mapStreakPayload>[0]);
}

export async function markStreakActivity(localDay: string): Promise<StreakState> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('mark_streak_activity', {
    p_local_day: localDay,
  });
  throwIfError(error);
  return mapStreakPayload(data as Parameters<typeof mapStreakPayload>[0]);
}

export function toLocalDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

