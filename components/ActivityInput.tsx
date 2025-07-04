import { FONTS } from '@/app/_layout';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Activity } from '../utils/colorUtils';
import { ActivityListModal } from './ActivityListModal';
import { ThemedView } from './ThemedView';

interface ActivityInputProps {
  onAddActivity: (name: string) => void;
  onSuggestActivity: () => void;
  existingActivities: string[];
  isLoading: boolean;
  isSuggesting: boolean;
  pendingSuggestion: string | null;
  showSuggestionPopup: boolean;
  onAcceptSuggestion: () => void;
  onDeclineSuggestion: () => void;
  activities: Activity[];
  onDeleteActivity: (activityName: string) => void;
  onAddActivities: (activities: string[]) => void;
  onBulkAISuggest: (count: number, category?: string) => void;
  isLoadingBulkAI?: boolean;
  bulkAISuggestions?: string[];
  onAcceptBulkSuggestions: (selectedActivities: string[]) => void;
  onClearBulkSuggestions: () => void;
  // External control for opening the activity list modal
  externalOpenActivityList?: boolean;
  onExternalOpenHandled?: () => void;
  // Error handling callback
  onShowError?: (title: string, message: string) => void;
}

export const ActivityInput: React.FC<ActivityInputProps> = ({
  onAddActivity,
  onSuggestActivity,
  existingActivities,
  isLoading,
  isSuggesting,
  pendingSuggestion,
  showSuggestionPopup,
  onAcceptSuggestion,
  onDeclineSuggestion,
  activities,
  onDeleteActivity,
  onAddActivities,
  onBulkAISuggest,
  isLoadingBulkAI = false,
  bulkAISuggestions = [],
  onAcceptBulkSuggestions,
  onClearBulkSuggestions,
  externalOpenActivityList = false,
  onExternalOpenHandled,
  onShowError,
}) => {
  const { currentTheme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  
  // Get correct initial dimensions - fix for SSR/web initial render
  const getInitialDimensions = () => {
    if (typeof window !== 'undefined') {
      // Web: Use actual window dimensions from the start
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
        fontScale: 1,
      };
    }
    // Mobile: Use React Native Dimensions
    return Dimensions.get('window');
  };

  // Initialize with correct dimensions from the start - no flash/adjustment needed
  const [screenDimensions, setScreenDimensions] = useState(getInitialDimensions());

  // Update screen dimensions when they change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      console.log('📱 ActivityInput: Dimensions changed to:', window.width);
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);



  // Get screen dimensions for responsive design (simplified)
  const screenData = screenDimensions;
  const screenWidth = screenData.width;
  const isNarrowScreen = screenWidth < 360; // For button spacing adjustments only

  const handleSubmit = useCallback(() => {
    const trimmedText = inputText.trim();
    if (trimmedText && !isLoading) {
      // Check for duplicates (case-insensitive)
      const isDuplicate = existingActivities.some(
        activity => activity.toLowerCase() === trimmedText.toLowerCase()
      );
      
      if (isDuplicate) {
        onShowError?.('Duplicate Activity', 'This activity already exists!');
        return;
      }
      
      onAddActivity(trimmedText);
      setInputText('');
    }
  }, [inputText, isLoading, onAddActivity, existingActivities]);

  // Auto-focus effect for better UX
  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      // Focus is handled by the TextInput ref if needed
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle external request to open activity list modal
  useEffect(() => {
    if (externalOpenActivityList) {
      setShowListModal(true);
      onExternalOpenHandled?.();
    }
  }, [externalOpenActivityList, onExternalOpenHandled]);

  return (
    <ThemedView 
      lightColor="transparent" 
      darkColor="transparent" 
      style={styles.container}
    >
      {/* Main Input Card - matching lastActivityContainer styling */}
      <ThemedView 
        lightColor={currentTheme.uiColors.cardBackground}
        darkColor={currentTheme.uiColors.cardBackground}
        style={[
          styles.inputCard, 
          {
            backgroundColor: currentTheme.uiColors.cardBackground,
            borderColor: currentTheme.uiColors.primary,
          }
        ]}
      >
        <ThemedView 
          lightColor={currentTheme.uiColors.cardBackground}
          darkColor={currentTheme.uiColors.cardBackground}
          style={styles.inputContent}
        >
          {/* Input Row with buttons on the right */}
          <ThemedView 
            lightColor={currentTheme.uiColors.cardBackground}
            darkColor={currentTheme.uiColors.cardBackground}
            style={[styles.inputRow, { gap: isNarrowScreen ? 4 : 8 }]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  color: currentTheme.uiColors.text,
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Add new slice..."
              placeholderTextColor={currentTheme.uiColors.secondary}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={true}
              allowFontScaling={false}
              maxLength={50}
            />
            
            {/* Buttons on the right side - no background colors */}
            <ThemedView 
              lightColor={currentTheme.uiColors.cardBackground}
              darkColor={currentTheme.uiColors.cardBackground}
              style={[styles.rightButtons, { gap: isNarrowScreen ? 2 : 4 }]}
            >
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleSubmit}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.7}
              >
                <Text allowFontScaling={false} style={[
                  styles.iconButtonText,
                  { color: currentTheme.uiColors.primary }
                ]}>
                  {isLoading ? '⏳' : '➕'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={onSuggestActivity}
                disabled={isSuggesting}
                activeOpacity={0.7}
              >
                <Text allowFontScaling={false} style={[
                  styles.iconButtonText,
                  { color: currentTheme.uiColors.primary }
                ]}>
                  {isSuggesting ? '🤔' : '✨'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowListModal(true)}
                activeOpacity={0.7}
              >
                <Text allowFontScaling={false} style={[
                  styles.iconButtonText,
                  { color: currentTheme.uiColors.primary }
                ]}>
                  📃
                </Text>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* AI Suggestion Popup */}
      <Modal
        visible={showSuggestionPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={onDeclineSuggestion}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onDeclineSuggestion}
        >
          <TouchableOpacity 
            style={[
              styles.popupContainer,
              {
                backgroundColor: currentTheme.uiColors.modalBackground,
                borderColor: currentTheme.uiColors.primary,
              }
            ]}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside popup
          >
            <Text allowFontScaling={false} style={[
              styles.popupTitle,
              { color: currentTheme.uiColors.primary }
            ]}>AI Suggestion ✨</Text>
            <Text allowFontScaling={false} style={[
              styles.popupMessage,
              { color: currentTheme.uiColors.secondary }
            ]}>How about adding this slice?</Text>
            <Text allowFontScaling={false} style={[
              styles.suggestionText,
              { 
                color: currentTheme.uiColors.text,
                backgroundColor: currentTheme.uiColors.cardBackground,
              }
            ]}>
              {pendingSuggestion}
            </Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.popupButton, 
                  styles.declineButton,
                  { backgroundColor: '#f59f9f' }
                ]} 
                onPress={onDeclineSuggestion}
              >
                <View style={styles.buttonTextContainer}>
                  <Text allowFontScaling={false} style={styles.declineButtonText}>Nope!</Text>
                  <Text allowFontScaling={false} style={styles.declineButtonIcon}>❌</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.popupButton, 
                  styles.acceptButton,
                  { backgroundColor: currentTheme.uiColors.accent }
                ]} 
                onPress={onAcceptSuggestion}
              >
                <Text allowFontScaling={false} style={[
                  styles.acceptButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}>Add it! ✅</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Activity List Modal */}
      <ActivityListModal
        visible={showListModal}
        onClose={() => setShowListModal(false)}
        activities={activities}
        onDeleteActivity={(activityName: string) => {
          onDeleteActivity(activityName);
          // Keep modal open to allow multiple deletions
        }}
        onAddActivities={onAddActivities}
        onBulkAISuggest={onBulkAISuggest}
        isLoadingBulkAI={isLoadingBulkAI}
        bulkAISuggestions={bulkAISuggestions}
        onAcceptBulkSuggestions={onAcceptBulkSuggestions}
        onClearBulkSuggestions={onClearBulkSuggestions}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // Main card container - simplified for content wrapper pattern
  inputCard: {
    marginVertical: 8, // Matching lastActivityContainer
    marginTop: 5, // Matching lastActivityContainer
    marginBottom: 7, // Matching lastActivityContainer
    padding: 14, // Matching lastActivityContainer (changed from 15)
    borderRadius: 12, // Matching lastActivityContainer
    borderWidth: 2, // Matching lastActivityContainer
    elevation: 2, // Matching lastActivityContainer
    shadowColor: '#000', // Matching lastActivityContainer
    shadowOffset: { width: 0, height: 1 }, // Matching lastActivityContainer
    shadowOpacity: 0.2, // Matching lastActivityContainer
    shadowRadius: 1.41, // Matching lastActivityContainer
    alignItems: 'stretch', // Remove width constraints (research-backed fix)
    justifyContent: 'center', // Matching lastActivityContainer
  },
  // Content container - matching lastActivityContent
  inputContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // Input row with buttons on the right
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 7,
  },
  // Text input - takes most of the space
  textInput: {
    flex: 1,
    minWidth: 60, // Minimum width to ensure it's always usable
    fontSize: 16, // Slightly smaller than lastActivityText (22) but still prominent
    fontFamily: FONTS.jua, // Matching lastActivityText
    textAlign: 'center', // Matching lastActivityText
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: 8, // Reduced from 12 to save space
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    // Platform-specific outline removal for web
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
    }),
  },
  // Right buttons container
  rightButtons: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  // Icon buttons - no background, just the icon
  iconButton: {
    padding: 4, // Reduced from 6 to save space
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24, // Reduced from 28 for better space usage
    minHeight: 24, // Reduced from 28 for better space usage
  },
  iconButtonText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    textAlign: 'center',
  },
  // AI Suggestion popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    width: 'auto',
    minWidth: 280,
    maxWidth: 400,
    marginHorizontal: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  popupButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  declineButton: {
    // backgroundColor: '#f59f9f', // Moved to inline styles
  },
  declineButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  acceptButton: {
    // backgroundColor moved to inline styles for theme support
  },
  acceptButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
  },
  buttonTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  declineButtonIcon: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    marginLeft: 4,
    color: '#fff',
  },
}); 