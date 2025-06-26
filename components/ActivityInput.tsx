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
}) => {
  const { currentTheme } = useTheme();
  const [inputText, setInputText] = useState('');

  // Get screen dimensions for responsive design
  const screenData = Dimensions.get('window');
  
  // Responsive width settings (matching RouletteWheel)
  const screenWidth = screenData.width;
  const isNarrowScreen = screenWidth < 360; // Very narrow screens
  const isSmallScreen = screenWidth < 400; // Small screens
  const isMediumScreen = screenWidth < 500; // Medium screens
  
  // Dynamic minWidth based on screen size for better text centering (matching RouletteWheel)
  const getResponsiveMinWidth = () => {
    // Smaller minWidth on narrow screens allows text to center better
    // when content is shorter than the container width
    if (screenWidth < 320) return 260; // Very narrow - smaller minWidth for better centering
    if (screenWidth < 360) return 280; // Narrow
    if (screenWidth < 400) return 300; // Small  
    if (screenWidth < 500) return 340; // Medium
    return 340; // Wide screens - original value
  };
  
  const containerMinWidth = getResponsiveMinWidth();
  const containerMaxWidth = isSmallScreen ? '95%' : '90%';
  const containerMarginHorizontal = isNarrowScreen ? 8 : 16;

  const handleSubmit = useCallback(() => {
    const trimmedText = inputText.trim();
    if (trimmedText && !isLoading) {
      // Check for duplicates (case-insensitive)
      const isDuplicate = existingActivities.some(
        activity => activity.toLowerCase() === trimmedText.toLowerCase()
      );
      
      if (isDuplicate) {
        alert('This activity already exists!');
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

  return (
    <ThemedView lightColor="transparent" darkColor="transparent" style={styles.container}>
      {/* Main Input Card - matching lastActivityContainer styling */}
      <ThemedView 
        lightColor={currentTheme.uiColors.cardBackground}
        darkColor={currentTheme.uiColors.cardBackground}
        style={[
          styles.inputCard, 
          {
            minWidth: containerMinWidth,
            maxWidth: containerMaxWidth,
            marginHorizontal: containerMarginHorizontal,
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
            style={styles.inputRow}
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
              placeholder="Enter new activity..."
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
              style={styles.rightButtons}
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
            ]}>How about this activity?</Text>
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
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8, // Matching RouletteWheel spacing
    marginBottom: 7, // Matching RouletteWheel spacing
    width: '100%',
  },
  // Main card container - matching lastActivityContainer styling exactly
  inputCard: {
    alignSelf: 'center', // Center the container (matching lastActivityContainer)
    width: 'auto', // Let content determine width (matching lastActivityContainer)
    marginVertical: 8, // Matching lastActivityContainer
    marginTop: 5, // Matching lastActivityContainer
    marginBottom: 7, // Matching lastActivityContainer
    padding: 16, // Matching lastActivityContainer (changed from 15)
    borderRadius: 12, // Matching lastActivityContainer
    borderWidth: 2, // Matching lastActivityContainer
    elevation: 2, // Matching lastActivityContainer
    shadowColor: '#000', // Matching lastActivityContainer
    shadowOffset: { width: 0, height: 1 }, // Matching lastActivityContainer
    shadowOpacity: 0.2, // Matching lastActivityContainer
    shadowRadius: 1.41, // Matching lastActivityContainer
    alignItems: 'center', // Matching lastActivityContainer
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
    gap: 8,
  },
  // Text input - takes most of the space
  textInput: {
    flex: 1,
    fontSize: 18, // Slightly smaller than lastActivityText (22) but still prominent
    fontFamily: FONTS.jua, // Matching lastActivityText
    textAlign: 'center', // Matching lastActivityText
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: 12,
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
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
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