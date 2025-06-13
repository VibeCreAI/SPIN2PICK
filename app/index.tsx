import { FONTS } from '@/app/_layout';
import { ActivityInput } from '@/components/ActivityInput';
import { AdBanner } from '@/components/AdBanner';
import { Celebration } from '@/components/Celebration';
import { RouletteWheel } from '@/components/RouletteWheel';
import { SaveLoadModal } from '@/components/SaveLoadModal';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, LayoutChangeEvent, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initializeInterstitialAd, showInterstitialAd } from '../utils/adMobUtils';
import { PASTEL_COLORS, reassignAllColors, type Activity } from '../utils/colorUtils';
import { getAISuggestedActivity, getEmoji } from '../utils/emojiUtils';
import { initSounds, unloadSounds } from '../utils/soundUtils';

// Generate random default activities for variety on first install
const generateDefaultActivities = (): Activity[] => {
  // Import the function dynamically to avoid circular dependencies
  const { generateRandomDefaultActivities } = require('../utils/emojiUtils');
  const randomPairs = generateRandomDefaultActivities(8);
  
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

  // New state for save/load functionality
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  
  // New state for tracking newly added activity
  const [newlyAddedActivityId, setNewlyAddedActivityId] = useState<string | null>(null);

  // Get screen dimensions for responsive design
  const screenData = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';

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
          // Reassign colors to ensure optimal distribution
          const recoloredActivities = reassignAllColors(parsedActivities);
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
        color: PASTEL_COLORS[0], // Temporary color, will be reassigned
        emoji,
      };
      
      // Add the new activity and reassign all colors optimally
      const updatedActivities = [...activities, newActivity];
      const recoloredActivities = reassignAllColors(updatedActivities);
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
        color: PASTEL_COLORS[0], // Temporary color, will be reassigned
        emoji: '🎲', // Default fallback
      };
      
      // Add the new activity and reassign all colors optimally
      const updatedActivities = [...activities, newActivity];
      const recoloredActivities = reassignAllColors(updatedActivities);
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
      // Get AI suggested activity
      const existingActivityNames = activities.map(a => a.name);
      const suggestedActivityName = await getAISuggestedActivity(existingActivityNames);
      
      // Show popup with suggestion instead of directly adding
      setPendingSuggestion(suggestedActivityName);
      setShowSuggestionPopup(true);
      
      console.log('✨ AI suggested activity:', suggestedActivityName);
    } catch (error) {
      console.error('Error suggesting activity:', error);
      alert('Sorry, I couldn\'t suggest an activity right now. Please try again!');
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
        color: PASTEL_COLORS[0], // Temporary color, will be reassigned
        emoji,
      };
      
      // Add the new activity and reassign all colors optimally
      const updatedActivities = [...activities, newActivity];
      const recoloredActivities = reassignAllColors(updatedActivities);
      setActivities(recoloredActivities);
      
      // Set the newly added activity for highlighting
      setNewlyAddedActivityId(newActivity.id);
      
      console.log('✅ Accepted AI suggestion:', pendingSuggestion);
    } catch (error) {
      console.error('Error adding suggested activity:', error);
      alert('Sorry, there was an error adding the activity. Please try again!');
    } finally {
      setIsAddingActivity(false);
      setShowSuggestionPopup(false);
      setPendingSuggestion(null);
    }
  };

  const handleDeclineSuggestion = () => {
    setShowSuggestionPopup(false);
    setPendingSuggestion(null);
    console.log('❌ Declined AI suggestion');
  };

  const handleDeleteActivity = (id: string) => {
    // Find the activity to delete and show confirmation popup
    const activityToDelete = activities.find(activity => activity.id === id);
    if (activityToDelete) {
      setActivityToDelete(activityToDelete);
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    if (activityToDelete) {
      const activitiesAfterDeletion = activities.filter(activity => activity.id !== activityToDelete.id);
      const recoloredActivities = reassignAllColors(activitiesAfterDeletion);
      setActivities(recoloredActivities);
    }
    setShowDeleteConfirmation(false);
    setActivityToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setActivityToDelete(null);
  };

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = () => {
    // Generate new random default activities
    const newDefaultActivities = generateDefaultActivities();
    setActivities(newDefaultActivities);
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
    // Reassign colors to ensure optimal distribution
    const recoloredActivities = reassignAllColors(loadedActivities);
    setActivities(recoloredActivities);
  };

  const handleOpenSaveLoad = () => {
    setShowSaveLoadModal(true);
  };

  const handleCloseSaveLoad = () => {
    setShowSaveLoadModal(false);
  };

  const renderContent = () => (
          <View style={styles.container} onLayout={onLayout}>
            <View style={styles.headerContainer}>
              <View style={styles.titleContainer}>
                <ThemedText type="title" style={styles.title}>SPIN 2 PICK</ThemedText>
                <ThemedText style={styles.subtitle}>✨ for AI suggestion | 💾 to save or load</ThemedText>
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
              onSaveLoad={handleOpenSaveLoad}
            />

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
                    />
                  </ErrorBoundary>
                );
              })()
            ) : (
              <ThemedText style={{textAlign: 'center', marginVertical: 20}}>Loading wheel...</ThemedText>
            )}

            {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
          </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        enabled={Platform.OS === 'ios'}
      >
        <View style={styles.mainContainer}>
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
      
      {/* Fixed elements that shouldn't move with keyboard */}
      <View style={styles.fixedBottomContainer}>
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
            style={styles.popupContainer}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside popup
          >
            <Text style={styles.popupTitle}>Remove Activity 🗑️</Text>
            <Text style={styles.popupMessage}>Are you sure you want to remove:</Text>
            <Text style={styles.activityToDeleteText}>
              {activityToDelete ? (activityToDelete.emoji ? `${activityToDelete.emoji} ${activityToDelete.name}` : activityToDelete.name) : ''}
            </Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.cancelButton]} 
                onPress={handleCancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel ❌</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.popupButton, styles.confirmButton]} 
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmButtonText}>Remove ✅</Text>
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
            style={styles.popupContainer}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside popup
          >
            <Text style={styles.popupTitle}>Reset Activities 🔄</Text>
            <Text style={styles.popupMessage}>Are you sure you want to reset?</Text>
            <Text style={styles.resetWarningText}>
              All current activities on the wheel will be deleted and replaced with 8 random activities.
            </Text>
            
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.cancelButton]} 
                onPress={handleCancelReset}
              >
                <Text style={styles.cancelButtonText}>Cancel ❌</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.popupButton, styles.confirmButton]} 
                onPress={handleConfirmReset}
              >
                <Text style={styles.confirmButtonText}>Reset ✅</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
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
    backgroundColor: '#f3efff',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  keyboardAvoidingView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f3efff',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
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
    marginTop: 36,
    marginBottom: 10,
    color: '#4e4370',
    fontFamily: FONTS.jua,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 0,
    color: '#666',
    fontFamily: FONTS.jua,
  },
  fixedBottomContainer: {
    backgroundColor: '#f3efff',
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
    color: '#4e4370',
  },
  popupMessage: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 10,
    color: '#666',
  },
  activityToDeleteText: {
    fontSize: 18,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  resetWarningText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    marginBottom: 20,
    color: '#d9534f',
    textAlign: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f5c6cb',
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
    backgroundColor: '#f59f9f',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#94c4f5',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.jua,
    color: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
}); 