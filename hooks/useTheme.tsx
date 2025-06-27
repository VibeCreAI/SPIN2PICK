import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { COLOR_THEMES, ColorTheme, createCustomTheme, CustomThemeData, getThemeById, loadCustomTheme, saveCustomTheme, THEME_STORAGE_KEY } from '../utils/colorUtils';

interface ThemeContextType {
  currentTheme: ColorTheme;
  setTheme: (themeId: string) => Promise<void>;
  availableThemes: ColorTheme[];
  isLoading: boolean;
  customTheme: ColorTheme | null;
  setCustomTheme: (customData: CustomThemeData) => Promise<void>;
  hasCustomTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: COLOR_THEMES[0],
  setTheme: async () => {},
  availableThemes: COLOR_THEMES,
  isLoading: true,
  customTheme: null,
  setCustomTheme: async () => {},
  hasCustomTheme: false,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [customTheme, setCustomThemeState] = useState<ColorTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        console.log('🎨 Loading saved theme...');
        
        // Load custom theme if exists
        const customData = await loadCustomTheme();
        if (customData && customData.isActive) {
          const customThemeObj = createCustomTheme(customData);
          setCustomThemeState(customThemeObj);
          setCurrentTheme(customThemeObj);
          console.log('🎨 Loaded custom theme:', customData.name);
          return;
        }
        
        // Load regular theme
        const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId) {
          const theme = getThemeById(savedThemeId);
          setCurrentTheme(theme);
          console.log('🎨 Loaded saved theme:', theme.displayName);
        } else {
          console.log('🎨 No saved theme found, using default:', COLOR_THEMES[0].displayName);
          setCurrentTheme(COLOR_THEMES[0]);
        }
        
        // Set custom theme state if exists but not active
        if (customData) {
          setCustomThemeState(createCustomTheme(customData));
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

  const setCustomTheme = async (customData: CustomThemeData): Promise<void> => {
    try {
      console.log('🎨 Setting custom theme:', customData.name);
      const customThemeObj = createCustomTheme(customData);
      setCustomThemeState(customThemeObj);
      setCurrentTheme(customThemeObj);
      
      // Save as active custom theme
      await saveCustomTheme({ ...customData, isActive: true });
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'custom');
      
      console.log('🎨 Custom theme set successfully');
    } catch (error) {
      console.error('❌ Error setting custom theme:', error);
      throw error;
    }
  };

  const setTheme = async (themeId: string): Promise<void> => {
    try {
      console.log('🎨 Changing theme to:', themeId);
      
      if (themeId === 'custom' && customTheme) {
        setCurrentTheme(customTheme);
        // Update custom theme to be active
        const customData = await loadCustomTheme();
        if (customData) {
          await saveCustomTheme({ ...customData, isActive: true });
        }
      } else {
        const newTheme = getThemeById(themeId);
        setCurrentTheme(newTheme);
        // Deactivate custom theme if exists
        const customData = await loadCustomTheme();
        if (customData) {
          await saveCustomTheme({ ...customData, isActive: false });
        }
      }
      
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      console.log('🎨 Theme changed and saved');
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
    customTheme,
    setCustomTheme,
    hasCustomTheme: customTheme !== null,
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