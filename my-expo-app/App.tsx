import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BennysGardenPreviewScreen } from './screens/BennysGardenPreviewScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <BennysGardenPreviewScreen />
    </SafeAreaProvider>
  );
}
