import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}