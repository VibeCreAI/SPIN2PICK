import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from './ThemedText';

interface ThemeButtonProps {
  onPress: () => void;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({ onPress }) => {
  const { currentTheme } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.themeButton, 
        { 
          backgroundColor: currentTheme.uiColors.accent,
          borderColor: currentTheme.uiColors.primary 
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText 
        style={[
          styles.themeButtonText,
          { color: currentTheme.uiColors.buttonText }
        ]}
      >
        {currentTheme.emoji} 🎨
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 