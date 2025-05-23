import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ActivityInputProps {
  onAddActivity: (name: string) => void;
  existingActivities: string[];
  isLoading?: boolean;
}

// Maximum character limit for activities
const MAX_ACTIVITY_LENGTH = 20;

export const ActivityInput: React.FC<ActivityInputProps> = ({
  onAddActivity,
  existingActivities,
  isLoading = false,
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
          editable={!isLoading}
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
      <TouchableOpacity 
        style={[styles.addButton, isLoading && styles.addButtonDisabled]} 
        onPress={handleAddActivity}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#94c4f5" />
        ) : (
          <Ionicons name="add-circle" size={32} color="#94c4f5" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
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
    height: 36,
    fontSize: 15,
    fontFamily: 'Nunito',
    color: '#333',
    paddingRight: 30, // Make room for the character counter
  },
  charCounter: {
    position: 'absolute',
    right: 5,
    fontSize: 11,
    fontFamily: 'Nunito',
    color: '#999',
  },
  charCounterNearLimit: {
    color: '#f59f9f', // Light red when getting close to limit
  },
  addButton: {
    marginLeft: 8,
    padding: 4,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
}); 