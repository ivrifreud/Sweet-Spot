import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigError: string | null =
  !supabaseUrl || !supabaseAnonKey
    ? 'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Restart Metro with --clear after editing .env.'
    : null;

export const supabase: SupabaseClient | null = supabaseConfigError
  ? null
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase is not configured');
  }
  return supabase;
}
