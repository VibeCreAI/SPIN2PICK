import { FONTS } from '@/app/_layout';
import { useTheme } from '@/hooks/useTheme';
import { TitleCategory } from '@/utils/titleUtils';
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomWheelCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateWheel: (title: string, description: string, category: TitleCategory) => void;
}

export const CustomWheelCreationModal: React.FC<CustomWheelCreationModalProps> = ({
  visible,
  onClose,
  onCreateWheel
}) => {
  const { currentTheme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // All custom wheels are automatically categorized as "Custom"

  const handleCreate = () => {
    if (title.trim().length < 3) {
      return; // Basic validation - title too short
    }
    
    if (description.trim().length < 10) {
      return; // Basic validation - description too short
    }

    onCreateWheel(title.trim(), description.trim(), TitleCategory.CUSTOM);
    
    // Reset form
    setTitle('');
    setDescription('');
    onClose();
  };

  const isValidForm = title.trim().length >= 3 && 
                     title.trim().length <= 50 && 
                     description.trim().length >= 10 && 
                     description.trim().length <= 200;

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
          }
        ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.uiColors.secondary + '40' }]}>
            <Text style={[styles.headerTitle, { color: currentTheme.uiColors.primary }]}>
              🎨 Create Custom Wheel
            </Text>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Instructions */}
            <Text style={[styles.instructions, { color: currentTheme.uiColors.secondary }]}>
              Create your own personalized ⭐ Custom wheel! AI will generate relevant suggestions based on your title and description.
            </Text>

            {/* Title Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: currentTheme.uiColors.text }]}>
                Wheel Title *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: currentTheme.uiColors.text,
                    backgroundColor: currentTheme.uiColors.cardBackground,
                    borderColor: currentTheme.uiColors.primary,
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Weekend Family Activities"
                placeholderTextColor={currentTheme.uiColors.secondary}
                maxLength={50}
                allowFontScaling={false}
              />
              <Text style={[styles.charCount, { color: currentTheme.uiColors.secondary }]}>
                {title.length}/50 characters
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: currentTheme.uiColors.text }]}>
                Description *
              </Text>
              <TextInput
                style={[
                  styles.textAreaInput,
                  {
                    color: currentTheme.uiColors.text,
                    backgroundColor: currentTheme.uiColors.cardBackground,
                    borderColor: currentTheme.uiColors.primary,
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what this wheel is for. This helps AI generate better suggestions. e.g., Fun indoor and outdoor activities for families with kids aged 5-12"
                placeholderTextColor={currentTheme.uiColors.secondary}
                maxLength={200}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                allowFontScaling={false}
              />
              <Text style={[styles.charCount, { color: currentTheme.uiColors.secondary }]}>
                {description.length}/200 characters
              </Text>
            </View>

            {/* Category Info */}
            <View style={[styles.categoryInfoSection, { backgroundColor: currentTheme.uiColors.cardBackground }]}>
              <Text style={[styles.categoryInfoTitle, { color: currentTheme.uiColors.primary }]}>
                ⭐ Custom Wheel
              </Text>
              <Text style={[styles.categoryInfoText, { color: currentTheme.uiColors.secondary }]}>
                All custom wheels are automatically categorized as "Custom" and will appear in the Custom section.
              </Text>
            </View>

            {/* Preview Section */}
            {title.trim().length > 0 && (
              <View style={[styles.previewSection, { backgroundColor: currentTheme.uiColors.cardBackground }]}>
                <Text style={[styles.previewTitle, { color: currentTheme.uiColors.primary }]}>
                  Preview
                </Text>
                <Text style={[styles.previewWheelTitle, { color: currentTheme.uiColors.text }]}>
                  ⭐ {title}
                </Text>
                <Text style={[styles.previewDescription, { color: currentTheme.uiColors.secondary }]}>
                  {description || 'No description provided'}
                </Text>
                <Text style={[styles.previewCategory, { color: currentTheme.uiColors.secondary }]}>
                  Category: ⭐ Custom
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: currentTheme.uiColors.secondary + '40' }]}>
            <TouchableOpacity 
              style={[
                styles.cancelButton,
                { 
                  backgroundColor: currentTheme.uiColors.secondary,
                }
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: currentTheme.uiColors.buttonText }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.createButton,
                { 
                  backgroundColor: isValidForm 
                    ? currentTheme.uiColors.accent 
                    : currentTheme.uiColors.secondary + '60',
                  borderColor: currentTheme.uiColors.primary,
                }
              ]}
              onPress={handleCreate}
              disabled={!isValidForm}
            >
              <Text style={[
                styles.createButtonText, 
                { 
                  color: isValidForm 
                    ? currentTheme.uiColors.buttonText 
                    : currentTheme.uiColors.secondary 
                }
              ]}>
                Create Wheel ✨
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
    maxHeight: '90%',
    minHeight: 600,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  instructions: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.nunito,
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
    }),
  },
  textAreaInput: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.nunito,
    height: 100,
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
    }),
  },
  charCount: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
    textAlign: 'right',
    marginTop: 4,
  },
  categoryContainer: {
    maxHeight: 200,
  },
  categoryOption: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
  },
  categoryInfoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryInfoTitle: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryInfoText: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    lineHeight: 18,
  },
  previewSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewWheelTitle: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    marginBottom: 4,
    lineHeight: 18,
  },
  previewCategory: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  createButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
});