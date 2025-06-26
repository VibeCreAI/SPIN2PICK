import React from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ColorTheme } from '../utils/colorUtils';
import { ThemedText } from './ThemedText';
import { ThemePreviewCard } from './ThemePreviewCard';

interface ThemeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({ 
  visible, 
  onClose 
}) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const modalWidth = screenWidth < 500 ? '95%' : 500;

  const handleThemeSelect = async (themeId: string) => {
    try {
      await setTheme(themeId);
      // Small delay to show the selection before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error selecting theme:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[
            styles.modalContainer, 
            { 
              width: modalWidth,
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
            }
          ]}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside modal
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText 
              style={[
                styles.title,
                { color: currentTheme.uiColors.primary }
              ]}
            >
              🎨 Choose Your Theme
            </ThemedText>
            <ThemedText 
              style={[
                styles.subtitle,
                { color: currentTheme.uiColors.secondary }
              ]}
            >
              Select a color theme to customize your wheel and background
            </ThemedText>
          </View>

          {/* Theme Grid */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.themeGrid}>
              {availableThemes.map((theme: ColorTheme) => (
                <ThemePreviewCard
                  key={theme.id}
                  theme={theme}
                  isSelected={theme.id === currentTheme.id}
                  onSelect={() => handleThemeSelect(theme.id)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                { 
                  backgroundColor: currentTheme.uiColors.accent,
                  borderColor: currentTheme.uiColors.primary,
                }
              ]}
              onPress={onClose}
            >
              <ThemedText 
                style={[
                  styles.closeButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}
              >
                Done ✨
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 16,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    ...(Platform.OS === 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }),
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 120,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 