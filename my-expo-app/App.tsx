import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PeekAndPitchTemplate } from '@/features/templates/peek-and-pitch';

import { GoogleSignInButton } from './components/GoogleSignInButton';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return null; // or a Splash component, per Splash → Auth → Calibration

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style={session ? 'light' : 'dark'} />
        <NavigationContainer>
          {session ? (
            <PeekAndPitchTemplate />
          ) : (
            <View style={styles.authScreen}>
              <GoogleSignInButton />
            </View>
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07090d',
  },
  authScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
