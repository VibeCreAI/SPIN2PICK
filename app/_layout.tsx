import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { initSounds, unloadSounds } from '../utils/soundUtils';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define font family names that will be consistent across platforms
export const FONTS = {
  nunito: 'Nunito',
  nunitoBold: 'Nunito-Bold',
  gamjaFlower: 'GamjaFlower',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Load fonts with explicit naming
  const [fontsLoaded, fontError] = useFonts({
    [FONTS.nunito]: Nunito_400Regular,
    [FONTS.nunitoBold]: Nunito_700Bold,
    [FONTS.gamjaFlower]: require('../assets/fonts/GamjaFlower-Regular.ttf'),
  });

  // Initialize sounds when app loads
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize sounds
        initSounds();
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    
    initialize();
    
    // Clean up sounds when component unmounts
    return () => {
      unloadSounds();
    };
  }, []);

  useEffect(() => {
    // Automatically attempt to hide splash screen when fonts load
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}
