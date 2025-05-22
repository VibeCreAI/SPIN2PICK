import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { initSounds, unloadSounds } from '../utils/soundUtils';

// Conditional import for AdMob
let mobileAds: any = null;
try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (error) {
  console.log('AdMob module not available - running in Expo Go mode');
}

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

  // Initialize sounds and AdMob when app loads
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize AdMob (if available)
        if (mobileAds) {
          await mobileAds.initialize();
          console.log('AdMob initialized');
        } else {
          console.log('AdMob not available - skipping initialization');
        }
        
        // Initialize sounds
        initSounds();
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
