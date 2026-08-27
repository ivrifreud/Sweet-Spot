import { supabase } from '../supabase';
import { MAX_CHIPS, clampChips } from './chips';

export async function loadRemainingChips(userId: string): Promise<number> {
  if (!supabase) return MAX_CHIPS;

  const { data, error } = await supabase
    .from('chip_stacks')
    .select('chips')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || data?.chips == null) return MAX_CHIPS;
  return clampChips(Number(data.chips));
}
