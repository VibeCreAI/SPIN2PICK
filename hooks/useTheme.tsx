import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { COLOR_THEMES, ColorTheme, getThemeById, THEME_STORAGE_KEY } from '../utils/colorUtils';

interface ThemeContextType {
  currentTheme: ColorTheme;
  setTheme: (themeId: string) => Promise<void>;
  availableThemes: ColorTheme[];
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: COLOR_THEMES[0],
  setTheme: async () => {},
  availableThemes: COLOR_THEMES,
  isLoading: true,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        console.log('🎨 Loading saved theme...');
        const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId) {
          const theme = getThemeById(savedThemeId);
          setCurrentTheme(theme);
          console.log('🎨 Loaded saved theme:', theme.displayName);
        } else {
          console.log('🎨 No saved theme found, using default:', COLOR_THEMES[0].displayName);
          setCurrentTheme(COLOR_THEMES[0]);
        }
      } catch (error) {
        console.error('❌ Error loading saved theme:', error);
        // Fallback to default theme on error
        setCurrentTheme(COLOR_THEMES[0]);
      } finally {
        setIsLoading(false);
        console.log('🎨 Theme loading complete');
      }
    };

    loadSavedTheme();
  }, []);

  const setTheme = async (themeId: string): Promise<void> => {
    try {
      console.log('🎨 Changing theme to:', themeId);
      const newTheme = getThemeById(themeId);
      setCurrentTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      console.log('🎨 Theme changed and saved:', newTheme.displayName);
    } catch (error) {
      console.error('❌ Error saving theme:', error);
      throw error;
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: COLOR_THEMES,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 