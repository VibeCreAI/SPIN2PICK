import { FONTS } from '@/app/_layout';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Activity } from '../utils/colorUtils';

interface DeleteActivitiesModalProps {
  visible: boolean;
  onClose: () => void;
  activities: Activity[];
  onDeleteActivity: (activityName: string) => void;
}

export const DeleteActivitiesModal: React.FC<DeleteActivitiesModalProps> = ({
  visible,
  onClose,
  activities,
  onDeleteActivity,
}) => {
  const { currentTheme } = useTheme();
  
  // State for the confirmation modal
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    activityName: string;
    activityEmoji: string;
  }>({
    visible: false,
    activityName: '',
    activityEmoji: '',
  });

  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500; // Maximum width for the modal
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

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

  const renderActivity = (activity: Activity) => (
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
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text allowFontScaling={false} style={[
        styles.emptyText,
        { color: currentTheme.uiColors.secondary }
      ]}>
        🗑️ No activities to delete
      </Text>
      <Text allowFontScaling={false} style={[
        styles.emptySubtext,
        { color: currentTheme.uiColors.secondary }
      ]}>
        Add some activities first!
      </Text>
    </View>
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
            ⚠️ Delete Activity?
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

  return (
    <>
      <Modal 
        visible={visible} 
        transparent 
        animationType="fade" 
        onRequestClose={onClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <TouchableOpacity 
            style={[
              styles.modalContainer, 
              { 
                width: containerWidth,
                backgroundColor: currentTheme.backgroundColor,
                borderColor: currentTheme.uiColors.primary,
              }
            ]} 
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside
          >
            <Text allowFontScaling={false} style={[
              styles.modalTitle, 
              { color: currentTheme.uiColors.primary }
            ]}>
              🗑️ Delete Activities
            </Text>
            
            <Text allowFontScaling={false} style={[
              styles.modalSubtitle, 
              { color: currentTheme.uiColors.secondary }
            ]}>
              Tap any activity to remove it
            </Text>
            
            {activities.length === 0 ? (
              renderEmptyState()
            ) : (
              <ScrollView 
                style={styles.activitiesScroll} 
                contentContainerStyle={styles.activitiesContainer}
                showsVerticalScrollIndicator={true}
              >
                {activities.map(renderActivity)}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={[
                styles.closeButton, 
                { backgroundColor: currentTheme.uiColors.primary }
              ]} 
              onPress={onClose}
            >
              <Text allowFontScaling={false} style={[
                styles.closeButtonText, 
                { color: currentTheme.uiColors.buttonText }
              ]}>
                Close
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {renderConfirmationModal()}
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
    borderWidth: 2,
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
    textAlign: 'center',
  },
  activitiesScroll: {
    width: '100%',
    flex: 1,
  },
  activitiesContainer: {
    gap: 8,
    paddingBottom: 12,
  },
  activityItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    width: '100%',
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    flex: 1,
  },
  deleteIcon: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#ff6b6b',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    textAlign: 'center',
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
  // Confirmation modal styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  confirmationContainer: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    borderWidth: 2,
  },
  confirmationTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 12,
    textAlign: 'center',
  },
  activityToDelete: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor handled by theme
  },
  deleteButton: {
    // backgroundColor: '#ff6b6b' - handled inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
}); 