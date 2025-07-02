import { FONTS } from '@/app/_layout';
import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ThemedErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
  emoji?: string;
}

export const ThemedErrorModal: React.FC<ThemedErrorModalProps> = ({
  visible,
  title,
  message,
  onClose,
  buttonText = 'OK',
  emoji = '⚠️'
}) => {
  const { currentTheme } = useTheme();

  return (
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
          style={[styles.popupContainer, {
            backgroundColor: currentTheme.uiColors.modalBackground,
            borderColor: currentTheme.uiColors.primary,
          }]}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside popup
        >
          <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>
            {emoji} {title}
          </Text>
          <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.text }]}>
            {message}
          </Text>
          
          <TouchableOpacity 
            style={[styles.confirmButton, { backgroundColor: currentTheme.uiColors.accent }]} 
            onPress={onClose}
          >
            <Text allowFontScaling={false} style={[styles.confirmButtonText, { color: currentTheme.uiColors.buttonText }]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
  },
});