import { FONTS } from '@/app/_layout';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Platform,
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
  
  // Debug logging
  useEffect(() => {
    if (visible) {
      console.log('🗑️ DeleteActivitiesModal opened');
      console.log('🗑️ Activities count:', activities.length);
      console.log('🗑️ Activities:', activities.map(a => ({ id: a.id, name: a.name })));
    }
  }, [visible, activities]);
  
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
    console.log('🗑️ Delete button pressed for:', activity.name);
    setConfirmationModal({
      visible: true,
      activityName: activity.name,
      activityEmoji: activity.emoji || '📝',
    });
  };

  const handleConfirmDelete = () => {
    if (confirmationModal.activityName) {
      console.log('🗑️ Confirming delete for:', confirmationModal.activityName);
      onDeleteActivity(confirmationModal.activityName);
      setConfirmationModal({ visible: false, activityName: '', activityEmoji: '' });
    }
  };

  const handleCancelDelete = () => {
    console.log('🗑️ Canceling delete');
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

  if (!visible) return null;

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
          <View 
            style={[
              styles.modalContainer, 
              { 
                width: containerWidth,
                backgroundColor: currentTheme.uiColors.modalBackground,
                borderColor: currentTheme.uiColors.primary,
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text allowFontScaling={false} style={[
                styles.title,
                { color: currentTheme.uiColors.primary }
              ]}>
                🗑️ Delete Activities
              </Text>
              <Text allowFontScaling={false} style={[
                styles.subtitle,
                { color: currentTheme.uiColors.secondary }
              ]}>
                Tap an activity to delete it
              </Text>
            </View>

            {/* Activities List */}
            {activities.length === 0 ? (
              renderEmptyState()
            ) : (
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                bounces={true}
                alwaysBounceVertical={false}
                keyboardShouldPersistTaps="handled"
              >
                {activities.map(renderActivity)}
              </ScrollView>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[
                  styles.closeButton,
                  { 
                    backgroundColor: currentTheme.uiColors.accent,
                    borderColor: currentTheme.uiColors.primary,
                  }
                ]}
                onPress={onClose}
              >
                <Text allowFontScaling={false} style={[
                  styles.closeButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}>
                  Done ✨
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    borderWidth: 2,
    maxHeight: Platform.OS === 'web' ? '85%' : '90%',
    minHeight: Platform.OS === 'web' ? 500 : 600,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.jua,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: Platform.OS === 'web' ? 300 : 400,
  },
  scrollContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  activityItem: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    flex: 1,
  },
  deleteIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: Platform.OS === 'web' ? 300 : 400,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  closeButton: {
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
  closeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  
  // Confirmation modal styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContainer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  confirmationTitle: {
    fontSize: 20,
    fontFamily: FONTS.jua,
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 10,
    textAlign: 'center',
  },
  activityToDelete: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000010',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmationButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    // backgroundColor set inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  deleteButton: {
    // backgroundColor set inline
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 