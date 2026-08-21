import "./global.css";
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { View, StyleSheet, Text } from 'react-native';
import { GoogleSignInButton } from './components/GoogleSignInButton';

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
    <NavigationContainer>
      {session ? (
        <View style={styles.authScreen}>
          <Text>Signed in! Calibration goes here.</Text>
        </View>
      ) : (
        <View style={styles.authScreen}>
          <GoogleSignInButton />
        </View>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  authScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});