import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CharacterCompanionPreview } from './components/characters/CharacterCompanionPreview';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CharacterCompanionPreview />
    </SafeAreaProvider>
  );
}
