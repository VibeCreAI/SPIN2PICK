import React, { useState } from 'react';
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
import { CustomThemeModal } from './CustomThemeModal';
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
  const { currentTheme, setTheme, availableThemes, isLoading, customTheme, hasCustomTheme } = useTheme();
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
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
      console.error('❌ Error selecting theme:', error);
    }
  };

  const handleCustomThemePress = () => {
    setShowCustomThemeModal(true);
  };

  const handleCustomThemeClose = () => {
    setShowCustomThemeModal(false);
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
              {/* Custom Theme Section */}
              <View style={styles.customSection}>
                <ThemedText 
                  style={[
                    styles.sectionTitle,
                    { color: currentTheme.uiColors.text }
                  ]}
                >
                  🎨 Custom Theme
                </ThemedText>
                <View style={styles.customThemeContainer}>
                  {/* Show existing custom theme if it exists */}
                  {hasCustomTheme && customTheme && (
                    <ThemePreviewCard
                      theme={customTheme}
                      isSelected={currentTheme.id === 'custom'}
                      onSelect={() => handleThemeSelect('custom')}
                    />
                  )}
                  {/* Create/Edit custom theme button */}
                  <TouchableOpacity
                    style={[
                      styles.createCustomThemeButton,
                      { 
                        backgroundColor: currentTheme.uiColors.cardBackground,
                        borderColor: currentTheme.uiColors.accent,
                      }
                    ]}
                    onPress={handleCustomThemePress}
                  >
                    <ThemedText style={[
                      styles.createCustomThemeIcon,
                      { color: currentTheme.uiColors.accent }
                    ]}>
                      🎨
                    </ThemedText>
                    <ThemedText style={[
                      styles.createCustomThemeText,
                      { color: currentTheme.uiColors.text }
                    ]}>
                      {hasCustomTheme ? 'Edit Custom' : 'Create Custom'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Built-in Themes Section */}
              <View style={styles.builtInSection}>
                <ThemedText 
                  style={[
                    styles.sectionTitle,
                    { color: currentTheme.uiColors.text }
                  ]}
                >
                  🌟 Built-in Themes
                </ThemedText>
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

      {/* Custom Theme Modal */}
      <CustomThemeModal
        visible={showCustomThemeModal}
        onClose={handleCustomThemeClose}
      />
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
  customSection: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  customThemeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  createCustomThemeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    minWidth: 140,
    minHeight: 60,
  },
  createCustomThemeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  createCustomThemeText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  builtInSection: {
    flex: 1,
  },
}); 