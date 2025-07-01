import { FONTS } from '@/app/_layout';
import { PREDETERMINED_TITLES } from '@/data/predeterminedTitles';
import { useTheme } from '@/hooks/useTheme';
import {
    Title,
    TitleManager,
    TitleCategory
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
import { CustomWheelCreationModal } from './CustomWheelCreationModal';
import { Text } from './Text';

interface TitleManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTitle: (title: Title) => void;
  currentTitle?: Title | null;
  onCreateCustomWheel?: (title: string, description: string, category: TitleCategory) => void;
}

// Helper function to remove duplicate titles
const removeDuplicatesTitles = (titles: Title[]): Title[] => {
  const seen = new Map<string, Title>();
  
  // First pass: collect all titles, handling specific duplicates
  titles.forEach(title => {
    const normalizedName = title.name.toLowerCase().trim();
    
    // Skip "Chores Roulette" if we have "Chore Assignments" (keep Chore Assignments)
    if (normalizedName === 'chores roulette' && 
        titles.some(t => t.name.toLowerCase() === 'chore assignments')) {
      return;
    }
    
    // For general duplicates, prefer predetermined titles over custom ones
    const existing = seen.get(normalizedName);
    if (!existing || (title.isPredetermined && !existing.isPredetermined)) {
      seen.set(normalizedName, title);
    }
  });
  
  return Array.from(seen.values());
};

export const TitleManagementModal: React.FC<TitleManagementModalProps> = ({
  visible,
  onClose,
  onSelectTitle,
  currentTitle,
  onCreateCustomWheel
}) => {
  const { currentTheme } = useTheme();
  const [savedTitles, setSavedTitles] = useState<Title[]>([]);
  const [titlesByCategory, setTitlesByCategory] = useState<Record<string, Title[]>>({
    'custom': [], // Move custom to first position
    'family': [],
    'food': [],
    'games': [],
    'decisions': [],
    'numbers': [],
    'workplace': [],
    'education': [],
    'entertainment': [],
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomWheelModal, setShowCustomWheelModal] = useState(false);

  // Get screen width for responsive design - matching SaveLoadModal
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // Load saved titles on mount and cleanup duplicates
  useEffect(() => {
    if (visible) {
      cleanupDuplicatesInStorage().then(() => {
        loadSavedTitles();
      });
    }
  }, [visible]);

  // Cleanup duplicates from storage
  const cleanupDuplicatesInStorage = async () => {
    try {
      const allTitles = await TitleManager.getAllTitles();
      const cleanedTitles = removeDuplicatesTitles(allTitles);
      
      if (cleanedTitles.length < allTitles.length) {
        console.log(`🧹 Removing ${allTitles.length - cleanedTitles.length} duplicate titles from storage`);
        await TitleManager.saveTitles(cleanedTitles);
        await loadSavedTitles(); // Reload the UI
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
    }
  };

  const loadSavedTitles = async () => {
    setIsLoading(true);
    try {
      const allTitles = await TitleManager.getAllTitles();
      
      // Filter out duplicates and legacy titles
      const filteredTitles = removeDuplicatesTitles(allTitles);
      setSavedTitles(filteredTitles.filter(title => title.isCustom));
      
      // Categorize titles (only show predetermined titles in categories, not in Featured section)
      const categorized: Record<string, Title[]> = {
        'custom': [], // Move custom to first position
        'family': [],
        'food': [],
        'games': [],
        'decisions': [],
        'numbers': [],
        'workplace': [],
        'education': [],
        'entertainment': [],
      };
      
      filteredTitles.forEach(title => {
        if (categorized[title.category]) {
          categorized[title.category].push(title);
        }
      });
      
      setTitlesByCategory(categorized);
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
      'Delete Wheel',
      'Are you sure you want to delete this wheel? This action cannot be undone.',
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
              Alert.alert('Error', 'Failed to delete wheel');
            }
          }
        }
      ]
    );
  };

  const handleCreateCustomWheel = (title: string, description: string, category: TitleCategory) => {
    if (onCreateCustomWheel) {
      onCreateCustomWheel(title, description, category);
      onClose(); // Close this modal after creating
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Category emoji mapping
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      'family': '🏠',
      'food': '🍽️',
      'games': '🎮',
      'decisions': '🤔',
      'numbers': '🔢',
      'workplace': '💼',
      'education': '📚',
      'entertainment': '🎭',
      'custom': '⭐'
    };
    return emojiMap[category] || '📝';
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
      
      {/* Only show delete button for custom titles (not predetermined) */}
      {(!title.isPredetermined || title.isCustomUserCreated) && (
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
              🎯 Manage Wheels
            </Text>
          </View>

          {/* Content wrapper with flex: 1 */}
          <View style={styles.contentWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={currentTheme.uiColors.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.uiColors.secondary }]}>
                  Loading wheels...
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
                      Current Wheel
                    </Text>
                    {renderTitleCard(currentTitle)}
                  </>
                )}

                {/* Create Custom Wheel Section */}
                <View style={styles.customWheelSection}>
                  <TouchableOpacity
                    style={[styles.createCustomWheelButton, {
                      backgroundColor: currentTheme.uiColors.accent,
                      borderColor: currentTheme.uiColors.primary,
                    }]}
                    onPress={() => setShowCustomWheelModal(true)}
                  >
                    <View style={styles.createCustomWheelContent}>
                      <Text style={[styles.createCustomWheelIcon]}>
                        🎨
                      </Text>
                      <View style={styles.createCustomWheelTextContainer}>
                        <Text style={[styles.createCustomWheelTitle, { color: currentTheme.uiColors.buttonText }]}>
                          Create Custom Wheel
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

                {/* Quick Title Selection by Category */}
                <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                  🎯 Quick Wheel Selection
                </Text>
                {Object.entries(titlesByCategory).map(([category, titles]) => (
                  <View key={category} style={styles.categorySection}>
                    <TouchableOpacity
                      style={[styles.categoryHeader, {
                        backgroundColor: currentTheme.uiColors.cardBackground,
                      }]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={[styles.categoryTitle, { color: currentTheme.uiColors.text }]}>
                        {getCategoryEmoji(category)} {category}
                      </Text>
                      <Text style={[styles.categoryCount, {
                        color: currentTheme.uiColors.text + '80',
                        backgroundColor: currentTheme.uiColors.primary + '20',
                      }]}>
                        {titles.length}
                      </Text>
                      <Text style={[styles.expandIcon, { color: currentTheme.uiColors.accent }]}>
                        {expandedCategories.has(category) ? '−' : '+'}
                      </Text>
                    </TouchableOpacity>

                    {expandedCategories.has(category) && (
                      <View style={styles.titlesList}>
                        {titles.length === 0 ? (
                          <View style={styles.emptyCategory}>
                            <Text style={[styles.emptyCategoryText, { 
                              color: currentTheme.uiColors.text + '60' 
                            }]}>
                              No wheels in this category yet
                            </Text>
                          </View>
                        ) : (
                          titles.map((title) => (
                            <View key={title.id} style={[styles.titleItem, {
                              backgroundColor: currentTitle?.id === title.id 
                                ? currentTheme.uiColors.primary + '15' 
                                : 'transparent',
                              borderColor: currentTheme.uiColors.primary + '30',
                            }]}>
                              <TouchableOpacity
                                style={styles.titleContent}
                                onPress={() => handleSelectTitle(title)}
                              >
                                <Text style={styles.titleEmoji}>
                                  {title.emoji}
                                </Text>
                                <Text style={[styles.titleText, { color: currentTheme.uiColors.text }]}>
                                  {title.name}
                                </Text>
                              </TouchableOpacity>
                              {(!title.isPredetermined || title.isCustomUserCreated) && (
                                <TouchableOpacity
                                  style={styles.deleteCategoryButton}
                                  onPress={() => handleDeleteTitle(title.id)}
                                >
                                  <Text style={styles.deleteCategoryButtonText}>
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                ))}


                {/* Custom Wheels Section */}
                {savedTitles.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: currentTheme.uiColors.text }]}>
                      Your Custom Wheels
                    </Text>
                    {savedTitles.map((title) => renderTitleCard(title, false))}
                  </>
                )}

                {/* Empty state for custom wheels */}
                {savedTitles.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: currentTheme.uiColors.secondary }]}>
                      No custom wheels yet.{'\n'}Create your own using the activities list!
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
        visible={showCustomWheelModal}
        onClose={() => setShowCustomWheelModal(false)}
        onCreateWheel={handleCreateCustomWheel}
      />
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
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expandIcon: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    fontWeight: 'bold',
  },
  titlesList: {
    padding: 12,
  },
  emptyCategory: {
    padding: 12,
    alignItems: 'center',
  },
  emptyCategoryText: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
  },
  titleItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  titleText: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
  },
  deleteCategoryButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteCategoryButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: FONTS.nunito,
    fontWeight: '600',
  },
  // Custom Wheel Creation Styles
  customWheelSection: {
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
}); 