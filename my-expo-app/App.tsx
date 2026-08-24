import "./global.css";
import { lazy, Suspense, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import { supabase, supabaseConfigError } from './lib/supabase';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { ErrorBoundary } from './components/ErrorBoundary';

const CalibrationHarness = lazy(() =>
  import('./components/CalibrationHarness').then((mod) => ({
    default: mod.CalibrationHarness,
  })),
);

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  void SplashScreen.hideAsync().catch(() => undefined);
}

function BootScreen({ message, error }: { message: string; error?: string | null }) {
  return (
    <View style={styles.authScreen}>
      {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator size="large" />}
      <Text style={styles.hint}>{message}</Text>
    </View>
  );
}

function AppInner() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!supabaseConfigError);
  const [bootError, setBootError] = useState<string | null>(supabaseConfigError);

  useEffect(() => {
    hideSplash();
  }, []);

  useEffect(() => {
    if (!supabase) {
      hideSplash();
      return;
    }

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setBootError(error.message);
        setSession(data.session);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setBootError(err instanceof Error ? err.message : 'Could not restore session');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          hideSplash();
        }
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (supabaseConfigError) {
    return <BootScreen message="Supabase is not configured" error={supabaseConfigError} />;
  }

  if (loading) {
    return <BootScreen message="Restoring session…" />;
  }

  return (
    <NavigationContainer>
      {session ? (
        <Suspense fallback={<BootScreen message="Loading calibration…" />}>
          <CalibrationHarness userId={session.user.id} />
        </Suspense>
      ) : (
        <View style={styles.authScreen}>
          {bootError ? <Text style={styles.error}>{bootError}</Text> : null}
          <GoogleSignInButton />
        </View>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  authScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    gap: 16,
  },
  hint: {
    marginTop: 12,
    color: '#525252',
    textAlign: 'center',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
});
