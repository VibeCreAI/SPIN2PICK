import { FONTS } from '@/app/_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Keyboard, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Activity, CustomThemeData } from '../utils/colorUtils';

export interface SaveSlot {
  id: string;
  name: string;
  title: string;
  activities: Activity[];
  createdAt: Date;
  // Theme information
  themeId: string;
  customTheme?: CustomThemeData;
  version?: number; // For migration support (1 = old format, 2 = new format with theme)
}

interface ThemeInfo {
  themeId: string;
  customTheme?: CustomThemeData;
}

interface SaveLoadModalProps {
  visible: boolean;
  onClose: () => void;
  currentActivities: Activity[];
  currentTitle: string;
  onLoadActivities: (activities: Activity[], title: string, themeInfo?: ThemeInfo) => void;
  currentThemeId: string;
  getCurrentCustomThemeData: () => Promise<CustomThemeData | undefined>;
}

const SAVE_SLOTS_KEY = 'SPIN2PICK_SAVE_SLOTS';
const MAX_SAVE_NAME_LENGTH = 15;
const MAX_SLOTS = 10;

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  visible,
  onClose,
  currentActivities,
  currentTitle,
  onLoadActivities,
  currentThemeId,
  getCurrentCustomThemeData,
}) => {
  const { currentTheme } = useTheme();
  const [saveSlots, setSaveSlots] = useState<(SaveSlot | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);



  // State for the save input modal
  const [saveModal, setSaveModal] = useState<{ visible: boolean; slotIndex: number | null; isOverwrite: boolean }>({ visible: false, slotIndex: null, isOverwrite: false });
  const [saveName, setSaveName] = useState('');

  // State for the confirmation modal
  const [confirmationModal, setConfirmationModal] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void; }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // State for the success modal
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  // Get screen width for responsive design
    const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500; // Maximum width for the modal
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  useEffect(() => {
    if (visible) {
      loadSaveSlots();
    }
  }, [visible]);

  const loadSaveSlots = async () => {
    setIsLoading(true);
    try {
      const savedSlotsJSON = await AsyncStorage.getItem(SAVE_SLOTS_KEY);
      const savedSlots = savedSlotsJSON ? JSON.parse(savedSlotsJSON) : [];
      const slotsWithDates = savedSlots.map((slot: any) => {
        // Migration logic: add theme fields to old saves
        const migratedSlot: SaveSlot = {
          ...slot,
          createdAt: new Date(slot.createdAt),
          // Add default theme info for old saves (version 1 or missing version)
          themeId: slot.themeId || 'pastel-dream',
          customTheme: slot.customTheme || undefined,
          version: slot.version || 1, // Mark as old format
        };
        return migratedSlot;
      });
      
      const fullSlots = new Array(MAX_SLOTS).fill(null);
      slotsWithDates.forEach((slot: SaveSlot, index: number) => {
        if (index < MAX_SLOTS) {
          fullSlots[index] = slot;
        }
      });
      setSaveSlots(fullSlots);
    } catch (error) {
      console.error('❌ Error loading save slots:', error);
      setSaveSlots(new Array(MAX_SLOTS).fill(null));
    } finally {
      setIsLoading(false);
    }
  };

  const saveSaveSlots = async (slots: (SaveSlot | null)[]) => {
    try {
      const nonNullSlots = slots.filter(s => s !== null);
      await AsyncStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(nonNullSlots));
    } catch (error) {
      console.error('Error saving save slots:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const handleSavePress = (slotIndex: number, isOverwrite = false) => {
    const slot = saveSlots[slotIndex];
    setSaveName(isOverwrite && slot ? slot.name : currentTitle);
    setSaveModal({ visible: true, slotIndex, isOverwrite });
  };

  const handleSaveToSlot = async () => {
    if (!saveName.trim()) {
      Alert.alert('Error', 'Please enter a name for your save.');
      return;
    }
    if (saveModal.slotIndex === null) return;

    setIsLoading(true);
    try {
      // Get current custom theme data if applicable
      const customThemeData = await getCurrentCustomThemeData();
      
      const newSlot: SaveSlot = {
        id: Date.now().toString(),
        name: saveName.trim(),
        title: currentTitle,
        activities: currentActivities,
        createdAt: new Date(),
        themeId: currentThemeId,
        customTheme: customThemeData,
        version: 2, // New format with theme support
      };

      const updatedSlots = [...saveSlots];
      updatedSlots[saveModal.slotIndex] = newSlot;
      
      await saveSaveSlots(updatedSlots);
      setSaveSlots(updatedSlots);
      
      setSaveModal({ visible: false, slotIndex: null, isOverwrite: false });
      setSaveName('');
      
      
    } catch (error) {
      console.error('Error saving to slot:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPress = (slotIndex: number) => {
    const slot = saveSlots[slotIndex];
    if (!slot) return;
    setConfirmationModal({
      visible: true,
      title: 'Load Wheel',
      message: `Load "${slot.name}"? This will replace your current wheel and theme.`,
      onConfirm: () => {
        const themeInfo: ThemeInfo | undefined = slot.themeId ? {
          themeId: slot.themeId,
          customTheme: slot.customTheme
        } : undefined;
        
        onLoadActivities(slot.activities, slot.title, themeInfo);
        setConfirmationModal({ visible: false, title: '', message: '', onConfirm: () => {} });
        onClose();
      },
    });
  };

  const handleDeletePress = (slotIndex: number) => {
    const slot = saveSlots[slotIndex];
    if (!slot) return;
    setConfirmationModal({
      visible: true,
      title: 'Delete Save',
      message: `Are you sure you want to delete "${slot.name}"?`,
      onConfirm: async () => {
        const updatedSlots = [...saveSlots];
        updatedSlots[slotIndex] = null;
        await saveSaveSlots(updatedSlots);
        setSaveSlots(updatedSlots);
        setConfirmationModal({ visible: false, title: '', message: '', onConfirm: () => {} });
        
      },
    });
  };

  const renderSlot = (slot: SaveSlot | null, index: number) => {
    const isEmpty = !slot;

    return (
      <View key={index} style={[
        styles.slotContainer, 
        isEmpty ? styles.emptySlot : styles.filledSlot,
        {
          backgroundColor: currentTheme.uiColors.cardBackground,
          borderColor: isEmpty ? currentTheme.uiColors.secondary : currentTheme.uiColors.primary,
        }
      ]}>
        {isEmpty ? (
          <View style={styles.slotContent}>
            <Text allowFontScaling={false} style={[styles.slotSubtext, { color: currentTheme.uiColors.secondary }]}>Slot {index + 1} - Empty</Text>
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton, { backgroundColor: currentTheme.uiColors.accent }]} 
              onPress={() => handleSavePress(index)}
            >
              <Text allowFontScaling={false} style={[styles.actionButtonText, { color: currentTheme.uiColors.buttonText }]}>💾 Save Here</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.slotContentVertical}>
            <View style={styles.slotInfoVertical}>
              <Text allowFontScaling={false} style={[styles.slotName, { color: currentTheme.uiColors.primary }]}>{slot.name}</Text>
              <Text allowFontScaling={false} style={[styles.slotDetails, { color: currentTheme.uiColors.secondary }]}>
                {`"${slot.title || slot.name}"`} • {slot.activities.length} slices • {new Date(slot.createdAt).toLocaleDateString()}
                {slot.themeId && (
                  `\n🎨 Theme: ${slot.customTheme ? slot.customTheme.name : slot.themeId}`
                )}
              </Text>
            </View>
            <View style={styles.slotActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.loadButton, { backgroundColor: currentTheme.uiColors.accent }]} 
                onPress={() => handleLoadPress(index)}
              >
                <Text allowFontScaling={false} style={[styles.actionButtonText, { color: currentTheme.uiColors.buttonText }]}>📂 Load</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.overwriteButton, { backgroundColor: '#FF9800' }]} 
                onPress={() => handleSavePress(index, true)}
              >
                <Text allowFontScaling={false} style={[styles.actionButtonText, { color: currentTheme.uiColors.buttonText }]}>✏️ Overwrite</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#F44336' }]} 
                onPress={() => handleDeletePress(index)}
              >
                <Text allowFontScaling={false} style={[styles.actionButtonText, { color: currentTheme.uiColors.buttonText }]}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderConfirmationModal = () => (
    <Modal visible={confirmationModal.visible} transparent animationType="fade" onRequestClose={() => setConfirmationModal({ ...confirmationModal, visible: false })}>
      <View style={styles.confirmationOverlay}>
        <View style={[styles.confirmationContainer, { backgroundColor: currentTheme.uiColors.modalBackground }]}>
          <Text allowFontScaling={false} style={[styles.confirmationTitle, { color: currentTheme.uiColors.text }]}>{confirmationModal.title}</Text>
          <Text allowFontScaling={false} style={[styles.confirmationMessage, { color: currentTheme.uiColors.secondary }]}>{confirmationModal.message}</Text>
          <View style={styles.confirmationActions}>
            <TouchableOpacity 
              style={[styles.confirmationButton, { backgroundColor: currentTheme.uiColors.secondary }]} 
              onPress={() => setConfirmationModal({ ...confirmationModal, visible: false })}
            >
              <Text allowFontScaling={false} style={[styles.confirmationButtonText, { color: currentTheme.uiColors.buttonText }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmationButton, { backgroundColor: currentTheme.uiColors.primary }]} 
              onPress={confirmationModal.onConfirm}
            >
              <Text allowFontScaling={false} style={[styles.confirmationButtonText, { color: currentTheme.uiColors.buttonText }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSaveInputModal = () => (
    <Modal visible={saveModal.visible} transparent animationType="fade" onRequestClose={() => setSaveModal({ visible: false, slotIndex: null, isOverwrite: false })}>
      <View style={styles.confirmationOverlay}>
        <View style={[styles.confirmationContainer, { backgroundColor: currentTheme.uiColors.modalBackground }]}>
          <Text allowFontScaling={false} style={[styles.confirmationTitle, { color: currentTheme.uiColors.text }]}>
            {saveModal.isOverwrite ? 'Overwrite Save' : 'Save Wheel'}
          </Text>
          <TextInput
            style={[styles.saveInput, { 
              color: currentTheme.uiColors.text, 
              borderColor: currentTheme.uiColors.primary,
              backgroundColor: currentTheme.uiColors.cardBackground,
            }]}
            placeholder="Enter a name for your wheel"
            placeholderTextColor={currentTheme.uiColors.secondary}
            value={saveName}
            onChangeText={setSaveName}
            maxLength={MAX_SAVE_NAME_LENGTH}
          />
          <Text style={[styles.charCount, { color: currentTheme.uiColors.secondary }]}>
            {MAX_SAVE_NAME_LENGTH - saveName.length} characters remaining
          </Text>
          <View style={styles.confirmationActions}>
            <TouchableOpacity 
              style={[styles.confirmationButton, { backgroundColor: currentTheme.uiColors.secondary }]} 
              onPress={() => setSaveModal({ visible: false, slotIndex: null, isOverwrite: false })}
            >
              <Text allowFontScaling={false} style={[styles.confirmationButtonText, { color: currentTheme.uiColors.buttonText }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmationButton, { backgroundColor: currentTheme.uiColors.accent }]} 
              onPress={handleSaveToSlot} 
              disabled={isLoading || !saveName.trim()}
            >
              {isLoading ? <ActivityIndicator color={currentTheme.uiColors.buttonText} /> : <Text allowFontScaling={false} style={[styles.confirmationButtonText, { color: currentTheme.uiColors.buttonText }]}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal visible={successModal.visible} transparent animationType="fade" onRequestClose={() => setSuccessModal({ visible: false, message: '' })}>
      <View style={styles.successOverlay}>
        <View style={[styles.successContainer, { backgroundColor: currentTheme.uiColors.modalBackground }]}>
          <Text allowFontScaling={false} style={[styles.successTitle, { color: currentTheme.uiColors.accent }]}>Success!</Text>
          <Text allowFontScaling={false} style={[styles.successMessage, { color: currentTheme.uiColors.text }]}>{successModal.message}</Text>
          <TouchableOpacity 
            style={[styles.successButton, { backgroundColor: currentTheme.uiColors.accent }]} 
            onPress={() => setSuccessModal({ visible: false, message: '' })}
          >
            <Text allowFontScaling={false} style={[styles.successButtonText, { color: currentTheme.uiColors.buttonText }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.uiColors.modalBackground, width: containerWidth }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.uiColors.secondary }]}>
            <Text allowFontScaling={false} style={[styles.title, { color: currentTheme.uiColors.text }]}>Save & Load</Text>
          </View>

          {/* Content Container with proper scroll handling */}
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              bounces={Platform.OS === 'ios'}
              alwaysBounceVertical={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
              onScrollBeginDrag={() => Keyboard.dismiss()}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator 
                    size="large" 
                    color={currentTheme.uiColors.accent} 
                  />
                  <Text allowFontScaling={false} style={[styles.loadingText, { color: currentTheme.uiColors.text }]}>
                    Loading saves...
                  </Text>
                </View>
              ) : (
                <>
                  <Text allowFontScaling={false} style={[styles.subtitle, { color: currentTheme.uiColors.text }]}>
                    Save and load your wheel. You can have up to {MAX_SLOTS} saves.
                  </Text>
                  
                  {/* Render save slots */}
                  {saveSlots.map((slot, index) => renderSlot(slot, index))}
                  
                  {/* Instructions */}
                  <View style={[styles.instructionsContainer, { backgroundColor: currentTheme.uiColors.cardBackground, borderColor: currentTheme.uiColors.secondary }]}>
                    <Text allowFontScaling={false} style={[styles.instructionsTitle, { color: currentTheme.uiColors.text }]}>Instructions:</Text>
                    <Text allowFontScaling={false} style={[styles.instructionsText, { color: currentTheme.uiColors.secondary }]}>
                      • Tap &quot;Save&quot; to save your current wheel to an empty slot{'\n'}
                      • Tap &quot;Load&quot; to replace your current wheel with saved one{'\n'}
                      • Tap &quot;Overwrite&quot; to replace an existing save{'\n'}
                      • Tap &quot;Delete&quot; to remove a saved wheel
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.doneButton,
                { 
                  backgroundColor: currentTheme.uiColors.accent,
                  borderColor: currentTheme.uiColors.primary,
                }
              ]}
              onPress={onClose}
            >
              <Text allowFontScaling={false} style={[
                styles.doneButtonText,
                { color: currentTheme.uiColors.buttonText }
              ]}>
                Done ✨
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Render modals */}
      {renderSaveInputModal()}
      {renderConfirmationModal()}
      {renderSuccessModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    minHeight: 600,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  doneButton: {
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
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 400,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 15,
    minHeight: 400,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: FONTS.nunito,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: FONTS.nunito,
  },
  slotContainer: {
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
  },
  emptySlot: {
    borderStyle: 'dashed',
  },
  filledSlot: {
    borderStyle: 'solid',
  },
  slotContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotContentVertical: {
    flexDirection: 'column',
    gap: 12,
  },
  slotInfo: {
    flex: 1,
    marginRight: 10,
  },
  slotInfoVertical: {
    marginBottom: 0,
  },
  slotName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: FONTS.nunito,
  },
  slotDetails: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
  },
  slotSubtext: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadButton: {
    // Themed color applied dynamically
  },
  overwriteButton: {
    // Themed color applied dynamically  
  },
  deleteButton: {
    // Themed color applied dynamically
  },
  actionButtonText: {
    // Color applied dynamically based on theme
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: FONTS.nunito,
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: FONTS.nunito,
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: FONTS.nunito,
  },
  confirmationMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONTS.nunito,
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmationButtonText: {
    // Color applied dynamically based on theme
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    // Color applied dynamically based on theme
    fontFamily: FONTS.nunito,
  },
  successMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONTS.nunito,
  },
  successButton: {
    // Background color applied dynamically based on theme
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButtonText: {
    // Color applied dynamically based on theme
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  saveInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: FONTS.nunito,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'center',
  },
});
