import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ColorTheme } from '../utils/colorUtils';
import { ThemedText } from './ThemedText';

interface ThemePreviewCardProps {
  theme: ColorTheme;
  isSelected: boolean;
  onSelect: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ 
  theme, 
  isSelected, 
  onSelect 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        { 
          backgroundColor: theme.uiColors.cardBackground,
          borderColor: isSelected ? theme.uiColors.accent : theme.uiColors.primary,
          borderWidth: isSelected ? 3 : 1,
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Theme Name and Emoji */}
      <View style={styles.header}>
        <ThemedText 
          style={[
            styles.emoji,
            { color: theme.uiColors.text }
          ]}
        >
          {theme.emoji}
        </ThemedText>
        <ThemedText 
          style={[
            styles.title,
            { color: theme.uiColors.primary }
          ]}
        >
          {theme.displayName}
        </ThemedText>
      </View>

      {/* Color Palette Preview */}
      <View style={styles.colorPreview}>
        <View style={styles.colorRow}>
          {theme.wheelColors.slice(0, 6).map((color, index) => (
            <View 
              key={index}
              style={[
                styles.colorSample,
                { backgroundColor: color }
              ]}
            />
          ))}
        </View>
        <View style={styles.colorRow}>
          {theme.wheelColors.slice(6, 12).map((color, index) => (
            <View 
              key={index + 6}
              style={[
                styles.colorSample,
                { backgroundColor: color }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Background Color Sample */}
      <View 
        style={[
          styles.backgroundSample,
          { backgroundColor: theme.backgroundColor }
        ]}
      >
        <ThemedText 
          style={[
            styles.backgroundText,
            { color: theme.uiColors.text }
          ]}
        >
          Background
        </ThemedText>
      </View>

      {/* Selection Indicator */}
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: theme.uiColors.accent }]}>
          <ThemedText style={[styles.selectedText, { color: theme.uiColors.buttonText }]}>
            ✓ Selected
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    margin: 6,
    width: 140,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorPreview: {
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  colorSample: {
    width: 16,
    height: 16,
    marginHorizontal: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#00000020',
  },
  backgroundSample: {
    width: '100%',
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00000010',
  },
  backgroundText: {
    fontSize: 10,
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  selectedText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 