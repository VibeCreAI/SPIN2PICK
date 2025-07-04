import { FONTS } from '@/app/_layout';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Activity } from '../utils/colorUtils';

interface ActivityListModalProps {
  visible: boolean;
  onClose: () => void;
  activities: Activity[];
  onDeleteActivity: (activityName: string) => void;
  onAddActivities: (activities: string[]) => void;
  onBulkAISuggest: (count: number, category?: string) => void;
  isLoadingBulkAI?: boolean;
  bulkAISuggestions?: string[];
  onAcceptBulkSuggestions: (selectedActivities: string[]) => void;
  onClearBulkSuggestions: () => void;
}

type TabType = 'view' | 'add' | 'ai';

export const ActivityListModal: React.FC<ActivityListModalProps> = ({
  visible,
  onClose,
  activities,
  onDeleteActivity,
  onAddActivities,
  onBulkAISuggest,
  isLoadingBulkAI = false,
  bulkAISuggestions = [],
  onAcceptBulkSuggestions,
  onClearBulkSuggestions,
}) => {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('view');
  
  // State for multiple activity input
  const [bulkInputText, setBulkInputText] = useState('');
  const [parsedActivities, setParsedActivities] = useState<string[]>([]);
  
  // State for AI suggestions
  const [aiActivityCount, setAiActivityCount] = useState(5);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  
  // State for the confirmation modal (delete functionality)
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    activityName: string;
    activityEmoji: string;
  }>({
    visible: false,
    activityName: '',
    activityEmoji: '',
  });

  // Get screen width for responsive design (following SaveLoadModal pattern)
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '90%' : MODAL_MAX_WIDTH;



  // Reset states when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab('view');
      setBulkInputText('');
      setParsedActivities([]);
      setSelectedSuggestions([]);
      onClearBulkSuggestions();
    }
  }, [visible]);

  // Parse bulk input text
  useEffect(() => {
    if (bulkInputText.trim()) {
      const parsed = parseMultipleActivities(bulkInputText);
      setParsedActivities(parsed);
    } else {
      setParsedActivities([]);
    }
  }, [bulkInputText]);

  // Update selected suggestions when bulk AI suggestions change
  useEffect(() => {
    if (bulkAISuggestions.length > 0) {
      setSelectedSuggestions(bulkAISuggestions);
    }
  }, [bulkAISuggestions]);

  const parseMultipleActivities = (input: string): string[] => {
    // Handle various input formats: comma-separated, line-separated, numbered lists
    let parsedActivities = input
      .replace(/^\d+\.\s*/gm, '') // Remove numbered list format "1. "
      .split(/[,\n;]+/) // Split by comma, newline, or semicolon
      .map(activity => activity.trim())
      .filter(activity => activity.length > 0 && activity.length <= 50) // Filter valid activities
      .slice(0, 20); // Limit to 20 activities max

    // Remove duplicates
    const uniqueActivities = [...new Set(parsedActivities)];
    
    // Filter out activities that already exist (case-insensitive)
    const existingNames = activities.map(a => a.name.toLowerCase());
    const newActivities = uniqueActivities.filter(
      activity => !existingNames.includes(activity.toLowerCase())
    );

    return newActivities;
  };

  const handleDeletePress = (activity: Activity) => {
    setConfirmationModal({
      visible: true,
      activityName: activity.name,
      activityEmoji: activity.emoji || '📝',
    });
  };

  const handleConfirmDelete = () => {
    if (confirmationModal.activityName) {
      onDeleteActivity(confirmationModal.activityName);
      setConfirmationModal({ visible: false, activityName: '', activityEmoji: '' });
    }
  };

  const handleCancelDelete = () => {
    setConfirmationModal({ visible: false, activityName: '', activityEmoji: '' });
  };

  const handleAddBulkActivities = () => {
    if (parsedActivities.length > 0) {
      onAddActivities(parsedActivities);
      setBulkInputText('');
      setParsedActivities([]);
      setActiveTab('view'); // Switch back to view tab to see results
    }
  };

  const handleGenerateAIActivities = () => {
    onBulkAISuggest(aiActivityCount);
  };

  const handleToggleSuggestion = (activity: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleAcceptSelectedSuggestions = () => {
    if (selectedSuggestions.length > 0) {
      onAcceptBulkSuggestions(selectedSuggestions);
      setSelectedSuggestions([]);
      setActiveTab('view'); // Switch back to view tab to see results
    }
  };

  const renderTabButton = (tab: TabType, title: string, icon: string) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tab 
            ? currentTheme.uiColors.primary 
            : currentTheme.uiColors.cardBackground,
          borderColor: currentTheme.uiColors.primary,
        }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text allowFontScaling={false} style={[
        styles.tabButtonText,
        { 
          color: activeTab === tab 
            ? currentTheme.uiColors.buttonText 
            : currentTheme.uiColors.primary 
        }
      ]}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );

  const renderViewDeleteTab = () => (
    <ScrollView 
      style={styles.tabContent}
      contentContainerStyle={[styles.scrollContent, { flexGrow: 1, minHeight: '100%' }]}
      showsVerticalScrollIndicator={true}
      scrollEnabled={true}
      bounces={Platform.OS === 'ios'}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="always"
    >
      <Text allowFontScaling={false} style={[
        styles.tabDescription,
        { color: currentTheme.uiColors.secondary }
      ]}>
        Tap a slice to delete it
      </Text>
      
      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text allowFontScaling={false} style={[
            styles.emptyText,
            { color: currentTheme.uiColors.secondary }
          ]}>
            📝 No slices yet
          </Text>
          <Text allowFontScaling={false} style={[
            styles.emptySubtext,
            { color: currentTheme.uiColors.secondary }
          ]}>
            Add some slices first!
          </Text>
        </View>
      ) : (
        <View style={styles.activitiesList}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityItem,
                {
                  backgroundColor: currentTheme.uiColors.cardBackground,
                  borderColor: currentTheme.uiColors.primary,
                }
              ]}
              onPress={() => handleDeletePress(activity)}
              activeOpacity={0.7}
            >
              <View style={styles.activityContent}>
                <Text allowFontScaling={false} style={[
                  styles.activityText,
                  { color: currentTheme.uiColors.text }
                ]}>
                  {activity.emoji || '📝'} {activity.name}
                </Text>
                <Text allowFontScaling={false} style={styles.deleteIcon}>
                  ❌
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderAddMultipleTab = () => (
    <ScrollView 
      style={styles.tabContent}
      contentContainerStyle={[styles.scrollContent, { flexGrow: 1, minHeight: '100%' }]}
      showsVerticalScrollIndicator={true}
      scrollEnabled={true}
      bounces={Platform.OS === 'ios'}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="always"
    >
      <Text allowFontScaling={false} style={[
        styles.tabDescription,
        { color: currentTheme.uiColors.secondary }
      ]}>
        Enter multiple slices separated by commas or new lines
      </Text>
      
      <TextInput
        style={[
          styles.bulkTextInput,
          {
            color: currentTheme.uiColors.text,
            backgroundColor: currentTheme.uiColors.cardBackground,
            borderColor: currentTheme.uiColors.primary,
          }
        ]}
        value={bulkInputText}
        onChangeText={setBulkInputText}
        placeholder="Swimming, Reading, Cooking, Playing Guitar..."
        placeholderTextColor={currentTheme.uiColors.secondary}
        multiline
        textAlignVertical="top"
        allowFontScaling={false}
        maxLength={1000}
      />
      
      {parsedActivities.length > 0 && (
        <View style={styles.previewSection}>
          <Text allowFontScaling={false} style={[
            styles.previewTitle,
            { color: currentTheme.uiColors.primary }
          ]}>
            Preview ({parsedActivities.length} slices):
          </Text>
          <View style={styles.previewGrid}>
            {parsedActivities.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.previewItem,
                  {
                    backgroundColor: currentTheme.uiColors.cardBackground,
                    borderColor: currentTheme.uiColors.primary,
                  }
                ]}
              >
                <Text allowFontScaling={false} style={[
                  styles.previewItemText,
                  { color: currentTheme.uiColors.text }
                ]}>
                  📝 {activity}
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: currentTheme.uiColors.accent }
            ]}
            onPress={handleAddBulkActivities}
          >
            <Text allowFontScaling={false} style={[
              styles.addButtonText,
              { color: currentTheme.uiColors.buttonText }
            ]}>
              ➕ Add All Slices
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderAISuggestionsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      contentContainerStyle={[styles.scrollContent, { flexGrow: 1, minHeight: '100%' }]}
      showsVerticalScrollIndicator={true}
      scrollEnabled={true}
      bounces={Platform.OS === 'ios'}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="always"
    >
      <Text allowFontScaling={false} style={[
        styles.tabDescription,
        { color: currentTheme.uiColors.secondary }
      ]}>
        Generate multiple slices using AI
      </Text>
      
      {bulkAISuggestions.length === 0 && (
        <View style={styles.aiControls}>
          <Text allowFontScaling={false} style={[
            styles.aiControlLabel,
            { color: currentTheme.uiColors.text }
          ]}>
            Number of slices:
          </Text>
          
          <View style={styles.countSelector}>
            {[3, 5, 7, 10].map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.countButton,
                  {
                    backgroundColor: aiActivityCount === count 
                      ? currentTheme.uiColors.primary 
                      : currentTheme.uiColors.cardBackground,
                    borderColor: currentTheme.uiColors.primary,
                  }
                ]}
                onPress={() => setAiActivityCount(count)}
              >
                <Text allowFontScaling={false} style={[
                  styles.countButtonText,
                  { 
                    color: aiActivityCount === count 
                      ? currentTheme.uiColors.buttonText 
                      : currentTheme.uiColors.primary 
                  }
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: currentTheme.uiColors.accent }
            ]}
            onPress={handleGenerateAIActivities}
            disabled={isLoadingBulkAI}
          >
            <Text allowFontScaling={false} style={[
              styles.generateButtonText,
              { color: currentTheme.uiColors.buttonText }
            ]}>
              {isLoadingBulkAI ? '🤔 Thinking...' : '✨ Generate Slices'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {bulkAISuggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text allowFontScaling={false} style={[
            styles.suggestionsTitle,
            { color: currentTheme.uiColors.primary }
          ]}>
            AI Suggestions (tap to select/deselect):
          </Text>
          
          <View style={styles.suggestionsGrid}>
            {bulkAISuggestions.map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  {
                    backgroundColor: selectedSuggestions.includes(activity)
                      ? currentTheme.uiColors.accent
                      : currentTheme.uiColors.cardBackground,
                    borderColor: currentTheme.uiColors.primary,
                  }
                ]}
                onPress={() => handleToggleSuggestion(activity)}
              >
                <Text allowFontScaling={false} style={[
                  styles.suggestionItemText,
                  { 
                    color: selectedSuggestions.includes(activity)
                      ? currentTheme.uiColors.buttonText
                      : currentTheme.uiColors.text
                  }
                ]}>
                  {selectedSuggestions.includes(activity) ? '✅' : '⭕'} {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.suggestionActions}>
            <TouchableOpacity
              style={[
                styles.suggestionActionButton,
                styles.clearButton,
                { backgroundColor: currentTheme.uiColors.secondary }
              ]}
              onPress={() => {
                onClearBulkSuggestions();
                setSelectedSuggestions([]);
              }}
            >
              <Text allowFontScaling={false} style={[
                styles.suggestionActionButtonText,
                { color: currentTheme.uiColors.buttonText }
              ]}>
                🔄 Generate New
              </Text>
            </TouchableOpacity>
            
            {selectedSuggestions.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.suggestionActionButton,
                  styles.acceptButton,
                  { backgroundColor: currentTheme.uiColors.accent }
                ]}
                onPress={handleAcceptSelectedSuggestions}
              >
                <Text allowFontScaling={false} style={[
                  styles.suggestionActionButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}>
                  ➕ Add Selected ({selectedSuggestions.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderConfirmationModal = () => (
    <Modal
      visible={confirmationModal.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancelDelete}
    >
      <TouchableOpacity 
        style={styles.confirmationOverlay}
        activeOpacity={1}
        onPress={handleCancelDelete}
      >
        <TouchableOpacity 
          style={[
            styles.confirmationContainer,
            {
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
            }
          ]}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside
        >
          <Text allowFontScaling={false} style={[
            styles.confirmationTitle,
            { color: currentTheme.uiColors.primary }
          ]}>
            ⚠️ Delete Slice?
          </Text>
          
          <Text allowFontScaling={false} style={[
            styles.confirmationMessage,
            { color: currentTheme.uiColors.secondary }
          ]}>
            Are you sure you want to delete:
          </Text>
          
          <Text allowFontScaling={false} style={[
            styles.activityToDelete,
            { 
              color: currentTheme.uiColors.text,
              backgroundColor: currentTheme.uiColors.cardBackground,
            }
          ]}>
            {confirmationModal.activityEmoji} {confirmationModal.activityName}
          </Text>
          
          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={[
                styles.confirmationButton,
                styles.cancelButton,
                { backgroundColor: currentTheme.uiColors.secondary }
              ]} 
              onPress={handleCancelDelete}
            >
              <Text allowFontScaling={false} style={[
                styles.cancelButtonText,
                { color: currentTheme.uiColors.buttonText }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmationButton,
                styles.deleteButton,
                { backgroundColor: '#ff6b6b' }
              ]} 
              onPress={handleConfirmDelete}
            >
              <Text allowFontScaling={false} style={styles.deleteButtonText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  if (!visible) return null;

  return (
    <>
      <Modal 
        visible={visible} 
        transparent 
        animationType="fade" 
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View 
            style={[
              styles.modalContainer, 
              { 
                width: containerWidth,
                backgroundColor: currentTheme.uiColors.modalBackground,
                borderColor: currentTheme.uiColors.primary,
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text allowFontScaling={false} style={[
                styles.title,
                { color: currentTheme.uiColors.primary }
              ]}>
                📃 Manage Slices
              </Text>
            </View>

            {/* Tab Buttons */}
            <View style={styles.tabButtonsContainer}>
              {renderTabButton('view', 'View', '👁️')}
              {renderTabButton('add', 'Add Multiple', '📝')}
              {renderTabButton('ai', 'AI Suggest', '✨')}
            </View>

            {/* Content wrapper with flex: 1 */}
            <View style={styles.contentWrapper}>
              {/* Tab Content */}
              {activeTab === 'view' && renderViewDeleteTab()}
              {activeTab === 'add' && renderAddMultipleTab()}
              {activeTab === 'ai' && renderAISuggestionsTab()}
            </View>

            {/* Footer outside contentWrapper */}
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
                <Text allowFontScaling={false} style={[
                  styles.closeButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}>
                  Done ✨
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      {renderConfirmationModal()}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 16, // Add proper padding like SaveLoadModal
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '90%',
    minHeight: Platform.OS === 'web' ? 500 : 600,
    borderRadius: Platform.OS === 'web' ? 12 : 20, // Slightly more rounded on mobile like SaveLoadModal
    borderWidth: 2,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentWrapper: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    minHeight: Platform.OS === 'web' ? 300 : 400,
    maxHeight: Platform.OS === 'web' ? 400 : 500,
  },
  tabDescription: {
    fontSize: 16,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  
  // View/Delete Tab Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
  },
  activitiesList: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  activityItem: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.jua,
  },
  deleteIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
  
  // Add Multiple Tab Styles
  bulkTextInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.nunito,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
    }),
  },
  previewSection: {
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  previewItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  previewItemText: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  
  // AI Suggestions Tab Styles
  aiControls: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aiControlLabel: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 12,
  },
  countSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  countButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
  },
  countButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    flex: 1,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  suggestionItemText: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  suggestionActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  suggestionActionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  clearButton: {
    // Additional styles for clear button if needed
  },
  acceptButton: {
    // Additional styles for accept button if needed
  },
  
  // Confirmation Modal Styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  confirmationTitle: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    marginBottom: 15,
    textAlign: 'center',
  },
  activityToDelete: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
    minWidth: 120,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    // Specific styles for cancel button
  },
  deleteButton: {
    // Specific styles for delete button
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Footer Styles (platform-specific, following SaveLoadModal pattern)
  footer: {
    padding: Platform.OS === 'web' ? 16 : 6, // Reduce padding on mobile for better fit
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  closeButton: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16, // Reduce horizontal padding on mobile
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: Platform.OS === 'web' ? 120 : 120, // Reduce minimum width on mobile
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButtonText: {
    fontSize: Platform.OS === 'web' ? 18 : 18, // Slightly smaller font on mobile for better fit
    fontWeight: 'bold',
    fontFamily: FONTS.jua,
  },
}); 