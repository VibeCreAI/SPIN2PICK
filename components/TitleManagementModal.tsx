import { FONTS } from '@/app/_layout';
import { PREDETERMINED_TITLES } from '@/data/predeterminedTitles';
import { useTheme } from '@/hooks/useTheme';
import {
    Title,
    TitleManager
} from '@/utils/titleUtils';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';

interface TitleManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTitle: (title: Title) => void;
  currentTitle?: Title | null;
}

export const TitleManagementModal: React.FC<TitleManagementModalProps> = ({
  visible,
  onClose,
  onSelectTitle,
  currentTitle
}) => {
  const { currentTheme } = useTheme();
  const [savedTitles, setSavedTitles] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get screen width for responsive design - matching SaveLoadModal
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // Load saved titles on mount
  useEffect(() => {
    if (visible) {
      loadSavedTitles();
    }
  }, [visible]);

  const loadSavedTitles = async () => {
    setIsLoading(true);
    try {
      const titles = await TitleManager.getAllTitles();
      setSavedTitles(titles);
    } catch (error) {
      console.error('Error loading titles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTitle = (title: Title) => {
    onSelectTitle(title);
    onClose();
  };

  const handleDeleteTitle = async (titleId: string) => {
    Alert.alert(
      'Delete Title',
      'Are you sure you want to delete this title? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TitleManager.deleteTitle(titleId);
              await loadSavedTitles();
            } catch (error) {
              console.error('Error deleting title:', error);
              Alert.alert('Error', 'Failed to delete title');
            }
          }
        }
      ]
    );
  };

  const renderTitleCard = (title: Title, isPredetermined = false) => (
    <View key={title.id} style={[
      styles.titleCard,
      {
        backgroundColor: currentTheme.uiColors.cardBackground,
        borderColor: currentTitle?.id === title.id 
          ? currentTheme.uiColors.primary 
          : currentTheme.uiColors.secondary + '40',
        borderWidth: currentTitle?.id === title.id ? 3 : 2,
      }
    ]}>
      <TouchableOpacity 
        style={styles.titleCardContent}
        onPress={() => handleSelectTitle(title)}
      >
        <View style={styles.titleInfo}>
          <Text style={[styles.titleName, { color: currentTheme.uiColors.primary }]}>
            {title.emoji} {title.name}
          </Text>
          <Text style={[styles.titleDescription, { color: currentTheme.uiColors.secondary }]}>
            {title.description}
          </Text>
          <Text style={[styles.titleDetails, { color: currentTheme.uiColors.secondary }]}>
            {title.items.length} activities • {title.category}
          </Text>
        </View>
      </TouchableOpacity>
      
      {!isPredetermined && (
        <View style={styles.titleActions}>
          <TouchableOpacity 
            style={[styles.deleteButton]}
            onPress={() => handleDeleteTitle(title.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
        <View style={[
          styles.modalContainer,
          {
            backgroundColor: currentTheme.uiColors.modalBackground,
            width: containerWidth,
            maxHeight: '90%',
            minHeight: 600,
          }
        ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.uiColors.secondary + '40' }]}>
            <Text style={[styles.headerTitle, { color: currentTheme.uiColors.primary }]}>
              Choose a Title
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: currentTheme.uiColors.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content wrapper with flex: 1 */}
          <View style={styles.contentWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={currentTheme.uiColors.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.uiColors.secondary }]}>
                  Loading titles...
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={Platform.OS === 'android'}
              >
                {/* Current Title Section */}
                {currentTitle && (
                  <>
                    <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                      Current Title
                    </Text>
                    {renderTitleCard(currentTitle)}
                  </>
                )}

                {/* Predetermined Titles Section */}
                <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                  Featured Titles
                </Text>
                {PREDETERMINED_TITLES.map((title) => renderTitleCard(title, true))}

                {/* Custom Titles Section */}
                {savedTitles.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                      Your Custom Titles
                    </Text>
                    {savedTitles.map((title) => renderTitleCard(title, false))}
                  </>
                )}

                {/* Empty state for custom titles */}
                {savedTitles.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: currentTheme.uiColors.secondary }]}>
                      No custom titles yet.{'\n'}Create your own using the activities list!
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          {/* Footer outside ScrollView */}
          <View style={[styles.footer, { borderTopColor: currentTheme.uiColors.secondary + '40' }]}>
            <TouchableOpacity 
              style={[styles.closeFooterButton, { backgroundColor: currentTheme.uiColors.secondary + '40' }]}
              onPress={onClose}
            >
              <Text style={[styles.closeFooterButtonText, { color: currentTheme.uiColors.text }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  titleCard: {
    borderRadius: 12,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  titleCardContent: {
    padding: 16,
  },
  titleInfo: {
    flex: 1,
  },
  titleName: {
    fontSize: 18,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleDescription: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    marginBottom: 8,
    lineHeight: 20,
  },
  titleDetails: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
    opacity: 0.8,
  },
  titleActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#ff4444' + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: FONTS.nunito,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  closeFooterButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
  },
}); 