import { FONTS } from '@/app/_layout';
import { useTheme } from '@/hooks/useTheme';
import {
  Title,
  TitleCategory,
  TitleManager
} from '@/utils/titleUtils';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomWheelCreationModal } from './CustomWheelCreationModal';
import { Text } from './Text';

interface CustomWheelsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTitle: (title: Title) => void;
  currentTitle?: Title | null;
  onCreateCustomWheel?: (title: string, description: string, category: TitleCategory) => void;
}

export const CustomWheelsModal: React.FC<CustomWheelsModalProps> = ({
  visible,
  onClose,
  onSelectTitle,
  currentTitle,
  onCreateCustomWheel
}) => {
  const { currentTheme } = useTheme();
  const [customWheels, setCustomWheels] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomWheelCreationModal, setShowCustomWheelCreationModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [titleToDelete, setTitleToDelete] = useState<Title | null>(null);

  // Get screen width for responsive design - matching SaveLoadModal
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // Load custom wheels on mount
  useEffect(() => {
    if (visible) {
      loadCustomWheels();
    }
  }, [visible]);

  const loadCustomWheels = async () => {
    setIsLoading(true);
    try {
      const allTitles = await TitleManager.getAllTitles();
      
      // Filter to only show custom wheels (user-created)
      const customTitles = allTitles.filter(title => 
        title.isCustom || title.isCustomUserCreated || title.category === TitleCategory.CUSTOM
      );
      
      setCustomWheels(customTitles);
    } catch (error) {
      console.error('Error loading custom wheels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTitle = (title: Title) => {
    onSelectTitle(title);
    onClose();
  };

  const handleDeleteTitle = (title: Title) => {
    console.log('🗑️ Delete button clicked for custom wheel:', title.name, 'ID:', title.id);
    
    // Check if this is the current wheel
    if (currentTitle?.id === title.id) {
      console.log('🗑️ Cannot delete current wheel');
      return;
    }
    
    // Show confirmation modal
    setTitleToDelete(title);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!titleToDelete) return;
    
    try {
      console.log('🗑️ User confirmed, attempting to delete custom wheel:', titleToDelete.id);
      const success = await TitleManager.deleteTitle(titleToDelete.id);
      console.log('🗑️ Delete result:', success);
      if (success) {
        console.log('🗑️ Custom wheel deleted successfully, reloading wheels...');
        await loadCustomWheels();
      }
    } catch (error) {
      console.error('Error deleting custom wheel:', error);
    } finally {
      setShowDeleteConfirmation(false);
      setTitleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log('🗑️ User cancelled deletion');
    setShowDeleteConfirmation(false);
    setTitleToDelete(null);
  };

  const handleCreateCustomWheel = (title: string, description: string, category: TitleCategory) => {
    if (onCreateCustomWheel) {
      onCreateCustomWheel(title, description, category);
      setShowCustomWheelCreationModal(false);
      onClose(); // Close this modal after creating
    }
  };

  const renderCustomWheelCard = (title: Title) => (
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
            {title.items.length} options • Custom wheel
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Only show delete button for custom wheels that are not current */}
      {currentTitle?.id !== title.id && (
        <View style={styles.titleActions}>
          <TouchableOpacity 
            style={[styles.deleteButton]}
            onPress={() => handleDeleteTitle(title)}
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
              ⭐ Custom Wheels
            </Text>
          </View>

          {/* Content wrapper with flex: 1 */}
          <View style={styles.contentWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={currentTheme.uiColors.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.uiColors.secondary }]}>
                  Loading custom wheels...
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContent, { flexGrow: 1, minHeight: '100%' }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled={Platform.OS === 'android'}
              >
                {/* Current Custom Wheel Section */}
                {currentTitle && (currentTitle.isCustom || currentTitle.isCustomUserCreated || currentTitle.category === TitleCategory.CUSTOM) && (
                  <>
                    <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                      Current Custom Wheel
                    </Text>
                    {renderCustomWheelCard(currentTitle)}
                  </>
                )}

                {/* Create Custom Wheel Section */}
                <View style={styles.createCustomWheelSection}>
                  <TouchableOpacity
                    style={[styles.createCustomWheelButton, {
                      backgroundColor: currentTheme.uiColors.accent,
                      borderColor: currentTheme.uiColors.primary,
                    }]}
                    onPress={() => setShowCustomWheelCreationModal(true)}
                  >
                    <View style={styles.createCustomWheelContent}>
                      <Text style={[styles.createCustomWheelIcon]}>
                        🎨
                      </Text>
                      <View style={styles.createCustomWheelTextContainer}>
                        <Text style={[styles.createCustomWheelTitle, { color: currentTheme.uiColors.buttonText }]}>
                          Create New Custom Wheel
                        </Text>
                        <Text style={[styles.createCustomWheelSubtitle, { color: currentTheme.uiColors.buttonText + 'CC' }]}>
                          AI-powered suggestions for your unique ideas
                        </Text>
                      </View>
                      <Text style={[styles.createCustomWheelArrow, { color: currentTheme.uiColors.buttonText }]}>
                        →
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Custom Wheels List */}
                {customWheels.length > 0 ? (
                  <>
                    <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                      Your Custom Wheels
                    </Text>
                    {customWheels.map((title) => renderCustomWheelCard(title))}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: currentTheme.uiColors.secondary }]}>
                      No custom wheels yet.{'\n'}Create your first custom wheel!
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          {/* Footer outside ScrollView */}
          <View style={[styles.footer, { borderTopColor: currentTheme.uiColors.secondary + '40' }]}>
            <TouchableOpacity 
              style={[styles.closeFooterButton, { 
                backgroundColor: currentTheme.uiColors.accent,
                borderColor: currentTheme.uiColors.primary,
              }]}
              onPress={onClose}
            >
              <Text style={[styles.closeFooterButtonText, { color: currentTheme.uiColors.buttonText }]}>
                Done ✨
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Custom Wheel Creation Modal */}
      <CustomWheelCreationModal
        visible={showCustomWheelCreationModal}
        onClose={() => setShowCustomWheelCreationModal(false)}
        onCreateWheel={handleCreateCustomWheel}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && titleToDelete && (
        <Modal
          visible={showDeleteConfirmation}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelDelete}
        >
          <TouchableOpacity 
            style={styles.deleteModalOverlay}
            activeOpacity={1}
            onPress={handleCancelDelete}
          >
            <TouchableOpacity 
              style={[styles.deleteModalContainer, { 
                backgroundColor: currentTheme.uiColors.modalBackground,
                borderColor: currentTheme.uiColors.primary,
              }]} 
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping inside
            >
              <Text style={[styles.deleteModalTitle, { color: currentTheme.uiColors.primary }]}>
                🗑️ Delete Custom Wheel
              </Text>
              <Text style={[styles.deleteModalMessage, { color: currentTheme.uiColors.text }]}>
                Are you sure you want to delete "{titleToDelete.name}"?
              </Text>
              <Text style={[styles.deleteModalWarning, { color: currentTheme.uiColors.secondary }]}>
                This action cannot be undone.
              </Text>
              
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity 
                  style={[styles.deleteModalCancelButton, { backgroundColor: currentTheme.uiColors.secondary }]} 
                  onPress={handleCancelDelete}
                >
                  <Text style={[styles.deleteModalCancelText, { color: currentTheme.uiColors.buttonText }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteModalConfirmButton} 
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.deleteModalConfirmText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
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
  
  // Create Custom Wheel Section
  createCustomWheelSection: {
    marginBottom: 24,
  },
  createCustomWheelButton: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createCustomWheelContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createCustomWheelIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  createCustomWheelTextContainer: {
    flex: 1,
  },
  createCustomWheelTitle: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  createCustomWheelSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    lineHeight: 18,
  },
  createCustomWheelArrow: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },

  // Custom Wheel Cards
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

  // Empty State
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

  // Footer
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  closeFooterButton: {
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
  closeFooterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },

  // Loading
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

  // Delete Confirmation Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    maxWidth: 400,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteModalMessage: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  deleteModalWarning: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
  },
  deleteModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff4444',
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
    color: 'white',
  },
});