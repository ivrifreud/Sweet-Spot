import './global.css';
import { lazy, Suspense, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './components/ErrorBoundary';
import { DEV_BYPASS_USER_ID } from './lib/devBypass';
import { supabase, supabaseConfigError } from './lib/supabase';
import { AuthScreen } from './screens/AuthScreen';
import { SplashScreen } from './screens/SplashScreen';

const CalibrationHarness = lazy(() =>
  import('./components/CalibrationHarness').then((mod) => ({
    default: mod.CalibrationHarness,
  }))
);

void ExpoSplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  void ExpoSplashScreen.hideAsync().catch(() => undefined);
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
  const [started, setStarted] = useState(false);
  const [devBypassActive, setDevBypassActive] = useState(false);

  const activeUserId = session?.user.id ?? (devBypassActive ? DEV_BYPASS_USER_ID : null);

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

  if (supabaseConfigError && !__DEV__) {
    return <BootScreen message="Supabase is not configured" error={supabaseConfigError} />;
  }

  if (loading) {
    return <BootScreen message="Restoring session…" />;
  }

  return (
    <NavigationContainer>
      {!started ? (
        <SplashScreen onPressStart={() => setStarted(true)} />
      ) : activeUserId ? (
        <Suspense fallback={<BootScreen message="Loading calibration…" />}>
          <CalibrationHarness
            userId={activeUserId}
            devMode={devBypassActive}
            onSignOut={() => setDevBypassActive(false)}
          />
        </Suspense>
      ) : (
        <View style={styles.route}>
          <AuthScreen
            onContinue={() => undefined}
            onDevBypass={() => setDevBypassActive(true)}
          />
          {bootError ? (
            <View style={styles.restoreError}>
              <Text style={styles.restoreErrorText}>{bootError}</Text>
            </View>
          ) : null}
        </View>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="auto" />
        <ErrorBoundary>
          <AppInner />
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07090d',
  },
  route: {
    flex: 1,
  },
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
  restoreError: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    borderRadius: 12,
    backgroundColor: '#7f1d1d',
    padding: 12,
  },
  restoreErrorText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});
