import { FONTS } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ActivityInputProps {
  onAddActivity: (name: string) => void;
  onSuggestActivity: () => void;
  existingActivities: string[];
  isLoading?: boolean;
  isSuggesting?: boolean;
  pendingSuggestion?: string | null;
  showSuggestionPopup?: boolean;
  onAcceptSuggestion?: () => void;
  onDeclineSuggestion?: () => void;
  onSaveLoad?: () => void;
}

// Maximum character limit for activities
const MAX_ACTIVITY_LENGTH = 20;

export const ActivityInput: React.FC<ActivityInputProps> = ({
  onAddActivity,
  onSuggestActivity,
  existingActivities,
  isLoading = false,
  isSuggesting = false,
  pendingSuggestion,
  showSuggestionPopup,
  onAcceptSuggestion,
  onDeclineSuggestion,
  onSaveLoad,
}) => {
  const [activityName, setActivityName] = useState('');

  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;
  const isNarrowScreen = screenWidth < 360; // Very narrow screens
  const isSmallScreen = screenWidth < 400; // Small screens
  const isExtremelyNarrow = screenWidth < 320; // Extremely narrow screens
  const isMediumScreen = screenWidth < 500; // Medium screens
  
  // Dynamic minWidth based on screen size for better text centering (matching RouletteWheel)
  const getResponsiveMinWidth = () => {
    // Smaller minWidth on narrow screens allows text to center better
    // when content is shorter than the container width
    if (screenWidth < 320) return 260; // Very narrow - smaller minWidth for better centering
    if (screenWidth < 360) return 280; // Narrow
    if (screenWidth < 400) return 300; // Small  
    if (screenWidth < 500) return 330; // Medium
    return 340; // Wide screens - original value
  };
  
  // Responsive width settings
  const containerMinWidth = getResponsiveMinWidth();
  const containerMaxWidth = isSmallScreen ? '95%' : '90%';
  const containerMarginHorizontal = isNarrowScreen ? 8 : 16;
  
  // Adjust padding based on screen width
  const inputPaddingRight = isNarrowScreen ? 120 : isSmallScreen ? 130 : 140;
  const charCounterRight = isNarrowScreen ? 100 : isSmallScreen ? 110 : 120;
  
  // Adjust font size for extremely narrow screens
  const inputFontSize = isExtremelyNarrow ? 14 : 16;

  const handleTextChange = (text: string) => {
    // Limit text input to MAX_ACTIVITY_LENGTH characters
    if (text.length <= MAX_ACTIVITY_LENGTH) {
      setActivityName(text);
    }
  };

  const handleAddActivity = () => {
    const trimmedName = activityName.trim();
    if (!trimmedName) {
      alert('Please enter an activity name');
      return;
    }
    if (existingActivities.includes(trimmedName)) {
      alert('This activity already exists!');
      return;
    }
    onAddActivity(trimmedName);
    setActivityName('');
  };

  // Calculate remaining characters
  const remainingChars = MAX_ACTIVITY_LENGTH - activityName.length;
  const isNearLimit = remainingChars <= 5;

  return (
    <View style={[styles.container, {
      minWidth: containerMinWidth,
      maxWidth: containerMaxWidth,
      marginHorizontal: containerMarginHorizontal,
    }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { paddingRight: inputPaddingRight, fontSize: inputFontSize }]}
          value={activityName}
          onChangeText={handleTextChange}
          placeholder="Type new activity"
          placeholderTextColor="#666"
          onSubmitEditing={handleAddActivity}
          maxLength={MAX_ACTIVITY_LENGTH}
          editable={!isLoading && !isSuggesting}
          allowFontScaling={false}
        />
        {activityName.length > 0 && (
          <Text allowFontScaling={false} style={[
            styles.charCounter, 
            { right: charCounterRight },
            isNearLimit ? styles.charCounterNearLimit : null
          ]}>
            {remainingChars}
          </Text>
        )}
        
        {/* All buttons inside the input container for narrow screens */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.addButton, isLoading && styles.buttonDisabled]} 
            onPress={handleAddActivity}
            disabled={isLoading || isSuggesting}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#94c4f5" />
            ) : (
              <Ionicons name="add-circle" size={32} color="#94c4f5" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.suggestButton, isSuggesting && styles.buttonDisabled]} 
            onPress={onSuggestActivity}
            disabled={isLoading || isSuggesting}
          >
            {isSuggesting ? (
              <ActivityIndicator size="small" color="#f5c09f" />
            ) : (
              <Text allowFontScaling={false} style={styles.suggestButtonText}>✨</Text>
            )}
          </TouchableOpacity>
          
          {onSaveLoad && (
            <TouchableOpacity
              style={styles.saveLoadButton}
              onPress={onSaveLoad}
              disabled={isLoading || isSuggesting}
            >
              <Text allowFontScaling={false} style={styles.saveLoadButtonText}>💾</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* AI Suggestion Popup */}
      <Modal
        visible={showSuggestionPopup || false}
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
            style={styles.popupContainer}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside popup
          >
            <Text allowFontScaling={false} style={styles.popupTitle}>AI Suggestion ✨</Text>
            <Text allowFontScaling={false} style={styles.popupMessage}>How about:</Text>
            <Text allowFontScaling={false} style={styles.suggestedActivityText}>{pendingSuggestion}</Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.declineButton]} 
                onPress={onDeclineSuggestion}
              >
                <Text allowFontScaling={false} style={styles.declineButtonText}>Decline ❌</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.popupButton, styles.acceptButton]} 
                onPress={onAcceptSuggestion}
              >
                <Text allowFontScaling={false} style={styles.acceptButtonText}>Accept ✅</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    width: 'auto',
    marginVertical: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 2,
    borderColor: '#E8F4FC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  input: {
    flex: 1,
    height: 40,
    // fontSize will be set dynamically inline
    fontFamily: FONTS.jua,
    color: '#333',
    // paddingRight will be set dynamically inline
    borderWidth: 0,
    borderColor: 'transparent',
    outline: 'none', // For web compatibility
  },
  charCounter: {
    position: 'absolute',
    // right will be set dynamically inline
    fontSize: 12,
    fontFamily: FONTS.jua,
    color: '#999',
  },
  charCounterNearLimit: {
    color: '#f59f9f', // Light red when getting close to limit
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    gap: 4, // Space between buttons
  },
  suggestButton: {
    padding: 2,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestButtonText: {
    fontSize: 16,
  },
  addButton: {
    padding: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
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
    color: '#4e4370',
  },
  popupMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 10,
    color: '#666',
  },
  suggestedActivityText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#f59f9f',
  },
  declineButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  acceptButton: {
    backgroundColor: '#94c4f5',
  },
  acceptButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  saveLoadButton: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  saveLoadButtonText: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    color: '#94c4f5',
  },
}); 