import { FONTS } from '@/app/_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [pendingLoadSlot, setPendingLoadSlot] = useState<SaveSlot | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load save slots when modal opens
  useEffect(() => {
    if (visible) {
      loadSaveSlots();
    }
  }, [visible]);

  const loadSaveSlots = async () => {
    try {
      const savedSlots = await AsyncStorage.getItem(SAVE_SLOTS_KEY);
      if (savedSlots) {
        const parsedSlots: SaveSlot[] = JSON.parse(savedSlots);
        // Convert date strings back to Date objects
        const slotsWithDates = parsedSlots.map(slot => ({
          ...slot,
          createdAt: new Date(slot.createdAt)
        }));
        setSaveSlots(slotsWithDates);
      } else {
        setSaveSlots([]);
      }
    } catch (error) {
      console.error('Error loading save slots:', error);
      setSaveSlots([]);
    }
  };

  const saveSaveSlots = async (slots: SaveSlot[]) => {
    try {
      await AsyncStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
    } catch (error) {
      console.error('Error saving save slots:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const handleSlotPress = (index: number) => {
    const slot = saveSlots[index];
    if (slot) {
      // Slot has saved data - show custom load confirmation modal
      setPendingLoadSlot(slot);
    } else {
      // Empty slot - start save process
      setSelectedSlotIndex(index);
      setShowSaveInput(true);
      setSaveName('');
    }
  };

  const handleSaveToSlot = async () => {
    if (!saveName.trim()) {
      Alert.alert('Error', 'Please enter a name for your save.');
      return;
    }

    if (selectedSlotIndex === null) return;

    setIsLoading(true);
    try {
      const newSlot: SaveSlot = {
        id: Date.now().toString(),
        name: saveName.trim(),
        activities: currentActivities,
        createdAt: new Date(),
      };

      const updatedSlots = [...saveSlots];
      updatedSlots[selectedSlotIndex] = newSlot;
      
      await saveSaveSlots(updatedSlots);
      setSaveSlots(updatedSlots);
      
      setShowSaveInput(false);
      setSelectedSlotIndex(null);
      setSaveName('');
      
      setSuccessMessage(`Activities saved as "${newSlot.name}"!`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving to slot:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLoadSlot = () => {
    if (pendingLoadSlot) {
      onLoadActivities(pendingLoadSlot.activities);
      setPendingLoadSlot(null);
      onClose();
      // Optionally show a success message (could use a toast/snackbar if desired)
    }
  };

  const handleCancelLoadSlot = () => {
    setPendingLoadSlot(null);
  };

  const handleDeleteSlot = (index: number) => {
    setSlotToDelete(index);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteSlot = async () => {
    if (slotToDelete === null) return;

    try {
      const updatedSlots = [...saveSlots];
      updatedSlots[slotToDelete] = null as any;
      
      // Clean up the array by removing null entries and resizing
      const cleanedSlots = new Array(MAX_SLOTS).fill(null);
      let writeIndex = 0;
      
      for (const slot of updatedSlots) {
        if (slot && writeIndex < MAX_SLOTS) {
          cleanedSlots[writeIndex] = slot;
          writeIndex++;
        }
      }
      
      await saveSaveSlots(cleanedSlots.filter(slot => slot !== null));
      setSaveSlots(cleanedSlots.filter(slot => slot !== null));
      
      setShowDeleteConfirmation(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error('Error deleting slot:', error);
      Alert.alert('Error', 'Failed to delete save. Please try again.');
    }
  };

  const renderSlot = (index: number) => {
    const slot = saveSlots[index];
    const isEmpty = !slot;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.slotContainer, isEmpty ? styles.emptySlot : styles.filledSlot]}
        onPress={() => handleSlotPress(index)}
      >
        <View style={styles.slotContent}>
          {isEmpty ? (
            <>
              <Text style={styles.slotText}>💾 SAVE</Text>
              <Text style={styles.slotSubtext}>Slot {index + 1} - Empty</Text>
            </>
          ) : (
            <>
              <View style={styles.slotHeader}>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotName}>{slot.name}</Text>
                  <Text style={styles.slotDetails}>
                    {slot.activities.length} activities • {slot.createdAt.toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteSlot(index);
                  }}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.loadText}>Tap to load</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Main Save/Load Modal */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside
          >
            <Text style={styles.modalTitle}>💾 Save & Load</Text>
            <Text style={styles.modalSubtitle}>Choose a slot to save or load activities</Text>
            
            <ScrollView
              style={styles.slotsScroll}
              contentContainerStyle={styles.slotsContainer}
              showsVerticalScrollIndicator={true}
            >
              {Array.from({ length: MAX_SLOTS }, (_, index) => renderSlot(index))}
            </ScrollView>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Load Confirmation Modal */}
      <Modal
        visible={!!pendingLoadSlot}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLoadSlot}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelLoadSlot}
        >
          <TouchableOpacity
            style={styles.saveInputContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.saveInputTitle}>Load Activities</Text>
            <Text style={styles.saveInputSubtitle}>
              {pendingLoadSlot ? `Load "${pendingLoadSlot.name}"? This will replace your current activities.` : ''}
            </Text>
            <View style={styles.saveInputButtons}>
              <TouchableOpacity
                style={[styles.saveInputButton, styles.cancelSaveButton]}
                onPress={handleCancelLoadSlot}
              >
                <Text style={styles.cancelSaveButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveInputButton, styles.confirmSaveButton]}
                onPress={handleConfirmLoadSlot}
              >
                <Text style={styles.confirmSaveButtonText}>Load</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuccessModal(false)}
        >
          <TouchableOpacity
            style={styles.saveInputContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.saveInputTitle}>Success</Text>
            <Text style={styles.saveInputSubtitle}>{successMessage}</Text>
            <View style={styles.saveInputButtons}>
              <TouchableOpacity
                style={[styles.saveInputButton, styles.confirmSaveButton]}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.confirmSaveButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Save Name Input Modal */}
      <Modal
        visible={showSaveInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveInput(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSaveInput(false)}
        >
          <TouchableOpacity
            style={styles.saveInputContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.saveInputTitle}>💾 Save Activities</Text>
            <Text style={styles.saveInputSubtitle}>Enter a name for this save:</Text>
            
            <TextInput
              style={styles.saveNameInput}
              value={saveName}
              onChangeText={(text) => {
                if (text.length <= MAX_SAVE_NAME_LENGTH) {
                  setSaveName(text);
                }
              }}
              placeholder="My Activities"
              placeholderTextColor="#666"
              maxLength={MAX_SAVE_NAME_LENGTH}
              autoFocus={true}
            />
            
            <Text style={styles.charCounter}>
              {MAX_SAVE_NAME_LENGTH - saveName.length} characters left
            </Text>
            
            <View style={styles.saveInputButtons}>
              <TouchableOpacity
                style={[styles.saveInputButton, styles.cancelSaveButton]}
                onPress={() => setShowSaveInput(false)}
              >
                <Text style={styles.cancelSaveButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveInputButton, styles.confirmSaveButton]}
                onPress={handleSaveToSlot}
                disabled={isLoading || !saveName.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmSaveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteConfirmation(false)}
        >
          <TouchableOpacity
            style={styles.deleteConfirmContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.deleteConfirmTitle}>Delete Save 🗑️</Text>
            <Text style={styles.deleteConfirmMessage}>
              Are you sure you want to delete this save?
            </Text>
            {slotToDelete !== null && saveSlots[slotToDelete] && (
              <Text style={styles.deleteConfirmSaveName}>
                "{saveSlots[slotToDelete].name}"
              </Text>
            )}
            
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.cancelDeleteButton]}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <Text style={styles.cancelDeleteButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.confirmDeleteButton]}
                onPress={confirmDeleteSlot}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    minHeight: 600,
    maxHeight: '80%',
    flexShrink: 0,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: FONTS.jua,
    color: '#4e4370',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  slotsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  slotContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  emptySlot: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  filledSlot: {
    backgroundColor: '#fff',
    borderColor: '#94c4f5',
  },
  slotContent: {
    alignItems: 'center',
  },
  slotText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    color: '#4e4370',
    marginBottom: 4,
  },
  slotSubtext: {
    fontSize: 12,
    fontFamily: FONTS.jua,
    color: '#999',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 8,
  },
  slotInfo: {
    flex: 1,
  },
  slotName: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#4e4370',
    marginBottom: 4,
  },
  slotDetails: {
    fontSize: 12,
    fontFamily: FONTS.jua,
    color: '#666',
  },
  loadText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    color: '#94c4f5',
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f59f9f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  // Save input modal styles
  saveInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 350,
  },
  saveInputTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    color: '#4e4370',
    textAlign: 'center',
    marginBottom: 8,
  },
  saveInputSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  saveNameInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    fontFamily: FONTS.jua,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  saveInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveInputButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelSaveButton: {
    backgroundColor: '#f59f9f',
  },
  cancelSaveButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  confirmSaveButton: {
    backgroundColor: '#94c4f5',
  },
  confirmSaveButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  // Delete confirmation modal styles
  deleteConfirmContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 350,
  },
  deleteConfirmTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    color: '#4e4370',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteConfirmMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteConfirmSaveName: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelDeleteButton: {
    backgroundColor: '#f59f9f',
  },
  cancelDeleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  confirmDeleteButton: {
    backgroundColor: '#94c4f5',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  slotsScroll: {
    flex: 1,
    width: '100%',
    minHeight: 200,
    alignSelf: 'stretch',
  },
});