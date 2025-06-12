import { FONTS } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
}) => {
  const [activityName, setActivityName] = useState('');

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
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={activityName}
          onChangeText={handleTextChange}
          placeholder="Enter new activity..."
          placeholderTextColor="#666"
          onSubmitEditing={handleAddActivity}
          maxLength={MAX_ACTIVITY_LENGTH}
          editable={!isLoading && !isSuggesting}
        />
        {activityName.length > 0 && (
          <Text style={[
            styles.charCounter, 
            isNearLimit ? styles.charCounterNearLimit : null
          ]}>
            {remainingChars}
          </Text>
        )}
      </View>
      
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
            <Text style={styles.suggestButtonText}>✨</Text>
          )}
        </TouchableOpacity>
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
            <Text style={styles.popupTitle}>AI Suggestion ✨</Text>
            <Text style={styles.popupMessage}>How about:</Text>
            <Text style={styles.suggestedActivityText}>{pendingSuggestion}</Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.declineButton]} 
                onPress={onDeclineSuggestion}
              >
                <Text style={styles.declineButtonText}>Decline ❌</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.popupButton, styles.acceptButton]} 
                onPress={onAcceptSuggestion}
              >
                <Text style={styles.acceptButtonText}>Accept ✅</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    width: 'auto',
    minWidth: 340,
    maxWidth: '90%',
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 2,
    borderColor: '#E8F4FC',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#333',
    paddingRight: 30, // Make room for the character counter
  },
  charCounter: {
    position: 'absolute',
    right: 5,
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
    marginLeft: 8,
  },
  suggestButton: {
    padding: 4,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestButtonText: {
    fontSize: 18,
  },
  addButton: {
    marginRight: 8,
    padding: 4,
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
}); 