import './global.css';

import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NextScreen } from './screens/NextScreen';
import { SplashScreen } from './screens/SplashScreen';
import { brand } from './theme/brand';

export type RootStackParamList = {
  Splash: undefined;
  Next: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: brand.night,
    card: brand.night,
    primary: brand.gold,
    text: brand.ink,
    border: brand.tealDeep,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="Splash">
            {({ navigation }) => (
              <SplashScreen onPressStart={() => navigation.navigate('Next')} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Next">
            {({ navigation }) => <NextScreen onBack={() => navigation.goBack()} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
