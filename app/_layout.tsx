import { Jua_400Regular } from '@expo-google-fonts/jua';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, useColorScheme, View } from 'react-native';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define font family names that will be consistent across platforms
export const FONTS = {
  nunito: 'Nunito',
  nunitoBold: 'Nunito-Bold',
  gamjaFlower: 'GamjaFlower',
  jua: 'Jua',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Load fonts with explicit naming
  const [fontsLoaded, fontError] = useFonts({
    [FONTS.nunito]: Nunito_400Regular,
    [FONTS.nunitoBold]: Nunito_700Bold,
    [FONTS.gamjaFlower]: require('../assets/fonts/GamjaFlower-Regular.ttf'),
    [FONTS.jua]: Jua_400Regular,
  });

  useEffect(() => {
    // Automatically attempt to hide splash screen when fonts load or after timeout
    if (fontsLoaded || fontError) {
      console.log('Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [fontsLoaded, fontError]);

  // Add timeout fallback to prevent indefinite black screen
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!fontsLoaded && !fontError) {
        console.log('Font loading timeout - hiding splash screen anyway');
        SplashScreen.hideAsync().catch(console.error);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Show loading screen instead of null to prevent black screen
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f3efff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: '#4e4370' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="dark" backgroundColor="#f3efff" translucent={false} />
      <Slot />
    </ThemeProvider>
  );
}
