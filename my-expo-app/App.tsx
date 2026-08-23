import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PeekAndPitchTemplate } from '@/features/templates/peek-and-pitch';

import { SplashScreen } from './screens/SplashScreen';

/**
 * Signed-in users land on Template 1 (Peek and Pitch).
 * Benny's Garden theme + PokerQuestionScene live under components/theme for
 * shared World 1 skinning across templates; they are not the App entry yet.
 */
export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        {started ? (
          <PeekAndPitchTemplate />
        ) : (
          <SplashScreen onPressStart={() => setStarted(true)} />
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
