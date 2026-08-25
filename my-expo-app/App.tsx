import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PeekAndPitchTemplate } from '@/features/templates/peek-and-pitch';

import { useAuthSession } from './hooks/useAuthSession';
import { AuthScreen } from './screens/AuthScreen';
import { CalibrationPlaceholderScreen } from './screens/CalibrationPlaceholderScreen';
import { SplashScreen } from './screens/SplashScreen';

type AppRoute = 'splash' | 'auth' | 'calibration' | 'table';

/**
 * Sprint vertical-slice shell:
 * Splash → Auth (Ivri's Supabase session) → Calibration placeholder → The Peek and Pitch.
 */
export default function App() {
  const { session } = useAuthSession();
  const [route, setRoute] = useState<AppRoute>('splash');

  useEffect(() => {
    if (route === 'auth' && session) {
      setRoute('calibration');
    }
  }, [route, session]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        {route === 'splash' ? (
          <SplashScreen
            onPressStart={() => setRoute(session ? 'calibration' : 'auth')}
          />
        ) : route === 'auth' ? (
          <AuthScreen onContinue={() => setRoute('calibration')} />
        ) : route === 'calibration' ? (
          <CalibrationPlaceholderScreen
            onStartTable={() => setRoute('table')}
            onBack={() => setRoute(session ? 'splash' : 'auth')}
          />
        ) : (
          <PeekAndPitchTemplate />
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111714',
  },
});
