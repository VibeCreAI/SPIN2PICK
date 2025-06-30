import { FONTS } from '@/app/_layout';
import { PREDETERMINED_TITLES } from '@/data/predeterminedTitles';
import { useTheme } from '@/hooks/useTheme';
import {
    Title
} from '@/utils/titleUtils';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';

interface FirstTimeWelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTitle: (title: Title) => void;
}

export const FirstTimeWelcomeModal: React.FC<FirstTimeWelcomeModalProps> = ({
  visible,
  onClose,
  onSelectTitle
}) => {
  const { currentTheme } = useTheme();
  const [titlesByCategory, setTitlesByCategory] = useState<Record<string, Title[]>>({
    'family': [],
    'food': [],
    'games': [],
    'decisions': [],
    'numbers': [],
    'workplace': [],
    'education': [],
    'entertainment': [],
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['family'])); // Start with family expanded
  const [isLoading, setIsLoading] = useState(false);

  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;
  const MODAL_MAX_WIDTH = 500;
  const containerWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // Load predetermined titles on mount
  useEffect(() => {
    if (visible) {
      loadTitles();
    }
  }, [visible]);

  const loadTitles = () => {
    setIsLoading(true);
    try {
      // Group predetermined titles by category
      const grouped: Record<string, Title[]> = {
        'family': [],
        'food': [],
        'games': [],
        'decisions': [],
        'numbers': [],
        'workplace': [],
        'education': [],
        'entertainment': [],
      };

      PREDETERMINED_TITLES.forEach(title => {
        const category = title.category.toLowerCase();
        if (grouped[category]) {
          grouped[category].push(title);
        }
      });

      setTitlesByCategory(grouped);
    } catch (error) {
      console.error('Error loading titles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleSelect = (title: Title) => {
    onSelectTitle(title);
    onClose();
  };

  const handleSkipToKidsActivities = () => {
    // Find Kids Activities title
    const kidsActivitiesTitle = PREDETERMINED_TITLES.find(title => title.id === 'kids-activities');
    if (kidsActivitiesTitle) {
      onSelectTitle(kidsActivitiesTitle);
    }
    onClose();
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      'family': '👨‍👩‍👧‍👦 Family & Kids',
      'food': '🍽️ Food & Dining',
      'games': '🎮 Games & Fun',
      'decisions': '🤔 Decision Making',
      'numbers': '🎲 Numbers & Random',
      'workplace': '💼 Work & Professional',
      'education': '📚 Learning & Education',
      'entertainment': '🎬 Entertainment & Media',
    };
    return names[category] || category;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'family': '👨‍👩‍👧‍👦',
      'food': '🍽️',
      'games': '🎮',
      'decisions': '🤔',
      'numbers': '🎲',
      'workplace': '💼',
      'education': '📚',
      'entertainment': '🎬',
    };
    return emojis[category] || '📋';
  };

  const renderTitleCard = (title: Title) => (
    <TouchableOpacity
      key={title.id}
      style={[
        styles.titleCard,
        {
          backgroundColor: currentTheme.uiColors.cardBackground,
          borderColor: currentTheme.uiColors.secondary,
        }
      ]}
      onPress={() => handleTitleSelect(title)}
      activeOpacity={0.7}
    >
      <View style={styles.titleHeader}>
        <Text style={[styles.titleEmoji, { color: currentTheme.uiColors.text }]}>
          {title.emoji}
        </Text>
        <View style={styles.titleInfo}>
          <Text 
            allowFontScaling={false}
            style={[styles.titleName, { color: currentTheme.uiColors.text }]}
            numberOfLines={1}
          >
            {title.name}
          </Text>
          <Text 
            allowFontScaling={false}
            style={[styles.titleDescription, { color: currentTheme.uiColors.secondary }]}
            numberOfLines={2}
          >
            {title.description}
          </Text>
        </View>
      </View>
      <View style={styles.titleFooter}>
        <Text 
          allowFontScaling={false}
          style={[styles.activityCount, { color: currentTheme.uiColors.accent }]}
        >
          {title.items.length} activities
        </Text>
        <View style={[styles.selectButton, { backgroundColor: currentTheme.uiColors.accent }]}>
          <Text 
            allowFontScaling={false}
            style={[styles.selectButtonText, { color: currentTheme.uiColors.buttonText }]}
          >
            Select
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category: string, titles: Title[]) => {
    const isExpanded = expandedCategories.has(category);
    const isEmpty = titles.length === 0;
    
    if (isEmpty) return null;

    return (
      <View key={category} style={styles.categoryContainer}>
        <TouchableOpacity 
          style={[
            styles.categoryHeader,
            {
              backgroundColor: currentTheme.uiColors.cardBackground,
              borderColor: currentTheme.uiColors.secondary,
            }
          ]}
          onPress={() => toggleCategory(category)}
          activeOpacity={0.7}
        >
          <Text 
            allowFontScaling={false}
            style={[styles.categoryTitle, { color: currentTheme.uiColors.text }]}
          >
            {getCategoryDisplayName(category)}
          </Text>
          <View style={styles.categoryMeta}>
            <Text 
              allowFontScaling={false}
              style={[styles.categoryCount, { color: currentTheme.uiColors.secondary }]}
            >
              {titles.length} wheels
            </Text>
            <Text 
              allowFontScaling={false}
              style={[styles.expandIcon, { color: currentTheme.uiColors.accent }]}
            >
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.titlesContainer}>
            {titles.map(renderTitleCard)}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          { 
            backgroundColor: currentTheme.uiColors.modalBackground,
            width: containerWidth 
          }
        ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.uiColors.secondary }]}>
            <Text 
              allowFontScaling={false}
              style={[styles.title, { color: currentTheme.uiColors.text }]}
            >
              Welcome! Choose Your First Wheel 🎉
            </Text>
            <Text 
              allowFontScaling={false}
              style={[styles.subtitle, { color: currentTheme.uiColors.secondary }]}
            >
              Pick a category to get started with Spin2Pick
            </Text>
          </View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              bounces={Platform.OS === 'ios'}
              alwaysBounceVertical={false}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator 
                    size="large" 
                    color={currentTheme.uiColors.accent} 
                  />
                  <Text 
                    allowFontScaling={false}
                    style={[styles.loadingText, { color: currentTheme.uiColors.text }]}
                  >
                    Loading wheels...
                  </Text>
                </View>
              ) : (
                <>
                  {Object.entries(titlesByCategory).map(([category, titles]) => 
                    renderCategory(category, titles)
                  )}
                </>
              )}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: currentTheme.uiColors.secondary }]}>
            <TouchableOpacity 
              style={[styles.skipButton, { backgroundColor: currentTheme.uiColors.secondary }]}
              onPress={handleSkipToKidsActivities}
              activeOpacity={0.7}
            >
              <Text 
                allowFontScaling={false}
                style={[styles.skipButtonText, { color: currentTheme.uiColors.buttonText }]}
              >
                Skip - Start with Kids Activities
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '95%',
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
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    lineHeight: 20,
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
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    flex: 1,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
  },
  expandIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  titlesContainer: {
    marginTop: 8,
    gap: 8,
  },
  titleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleEmoji: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  titleName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    marginBottom: 4,
  },
  titleDescription: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
    lineHeight: 16,
  },
  titleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCount: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
});