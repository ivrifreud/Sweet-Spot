import { supabase } from './supabase';

const FALLBACK_DISPLAY_NAME = 'Player';

export async function loadDisplayName(userId: string): Promise<string> {
  if (!supabase) return FALLBACK_DISPLAY_NAME;

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) return FALLBACK_DISPLAY_NAME;

  const displayName = String(data?.display_name ?? '').trim();
  return displayName || FALLBACK_DISPLAY_NAME;
}
