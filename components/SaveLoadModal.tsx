import { FONTS } from '@/app/_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Activity } from '../utils/colorUtils';

export interface SaveSlot {
  id: string;
  name: string;
  activities: Activity[];
  createdAt: Date;
}

interface SaveLoadModalProps {
  visible: boolean;
  onClose: () => void;
  currentActivities: Activity[];
  onLoadActivities: (activities: Activity[]) => void;
}

const SAVE_SLOTS_KEY = 'SPIN2PICK_SAVE_SLOTS';
const MAX_SAVE_NAME_LENGTH = 15;
const MAX_SLOTS = 5;

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  visible,
  onClose,
  currentActivities,
  onLoadActivities,
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
      const slotsWithDates = savedSlots.map((slot: SaveSlot) => ({
        ...slot,
        createdAt: new Date(slot.createdAt),
      }));
      
      const fullSlots = new Array(MAX_SLOTS).fill(null);
      slotsWithDates.forEach((slot: SaveSlot, index: number) => {
        if (index < MAX_SLOTS) {
          fullSlots[index] = slot;
        }
      });
      setSaveSlots(fullSlots);
    } catch (error) {
      console.error('Error loading save slots:', error);
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
    setSaveName(isOverwrite && slot ? slot.name : '');
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
      const newSlot: SaveSlot = {
        id: Date.now().toString(),
        name: saveName.trim(),
        activities: currentActivities,
        createdAt: new Date(),
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
      title: 'Load Activities',
      message: `Load "${slot.name}"? This will replace your current activities.`,
      onConfirm: () => {
        onLoadActivities(slot.activities);
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
          <View style={styles.slotContent}>
            <View style={styles.slotInfo}>
              <Text allowFontScaling={false} style={[styles.slotName, { color: currentTheme.uiColors.primary }]}>{slot.name}</Text>
              <Text allowFontScaling={false} style={[styles.slotDetails, { color: currentTheme.uiColors.secondary }]}>
                {slot.activities.length} activities • {new Date(slot.createdAt).toLocaleDateString()}
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
                style={[styles.actionButton, styles.overwriteButton, { backgroundColor: '#f5c09f' }]} 
                onPress={() => handleSavePress(index, true)}
              >
                <Text allowFontScaling={false} style={[styles.actionButtonText, { color: '#fff' }]}>✏️ Overwrite</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#f59f9f' }]} 
                onPress={() => handleDeletePress(index)}
              >
                <Text allowFontScaling={false} style={[styles.actionButtonText, { color: '#fff' }]}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderConfirmationModal = () => (
    <Modal visible={confirmationModal.visible} transparent animationType="fade" onRequestClose={() => setConfirmationModal({ ...confirmationModal, visible: false })}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setConfirmationModal({ ...confirmationModal, visible: false })}>
        <TouchableOpacity 
          style={[styles.popupContainer, { 
            width: containerWidth,
            backgroundColor: currentTheme.uiColors.modalBackground,
            borderColor: currentTheme.uiColors.primary,
            borderWidth: 2,
          }]} 
          activeOpacity={1}
        >
          <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>{confirmationModal.title}</Text>
          <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary }]}>{confirmationModal.message}</Text>
          <View style={styles.popupButtons}>
            <TouchableOpacity 
              style={[styles.popupButton, styles.cancelButton, { backgroundColor: '#f59f9f' }]} 
              onPress={() => setConfirmationModal({ ...confirmationModal, visible: false })}
            >
              <Text allowFontScaling={false} style={[styles.popupButtonText, { color: '#fff' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.popupButton, styles.confirmButton, { backgroundColor: currentTheme.uiColors.accent }]} 
              onPress={confirmationModal.onConfirm}
            >
              <Text allowFontScaling={false} style={[styles.popupButtonText, { color: currentTheme.uiColors.buttonText }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const renderSaveInputModal = () => (
    <Modal visible={saveModal.visible} transparent animationType="fade" onRequestClose={() => setSaveModal({ ...saveModal, visible: false })}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSaveModal({ ...saveModal, visible: false })}>
        <TouchableOpacity 
          style={[styles.popupContainer, { 
            width: containerWidth,
            backgroundColor: currentTheme.uiColors.modalBackground,
            borderColor: currentTheme.uiColors.primary,
            borderWidth: 2,
          }]} 
          activeOpacity={1}
        >
          <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>{saveModal.isOverwrite ? '✏️ Overwrite Save' : '💾 Save Activities'}</Text>
          <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary }]}>Enter a name for this save:</Text>
          <TextInput
            style={[styles.saveNameInput, { 
              borderColor: currentTheme.uiColors.primary,
              color: currentTheme.uiColors.text,
              backgroundColor: currentTheme.uiColors.cardBackground,
            }]}
            value={saveName}
            onChangeText={(text) => setSaveName(text.slice(0, MAX_SAVE_NAME_LENGTH))}
            placeholder="My Awesome Activities"
            placeholderTextColor={currentTheme.uiColors.secondary}
            maxLength={MAX_SAVE_NAME_LENGTH}
            autoFocus
            allowFontScaling={false}
          />
          <Text allowFontScaling={false} style={[styles.charCounter, { color: currentTheme.uiColors.secondary }]}>{MAX_SAVE_NAME_LENGTH - saveName.length} characters remaining</Text>
          <View style={styles.popupButtons}>
            <TouchableOpacity 
              style={[styles.popupButton, styles.cancelButton, { backgroundColor: '#f59f9f' }]} 
              onPress={() => setSaveModal({ visible: false, slotIndex: null, isOverwrite: false })}
            >
              <Text allowFontScaling={false} style={[styles.popupButtonText, { color: '#fff' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.popupButton, styles.confirmButton, { backgroundColor: currentTheme.uiColors.accent }]} 
              onPress={handleSaveToSlot} 
              disabled={isLoading || !saveName.trim()}
            >
              {isLoading ? <ActivityIndicator color={currentTheme.uiColors.buttonText} /> : <Text allowFontScaling={false} style={[styles.popupButtonText, { color: currentTheme.uiColors.buttonText }]}>Save</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal visible={successModal.visible} transparent animationType="fade" onRequestClose={() => setSuccessModal({ visible: false, message: '' })}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSuccessModal({ visible: false, message: '' })}>
        <TouchableOpacity 
          style={[styles.popupContainer, { 
            width: containerWidth,
            backgroundColor: currentTheme.uiColors.modalBackground,
            borderColor: currentTheme.uiColors.primary,
            borderWidth: 2,
          }]} 
          activeOpacity={1}
        >
          <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>✅ Success!</Text>
          <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary }]}>{successModal.message}</Text>
          <TouchableOpacity 
            style={[styles.popupButton, styles.confirmButton, { flex: 0, width: '100%', backgroundColor: currentTheme.uiColors.accent }]} 
            onPress={() => setSuccessModal({ visible: false, message: '' })}
          >
            <Text allowFontScaling={false} style={[styles.popupButtonText, { color: currentTheme.uiColors.buttonText }]}>OK</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity 
            style={[styles.modalContainer, { 
              width: containerWidth,
              backgroundColor: currentTheme.backgroundColor,
              borderColor: currentTheme.uiColors.primary,
              borderWidth: 2,
            }]} 
            activeOpacity={1}
          >
            <Text allowFontScaling={false} style={[styles.modalTitle, { color: currentTheme.uiColors.primary }]}>💾 Save & Load</Text>
            <Text allowFontScaling={false} style={[styles.modalSubtitle, { color: currentTheme.uiColors.secondary }]}>Manage your activity sets</Text>
            {isLoading ? (
              <ActivityIndicator size="large" color={currentTheme.uiColors.primary} />
            ) : (
              <ScrollView style={styles.slotsScroll} contentContainerStyle={styles.slotsContainer}>
                {saveSlots.map(renderSlot)}
              </ScrollView>
            )}
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: currentTheme.uiColors.primary }]} 
              onPress={onClose}
            >
              <Text allowFontScaling={false} style={[styles.closeButtonText, { color: currentTheme.uiColors.buttonText }]}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {renderConfirmationModal()}
      {renderSaveInputModal()}
      {renderSuccessModal()}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: FONTS.jua,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    marginBottom: 16,
  },
  slotsScroll: {
    width: '100%',
  },
  slotsContainer: {
    gap: 12,
    paddingBottom: 12,
  },
  slotContainer: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
  },
  emptySlot: {
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  filledSlot: {
  },
  slotContent: {
    gap: 8,
  },
  slotInfo: {
    alignItems: 'flex-start',
  },
  slotName: {
    fontSize: 18,
    fontFamily: FONTS.jua,
  },
  slotDetails: {
    fontSize: 12,
    fontFamily: FONTS.jua,
  },
  slotSubtext: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    marginBottom: 4,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
  },
  saveButton: {
    paddingHorizontal: 24,
  },
  loadButton: {
  },
  overwriteButton: {
  },
  deleteButton: {
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
  },
  popupContainer: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
  },
  popupMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    textAlign: 'center',
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  popupButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  popupButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
  },
  cancelButton: {
  },
  confirmButton: {
  },
  saveNameInput: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.jua,
    textAlign: 'center',
    width: '100%',
  },
  charCounter: {
    fontSize: 12,
    fontFamily: FONTS.jua,
  },
});
