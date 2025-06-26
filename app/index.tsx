import { FONTS } from '@/app/_layout';
import { ActivityInput } from '@/components/ActivityInput';
import { AdBanner } from '@/components/AdBanner';
import { Celebration } from '@/components/Celebration';
import { RouletteWheel } from '@/components/RouletteWheel';
import { SaveLoadModal } from '@/components/SaveLoadModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemeSelectionModal } from '@/components/ThemeSelectionModal';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, LayoutChangeEvent, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initializeInterstitialAd, showInterstitialAd } from '../utils/adMobUtils';
import { PASTEL_COLORS, reassignAllColors, type Activity } from '../utils/colorUtils';
import { getAISuggestedActivity, getEmoji } from '../utils/emojiUtils';
import { initSounds, unloadSounds } from '../utils/soundUtils';

// Generate random default activities for variety on first install
const generateDefaultActivities = (count: number = 8): Activity[] => {
  // Import the function dynamically to avoid circular dependencies
  const { generateRandomDefaultActivities } = require('../utils/emojiUtils');
  const randomPairs = generateRandomDefaultActivities(count);
  
  return randomPairs.map((pair: { name: string; emoji: string }, index: number) => ({
    id: (index + 1).toString(),
    name: pair.name,
    color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    emoji: pair.emoji
  }));
};

const DEFAULT_ACTIVITIES: Activity[] = generateDefaultActivities();

const STORAGE_KEY = 'SPIN2PICK_ACTIVITIES';
const SPIN_COUNT_KEY = 'SPIN2PICK_SPIN_COUNT';
const DECLINED_SUGGESTIONS_KEY = 'SPIN2PICK_DECLINED_SUGGESTIONS';

// Error Boundary Component to prevent black screens
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('RouletteWheel Error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ThemedText>Something went wrong with the wheel. Please restart the app.</ThemedText>
        </View>
      );
    }

    return (this.props as any).children;
  }
}

export default function HomeScreen() {
  const { currentTheme } = useTheme();
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [previousSelectedActivity, setPreviousSelectedActivity] = useState<Activity | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isSuggestingActivity, setIsSuggestingActivity] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const [showSuggestionPopup, setShowSuggestionPopup] = useState(false);
  
  // New state for deletion confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  // New state for reset confirmation
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetCount, setResetCount] = useState(8); // Default to 8

  // New state for save/load functionality
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  
  // New state for tracking newly added activity
  const [newlyAddedActivityId, setNewlyAddedActivityId] = useState<string | null>(null);

  // New state for theme selection
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Get screen dimensions for responsive design
  const screenData = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';

  // Responsive width settings (matching ActivityInput and RouletteWheel)
  const screenWidth = screenData.width;
  const isNarrowScreen = screenWidth < 360; // Very narrow screens
  const isSmallScreen = screenWidth < 400; // Small screens
  const isMediumScreen = screenWidth < 500; // Medium screens
  
  // Dynamic minWidth based on screen size for better text centering (matching other components)
  const getResponsiveMinWidth = () => {
    // Smaller minWidth on narrow screens allows text to center better
    // when content is shorter than the container width
    if (screenWidth < 320) return 260; // Very narrow - smaller minWidth for better centering
    if (screenWidth < 360) return 280; // Narrow
    if (screenWidth < 400) return 300; // Small  
    if (screenWidth < 500) return 340; // Medium
    return 340; // Wide screens - original value
  };
  
  const containerMinWidth = getResponsiveMinWidth();
  const containerMaxWidth = 500; // Maximum width for modals
  const MODAL_MAX_WIDTH = 500; // Maximum width for the modal
  const modalWidth = screenWidth < MODAL_MAX_WIDTH ? '95%' : MODAL_MAX_WIDTH;

  // Update activities with theme colors when theme changes
  useEffect(() => {
    if (activities.length > 0) {
      const rethemedActivities = reassignAllColors(activities, currentTheme.wheelColors);
      setActivities(rethemedActivities);
      console.log('🎨 Updated activity colors for theme:', currentTheme.displayName);
    }
  }, [currentTheme.id]); // Only run when theme ID changes

  // Load saved activities and initialize sounds when app starts
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize sound effects
        await initSounds();
        
        // Initialize AdMob interstitial ads
        initializeInterstitialAd();
        
        // Load saved activities from storage
        const savedActivities = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedActivities) {
          const parsedActivities = JSON.parse(savedActivities);
          // Reassign colors to ensure optimal distribution with current theme
          const recoloredActivities = reassignAllColors(parsedActivities, currentTheme.wheelColors);
          setActivities(recoloredActivities);
        }
        
        // Load saved spin count
        const savedSpinCount = await AsyncStorage.getItem(SPIN_COUNT_KEY);
        if (savedSpinCount) {
          setSpinCount(parseInt(savedSpinCount, 10));
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    
    // Clean up sounds when component unmounts
    return () => {
      unloadSounds();
    };
  }, []);
  
  // Save activities whenever they change
  useEffect(() => {
    const saveActivities = async () => {
      try {
        if (!isLoading) {
          console.log('💾 Saving activities to storage:', activities.map(a => ({ name: a.name, color: a.color })));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
        }
      } catch (error) {
        console.error('Error saving activities:', error);
      }
    };
    
    saveActivities();
  }, [activities, isLoading]);

  // Save spin count whenever it changes
  useEffect(() => {
    const saveSpinCount = async () => {
      try {
        if (!isLoading) {
          await AsyncStorage.setItem(SPIN_COUNT_KEY, spinCount.toString());
        }
      } catch (error) {
        console.error('Error saving spin count:', error);
      }
    };
    
    saveSpinCount();
  }, [spinCount, isLoading]);

  // Helper functions for managing declined suggestions
  const getDeclinedSuggestions = async (): Promise<string[]> => {
    try {
      const stored = await AsyncStorage.getItem(DECLINED_SUGGESTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading declined suggestions:', error);
      return [];
    }
  };

  const storeDeclinedSuggestion = async (suggestion: string): Promise<void> => {
    try {
      const current = await getDeclinedSuggestions();
      
      // Add the new declined suggestion if it's not already there
      if (!current.includes(suggestion)) {
        const updated = [...current, suggestion];
        
        // Keep only the last 20 declined suggestions to prevent unlimited growth
        const limited = updated.slice(-20);
        
        await AsyncStorage.setItem(DECLINED_SUGGESTIONS_KEY, JSON.stringify(limited));
        console.log('💾 Stored declined suggestion:', suggestion);
        console.log('📝 Total declined suggestions:', limited.length);
      }
    } catch (error) {
      console.error('Error storing declined suggestion:', error);
    }
  };

  const clearDeclinedSuggestions = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(DECLINED_SUGGESTIONS_KEY);
      console.log('🧹 Cleared all declined suggestions');
    } catch (error) {
      console.error('Error clearing declined suggestions:', error);
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
    console.log('[HomeScreen] onLayout - Container Width:', width);
  };

  const handleAddActivity = async (name: string) => {
    setIsAddingActivity(true);
    try {
      // Get emoji for the activity
      const emoji = await getEmoji(name);
      
      // Create new activity (color will be assigned when we reassign all colors)
      const newActivity: Activity = {
        id: Date.now().toString(),
        name,
        color: currentTheme.wheelColors[0], // Temporary color, will be reassigned
        emoji,
      };
      
      // Add the new activity and reassign all colors optimally with current theme
      const updatedActivities = [...activities, newActivity];
      const recoloredActivities = reassignAllColors(updatedActivities, currentTheme.wheelColors);
      setActivities(recoloredActivities);
      
      // Set the newly added activity for highlighting
      console.log('🎯 Setting newly added activity ID:', newActivity.id, 'for activity:', newActivity.name);
      setNewlyAddedActivityId(newActivity.id);
    } catch (error) {
      console.error('Error adding activity with emoji:', error);
      
      // Fallback to adding without emoji if there's an error
      const newActivity: Activity = {
        id: Date.now().toString(),
        name,
        color: currentTheme.wheelColors[0], // Temporary color, will be reassigned
        emoji: '🎲', // Default fallback
      };
      
      // Add the new activity and reassign all colors optimally with current theme
      const updatedActivities = [...activities, newActivity];
      const recoloredActivities = reassignAllColors(updatedActivities, currentTheme.wheelColors);
      setActivities(recoloredActivities);
      
      // Set the newly added activity for highlighting
      setNewlyAddedActivityId(newActivity.id);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleSuggestActivity = async () => {
    setIsSuggestingActivity(true);
    try {
      // Get existing activities and declined suggestions
      const existingActivityNames = activities.map(a => a.name);
      const declinedSuggestions = await getDeclinedSuggestions();
      
      // Get AI suggested activity with both existing and declined activities
      const suggestedActivityName = await getAISuggestedActivity(existingActivityNames, declinedSuggestions);
      
      // Show popup with suggestion instead of directly adding
      setPendingSuggestion(suggestedActivityName);
      setShowSuggestionPopup(true);
      
      console.log('✨ AI suggested activity:', suggestedActivityName);
    } catch (error) {
      console.error('Error suggesting activity:', error);
      alert('Sorry, I couldn&apos;t suggest an activity right now. Please try again!');
    } finally {
      setIsSuggestingActivity(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!pendingSuggestion) return;
    
    setIsAddingActivity(true);
    try {
      // Get emoji for the suggested activity
      const emoji = await getEmoji(pendingSuggestion);
      
      // Create new activity
      const newActivity: Activity = {
        id: Date.now().toString(),
        name: pendingSuggestion,
        color: currentTheme.wheelColors[0], // Temporary color, will be reassigned
        emoji,
      };
      
      // Add the new activity and reassign all colors optimally with current theme
      const updatedActivities = [...activities, newActivity];
      const recoloredActivities = reassignAllColors(updatedActivities, currentTheme.wheelColors);
      setActivities(recoloredActivities);
      
      // Set the newly added activity for highlighting
      setNewlyAddedActivityId(newActivity.id);
      
      console.log('✅ Accepted AI suggestion:', pendingSuggestion);
    } catch (error) {
      console.error('Error adding suggested activity:', error);
      alert('Sorry, there was an error adding the activity. Please try again!');
    } finally {
      setIsAddingActivity(false);
      setPendingSuggestion(null);
      setShowSuggestionPopup(false);
    }
  };

  const handleDeclineSuggestion = async () => {
    if (!pendingSuggestion) return;
    
    // Store the declined suggestion
    await storeDeclinedSuggestion(pendingSuggestion);
    
    console.log('❌ Declined AI suggestion:', pendingSuggestion);
    setPendingSuggestion(null);
    setShowSuggestionPopup(false);
  };

  const handleDeleteActivity = (id: string) => {
    const activityToRemove = activities.find(activity => activity.id === id);
    if (activityToRemove) {
      setActivityToDelete(activityToRemove);
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    if (activityToDelete) {
      const updatedActivities = activities.filter(activity => activity.id !== activityToDelete.id);
      // Reassign colors optimally after deletion with current theme
      const recoloredActivities = reassignAllColors(updatedActivities, currentTheme.wheelColors);
      setActivities(recoloredActivities);
      setActivityToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setActivityToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = () => {
    // Generate new random default activities with current theme colors
    const newDefaultActivities = generateDefaultActivities(resetCount);
    const themedActivities = reassignAllColors(newDefaultActivities, currentTheme.wheelColors);
    setActivities(themedActivities);
    setShowResetConfirmation(false);
    // Clear any selected activity
    setSelectedActivity(null);
    setPreviousSelectedActivity(null);
    setNewlyAddedActivityId(null);
  };

  const handleCancelReset = () => {
    setShowResetConfirmation(false);
  };

  const handleActivitySelect = async (activity: Activity) => {
    setSelectedActivity(activity);
    setShowCelebration(true);
    
    // Increment spin count
    const newSpinCount = spinCount + 1;
    setSpinCount(newSpinCount);
    
    // Show interstitial ad every 3 spins
    if (newSpinCount % 3 === 0) {
      console.log(`Showing interstitial ad after ${newSpinCount} spins`);
      await showInterstitialAd();
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setSelectedActivity(null);
  };

  const handlePreviousActivityChange = useCallback((activity: Activity | null) => {
    if (activity) {
      setPreviousSelectedActivity(activity);
    }
  }, []);

  const handleNewActivityIndicatorComplete = useCallback(() => {
    setNewlyAddedActivityId(null);
  }, []);

  const handleLoadActivities = (loadedActivities: Activity[]) => {
    // Reassign colors to ensure optimal distribution with current theme
    const recoloredActivities = reassignAllColors(loadedActivities, currentTheme.wheelColors);
    setActivities(recoloredActivities);
  };



  const handleCloseSaveLoad = () => {
    setShowSaveLoadModal(false);
  };

  const handleOpenTheme = () => {
    setShowThemeModal(true);
  };

  const handleCloseTheme = () => {
    setShowThemeModal(false);
  };

  const handleSaveLoad = (loadedActivities: Activity[]) => {
    // Reassign colors to ensure optimal distribution with current theme
    const recoloredActivities = reassignAllColors(loadedActivities, currentTheme.wheelColors);
    setActivities(recoloredActivities);
  };

  const renderContent = () => (
          <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]} onLayout={onLayout}>
            <View style={styles.headerContainer}>
              <View style={styles.titleContainer}>
                <ThemedText type="title" style={[styles.title, { color: currentTheme.uiColors.primary }]}>SPIN 2 PICK</ThemedText>
              </View>
            </View>
            
            <ActivityInput
              onAddActivity={handleAddActivity}
              onSuggestActivity={handleSuggestActivity}
              existingActivities={activities.map(a => a.name)}
              isLoading={isAddingActivity}
              isSuggesting={isSuggestingActivity}
              pendingSuggestion={pendingSuggestion}
              showSuggestionPopup={showSuggestionPopup}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDeclineSuggestion={handleDeclineSuggestion}
            />
            
            <ThemedText style={[styles.subtitle, { color: currentTheme.uiColors.secondary }]}>Press ✨ for AI suggestion!</ThemedText>

            {containerWidth > 0 ? (
              (() => {
                console.log('🎯 Rendering RouletteWheel with activities:', activities.map(a => ({ name: a.name, color: a.color })));
                return (
                  <ErrorBoundary>
                    <RouletteWheel
                      activities={activities}
                      onActivitySelect={handleActivitySelect}
                      onActivityDelete={handleDeleteActivity}
                      parentWidth={containerWidth}
                      selectedActivity={selectedActivity}
                      onPreviousActivityChange={handlePreviousActivityChange}
                      newlyAddedActivityId={newlyAddedActivityId}
                      onNewActivityIndicatorComplete={handleNewActivityIndicatorComplete}
                      onReset={handleReset}
                      onOpenTheme={handleOpenTheme}
                      onSaveLoad={handleSaveLoad}
                    />
                  </ErrorBoundary>
                );
              })()
            ) : (
              <ThemedText style={{textAlign: 'center', marginVertical: 20, color: currentTheme.uiColors.text}}>Loading wheel...</ThemedText>
            )}

            {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
          </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <KeyboardAvoidingView 
        style={[styles.keyboardAvoidingView, { backgroundColor: currentTheme.backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        enabled={Platform.OS === 'ios'}
      >
        <View style={[styles.mainContainer, { backgroundColor: currentTheme.backgroundColor }]}>
          {/* ScrollView for all platforms */}
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            bounces={Platform.OS === 'ios'}
          >
            {renderContent()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      
      {/* Fixed elements that shouldn&apos;t move with keyboard */}
      <View style={[styles.fixedBottomContainer, { backgroundColor: currentTheme.backgroundColor }]}>
        {/* Banner Ad at the bottom */}
        <AdBanner />
      </View>
      
      {/* Deletion Confirmation Popup */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelDelete}
        >
          <TouchableOpacity 
            style={[styles.popupContainer, {
              minWidth: containerMinWidth,
              maxWidth: containerMaxWidth,
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
            }]}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside popup
          >
            <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>Remove Activity 🗑️</Text>
            <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary }]}>Are you sure you want to remove:</Text>
            <Text allowFontScaling={false} style={[styles.activityToDeleteText, { 
              color: currentTheme.uiColors.text,
              backgroundColor: currentTheme.uiColors.cardBackground,
            }]}>
              {activityToDelete ? (activityToDelete.emoji ? `${activityToDelete.emoji} ${activityToDelete.name}` : activityToDelete.name) : ''}
            </Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.cancelButton, { backgroundColor: '#f59f9f' }]} 
                onPress={handleCancelDelete}
              >
                <Text allowFontScaling={false} style={styles.cancelButtonText}>Cancel ❌</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.popupButton, styles.confirmButton, { backgroundColor: currentTheme.uiColors.accent }]} 
                onPress={handleConfirmDelete}
              >
                <Text allowFontScaling={false} style={[styles.confirmButtonText, { color: currentTheme.uiColors.buttonText }]}>Remove ✅</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Reset Confirmation Popup */}
      <Modal
        visible={showResetConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelReset}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelReset}
        >
          <TouchableOpacity 
            style={[styles.popupContainer, { 
              width: modalWidth,
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
            }]} 
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside popup
          >
            <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>Reset Activities 🔄</Text>
            <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary }]}>How many random activities do you want? (Max 100)</Text>
            <TextInput
              style={[styles.resetCountInput, { 
                borderColor: currentTheme.uiColors.primary,
                color: currentTheme.uiColors.text,
              }]}
              keyboardType="numeric"
              onChangeText={(text: string) => {
                const num = parseInt(text, 10);
                if (!isNaN(num) && num > 0 && num <= 100) {
                  setResetCount(num);
                } else if (text === '') {
                  setResetCount(0); // Allow empty input temporarily
                }
                // Silently ignore values > 100
              }}
              value={resetCount.toString()}
              placeholder="8"
              placeholderTextColor={currentTheme.uiColors.secondary}
              maxLength={3}
              allowFontScaling={false}
            />
            <Text allowFontScaling={false} style={[styles.resetWarningText, { 
              color: '#d9534f',
              backgroundColor: currentTheme.uiColors.cardBackground,
            }]}>
              Current activities will be deleted and replaced with {resetCount} random activities.
            </Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.cancelButton, { backgroundColor: '#f59f9f' }]} 
                onPress={handleCancelReset}
              >
                <Text allowFontScaling={false} style={styles.cancelButtonText}>Cancel ❌</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.popupButton, styles.confirmButton, { backgroundColor: currentTheme.uiColors.accent }]} 
                onPress={handleConfirmReset}
              >
                <Text allowFontScaling={false} style={[styles.confirmButtonText, { color: currentTheme.uiColors.buttonText }]}>Reset ✅</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Theme Selection Modal */}
      <ThemeSelectionModal
        visible={showThemeModal}
        onClose={handleCloseTheme}
      />
      
      {/* Save/Load Modal */}
      <SaveLoadModal
        visible={showSaveLoadModal}
        onClose={handleCloseSaveLoad}
        currentActivities={activities}
        onLoadActivities={handleLoadActivities}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
    }),
  } as ViewStyle,
  keyboardAvoidingView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
    }),
  } as ViewStyle,
  mainContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
    }),
  } as ViewStyle,
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 52,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 0,
    fontFamily: FONTS.jua,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: FONTS.jua,
  },
  fixedBottomContainer: {
    // backgroundColor: '#f3efff', // Now using theme background
  },
  // Deletion confirmation popup styles (consistent with AI suggestion popup)
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
  },
  popupMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 10,
  },
  activityToDeleteText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  resetWarningText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    lineHeight: 22,
    flexShrink: 1,
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  popupButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor: '#f59f9f', // Moved to inline styles
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  confirmButton: {
    // backgroundColor: '#94c4f5', // Now using theme colors
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    // color: '#fff', // Now using theme colors
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  titleContainer: {
    flex: 1,
  },
  resetCountInput: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.jua,
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
  },
}); 