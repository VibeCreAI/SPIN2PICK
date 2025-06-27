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
  const { currentTheme, setTheme, availableThemes, isLoading } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const modalWidth = screenWidth < 500 ? '95%' : 500;

  // Debug logging
  React.useEffect(() => {
    if (visible) {
      console.log('🎨 ThemeSelectionModal opened');
      console.log('🎨 Available themes:', availableThemes.length);
      console.log('🎨 Current theme:', currentTheme.displayName);
      console.log('🎨 Is loading:', isLoading);
      console.log('🎨 Theme IDs:', availableThemes.map(t => t.id));
    }
  }, [visible, availableThemes, currentTheme, isLoading]);

  const handleThemeSelect = async (themeId: string) => {
    try {
      console.log('🎨 Selecting theme:', themeId);
      await setTheme(themeId);
      // Small delay to show the selection before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('❌ Error selecting theme:', error);
    }
  };

  if (!visible) return null;

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
        <View 
          style={[
            styles.modalContainer, 
            { 
              width: modalWidth,
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => {}}
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={[styles.loadingText, { color: currentTheme.uiColors.secondary }]}>
                Loading themes...
              </ThemedText>
            </View>
          ) : availableThemes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: currentTheme.uiColors.secondary }]}>
                No themes available
              </ThemedText>
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={false}
              keyboardShouldPersistTaps="handled"
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
          )}

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
        </View>
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
    maxHeight: Platform.OS === 'web' ? '85%' : '90%',
    minHeight: Platform.OS === 'web' ? 500 : 600,
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
    minHeight: Platform.OS === 'web' ? 300 : 400,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: Platform.OS === 'web' ? 300 : 400,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 300 : 400,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 300 : 400,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 