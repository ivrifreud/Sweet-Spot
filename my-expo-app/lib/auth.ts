import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { requireSupabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const supabase = requireSupabase();
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);

  if (res.type === 'success' && res.url) {
    const url = new URL(res.url.replace('#', '?'));
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');

    if (access_token && refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) throw sessionError;
    }
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  username: string;
}) {
  const supabase = requireSupabase();
  const username = params.username.trim();
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        full_name: username,
        display_name: username,
      },
    },
  });
  if (error) throw error;

  if (data.session && data.user && username) {
    await supabase.from('profiles').update({ display_name: username }).eq('id', data.user.id);
  }

  return { needsEmailConfirm: !data.session };
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Something went wrong. Try again.';
  if (/invalid login credentials/i.test(message)) {
    return 'Email or password is not right.';
  }
  if (/user already registered/i.test(message)) {
    return 'That email already has an account. Sign in instead.';
  }
  if (/password/i.test(message) && /at least|too short|6/i.test(message)) {
    return 'Password needs at least 6 characters.';
  }
  if (/email/i.test(message) && /invalid/i.test(message)) {
    return 'Enter a valid email address.';
  }
  if (/rate limit|too many/i.test(message)) {
    return 'Too many tries. Wait a moment and try again.';
  }
  return message;
}
