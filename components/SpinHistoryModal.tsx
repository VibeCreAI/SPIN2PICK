import { FONTS } from '@/app/_layout';
import * as Haptics from 'expo-haptics';
import React from 'react';
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

interface Activity {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

interface SpinHistoryEntry {
  activity: Activity;
  timestamp: Date;
}

interface SpinHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  history: SpinHistoryEntry[];
  onClearHistory: () => void;
}

export const SpinHistoryModal: React.FC<SpinHistoryModalProps> = ({
  visible,
  onClose,
  history,
  onClearHistory,
}) => {
  const { currentTheme } = useTheme();

  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // Format relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  };

  const handleClearHistory = () => {
    // Add haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Ignore if haptics not available
    }
    
    onClearHistory();
  };

  const renderHistoryItem = (entry: SpinHistoryEntry, index: number) => (
    <View 
      key={`${entry.activity.id}-${entry.timestamp.getTime()}`}
      style={[
        styles.historyItem,
        {
          backgroundColor: currentTheme.uiColors.cardBackground,
          borderColor: currentTheme.uiColors.secondary + '40',
        }
      ]}
    >
      <View style={styles.historyItemContent}>
        <View style={styles.activityInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: entry.activity.color }]} />
          <Text 
            allowFontScaling={false}
            style={[styles.activityText, { color: currentTheme.uiColors.text }]}
            numberOfLines={2}
          >
            {entry.activity.emoji ? `${entry.activity.emoji} ${entry.activity.name}` : entry.activity.name}
          </Text>
        </View>
        <Text 
          allowFontScaling={false}
          style={[styles.timestampText, { color: currentTheme.uiColors.secondary }]}
        >
          {formatRelativeTime(entry.timestamp)}
        </Text>
      </View>
      <View style={styles.historyNumber}>
        <Text 
          allowFontScaling={false}
          style={[styles.historyNumberText, { color: currentTheme.uiColors.accent }]}
        >
          #{history.length - index}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayDismiss}
          activeOpacity={1}
          onPress={onClose}
        />
        <View 
          style={[
            styles.modalContainer,
            {
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
              width: containerWidth,
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.uiColors.secondary + '40' }]}>
            <Text 
              allowFontScaling={false}
              style={[styles.title, { color: currentTheme.uiColors.primary }]}
            >
              🕒 Spin History
            </Text>
            <Text 
              allowFontScaling={false}
              style={[styles.subtitle, { color: currentTheme.uiColors.secondary }]}
            >
              Your last {history.length} spin{history.length === 1 ? '' : 's'}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Text 
                  allowFontScaling={false}
                  style={[styles.emptyText, { color: currentTheme.uiColors.secondary }]}
                >
                  No spin history yet.{'\n'}Start spinning to see your results here!
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.historyList}
                contentContainerStyle={styles.historyListContent}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={Platform.OS === 'ios'}
                alwaysBounceVertical={false}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={false}
              >
                {history.map((entry, index) => renderHistoryItem(entry, index))}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: currentTheme.uiColors.secondary + '40' }]}>
            {history.length > 0 && (
              <TouchableOpacity 
                style={[styles.clearButton, { backgroundColor: currentTheme.uiColors.secondary + '20' }]} 
                onPress={handleClearHistory}
                activeOpacity={0.7}
              >
                <Text 
                  allowFontScaling={false} 
                  style={[styles.clearButtonText, { color: currentTheme.uiColors.secondary }]}
                >
                  🗑️ Clear History
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: currentTheme.uiColors.accent }]} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text 
                allowFontScaling={false} 
                style={[styles.closeButtonText, { color: currentTheme.uiColors.buttonText }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxWidth: 500,
    maxHeight: '70%',
    minHeight: 400,
    borderRadius: 20,
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    minHeight: 200,
    maxHeight: 400,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    textAlign: 'center',
    lineHeight: 24,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyItemContent: {
    flex: 1,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activityText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    flex: 1,
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 12,
    fontFamily: FONTS.jua,
    marginLeft: 20,
  },
  historyNumber: {
    marginLeft: 12,
  },
  historyNumberText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: FONTS.jua,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
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
});