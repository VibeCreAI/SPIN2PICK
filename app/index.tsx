// Enable Fast Refresh for web
import '@expo/metro-runtime';

import { FONTS } from '@/app/_layout';
import { ActivityInput } from '@/components/ActivityInput';
import { AdBanner } from '@/components/AdBanner';
import { Celebration } from '@/components/Celebration';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { RouletteWheel } from '@/components/RouletteWheel';
import { SaveLoadModal } from '@/components/SaveLoadModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemeSelectionModal } from '@/components/ThemeSelectionModal';
import { TitleManagementModal } from '@/components/TitleManagementModal';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, LayoutChangeEvent, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { installPredeterminedTitles } from '../data/predeterminedTitles';
import { PASTEL_COLORS, reassignAllColors, getThemeById, loadCustomTheme, type Activity, type CustomThemeData } from '../utils/colorUtils';
import { getAISuggestedActivity, getEmoji } from '../utils/emojiUtils';
import { initSounds, setSoundMuted, unloadSounds } from '../utils/soundUtils';
import { STORAGE_KEYS, Title, TitleCategory, TitleManager } from '../utils/titleUtils';
// Conditional import for AdMob - only in development builds, not Expo Go
let initializeInterstitialAd: (() => void) | null = null;
let showInterstitialAd: (() => Promise<boolean>) | null = null;

// Check if we're in Expo Go
let isExpoGo = false;
try {
  const Constants = require('expo-constants');
  isExpoGo = Constants.appOwnership === 'expo';
} catch (e) {
  // Constants not available
}

// Always use safe AdMob functions for Expo Go compatibility
try {
  const adMobUtils = require('../utils/adMobUtils');
  initializeInterstitialAd = adMobUtils.initializeInterstitialAd;
  showInterstitialAd = adMobUtils.showInterstitialAd;
} catch (error) {
  console.log('AdMob utils not available - using fallback');
}

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
const SETTINGS_KEY = 'SPIN2PICK_SETTINGS';

// App settings interface
interface AppSettings {
  soundMuted: boolean;
  language: string; // For future implementation
}

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
  const { currentTheme, setTheme, setCustomTheme, customTheme } = useTheme();
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

  // New state for title management
  const [showTitleManagementModal, setShowTitleManagementModal] = useState(false);

  // Title management state
  const [currentTitle, setCurrentTitle] = useState<Title | null>(null);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);

  // New state for bulk AI functionality
  const [isLoadingBulkAI, setIsLoadingBulkAI] = useState(false);
  const [bulkAISuggestions, setBulkAISuggestions] = useState<string[]>([]);
  
  // State for external activity list control
  const [openActivityListExternal, setOpenActivityListExternal] = useState(false);

  // New state for recently used titles
  const [recentlyUsedTitles, setRecentlyUsedTitles] = useState<Title[]>([]);

  // New state for activity management modal
  const [showActivityManagementModal, setShowActivityManagementModal] = useState(false);
  
  // Settings state
  const [appSettings, setAppSettings] = useState<AppSettings>({
    soundMuted: false,
    language: 'en'
  });

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
  }, [currentTheme.id, currentTheme.wheelColors]); // Run when theme changes
  
  // Ensure activities get theme colors after initial load
  useEffect(() => {
    if (activities.length > 0 && !isLoading) {
      // Double-check theme colors are applied after any activity changes
      const hasCorrectColors = activities.every((activity, index) => 
        activity.color === currentTheme.wheelColors[index % currentTheme.wheelColors.length]
      );
      
      if (!hasCorrectColors) {
        console.log('🔧 Fixing activity colors to match current theme');
        const rethemedActivities = reassignAllColors(activities, currentTheme.wheelColors);
        setActivities(rethemedActivities);
      }
    }
  }, [activities.length, isLoading, currentTheme.wheelColors]); // Run when activities are loaded or theme changes

  // Load saved activities and initialize sounds when app starts
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load app settings first
        const loadedSettings = await loadSettings();
        setAppSettings(loadedSettings);
        
        // Initialize sound effects and set mute state
        await initSounds();
        setSoundMuted(loadedSettings.soundMuted);
        
        // Initialize AdMob interstitial ads (only if available)
        if (initializeInterstitialAd) {
          initializeInterstitialAd();
        }
        
        // Initialize title system (handles legacy migration)
        await initializeTitleSystem();
        
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
      }
    } catch (error) {
      console.error('Error storing declined suggestion:', error);
    }
  };

  const clearDeclinedSuggestions = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(DECLINED_SUGGESTIONS_KEY);
    } catch (error) {
      console.error('Error clearing declined suggestions:', error);
    }
  };

  // Title Management Functions
  const initializeTitleSystem = async () => {
    try {
      // First, install predetermined titles if they don't exist
      await installPredeterminedTitles();
      
      // Force update legacy titles to fix cached old values
      await forceLegacyTitleUpdate();
      
      const currentTitleId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TITLE_ID);
      if (currentTitleId) {
        const title = await TitleManager.getTitle(currentTitleId);
        if (title) {
          setCurrentTitle(title);
          
          // Apply optimized count and theme colors during initialization
          const optimalCount = getOptimalCountForCategory(title.category);
          const itemsToUse = title.items.slice(0, Math.min(optimalCount, title.items.length));
          
          const activitiesWithEmojis = await Promise.all(itemsToUse.map(async (item, index) => ({
            id: (index + 1).toString(),
            name: item.name,
            color: currentTheme.wheelColors[index % currentTheme.wheelColors.length],
            emoji: item.emoji || await getEmoji(item.name)
          })));
          
          setActivities(activitiesWithEmojis);
          return;
        }
      }
      
      // Fallback to migration or default title
      await handleLegacyMigration();
    } catch (error) {
      console.error('Error initializing title system:', error);
      // Fallback to default activities
      setCurrentTitle(null);
    }
  };

  // Force update legacy titles to fix cached old values
  const forceLegacyTitleUpdate = async () => {
    try {
      const existingTitle = await TitleManager.getTitle('legacy-activities');
      if (existingTitle && (existingTitle.name === 'My Activities' || !existingTitle.isPredetermined)) {
        console.log('🔄 Updating legacy title to fix cached values...');
        
        const updatedTitle: Title = {
          ...existingTitle,
          name: 'Kids Activities',
          isPredetermined: true, // Mark as predetermined to prevent deletion
          updatedAt: new Date(),
        };
        
        await TitleManager.saveTitle(updatedTitle);
        console.log('✅ Legacy title forcefully updated');
      }
    } catch (error) {
      console.error('Error force updating legacy title:', error);
    }
  };

  const handleTitleSwitch = async (titleId: string) => {
    if (isLoadingTitle) return;
    
    setIsLoadingTitle(true);
    try {
      const title = await TitleManager.getTitle(titleId);
      if (title) {
        setCurrentTitle(title);
        
        // Apply optimized count for the category
        const optimalCount = getOptimalCountForCategory(title.category);
        const itemsToUse = title.items.slice(0, Math.min(optimalCount, title.items.length));
        
        // Convert items to activities and add emojis if missing
        const activitiesWithEmojis = await Promise.all(itemsToUse.map(async (item, index) => ({
          id: (index + 1).toString(),
          name: item.name,
          color: currentTheme.wheelColors[index % currentTheme.wheelColors.length],
          emoji: item.emoji || await getEmoji(item.name)
        })));
        
        setActivities(activitiesWithEmojis);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TITLE_ID, titleId);
        setShowHamburgerMenu(false); // Close menu after switching
      }
    } catch (error) {
      console.error('Error switching title:', error);
    } finally {
      setIsLoadingTitle(false);
    }
  };

  const handleLegacyMigration = async () => {
    try {
      // Check if legacy title already exists and update it
      const existingTitle = await TitleManager.getTitle('legacy-activities');
      if (existingTitle) {
        // Update existing legacy title to fix name and isPredetermined status
        const updatedTitle: Title = {
          ...existingTitle,
          name: 'Kids Activities',
          isPredetermined: true, // Mark as predetermined to prevent deletion
          updatedAt: new Date(),
        };
        
        await TitleManager.saveTitle(updatedTitle);
        setCurrentTitle(updatedTitle);
        console.log('✅ Legacy title updated');
        return;
      }
      
      // Check for legacy activities
      const legacyActivities = await AsyncStorage.getItem(STORAGE_KEY);
      if (legacyActivities) {
        const parsedActivities = JSON.parse(legacyActivities);
        
        // Create a legacy migration title
        const migrationTitle: Title = {
          id: 'legacy-activities',
          name: 'Kids Activities',
          emoji: '🧸',
          description: 'Fun activities for children and families',
          category: TitleCategory.FAMILY,
          items: parsedActivities,
          isCustom: false,
          isPredetermined: true, // Mark as predetermined to prevent deletion
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          spinCount: 0
        };
        
        await TitleManager.saveTitle(migrationTitle);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TITLE_ID, 'legacy-activities');
        
        setCurrentTitle(migrationTitle);
        // Apply theme colors to migrated activities
        const themedActivities = reassignAllColors(migrationTitle.items, currentTheme.wheelColors);
        setActivities(themedActivities);
        
        console.log('✅ Legacy data migrated to title system');
      } else {
        // No legacy data, set default state
        setCurrentTitle(null);
        // Apply theme colors to default activities
        const themedDefaultActivities = reassignAllColors(DEFAULT_ACTIVITIES, currentTheme.wheelColors);
        setActivities(themedDefaultActivities);
      }
    } catch (error) {
      console.error('Error during legacy migration:', error);
      setCurrentTitle(null);
      // Apply theme colors to default activities even in error case
      const themedDefaultActivities = reassignAllColors(DEFAULT_ACTIVITIES, currentTheme.wheelColors);
      setActivities(themedDefaultActivities);
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
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
      
      // Get AI suggested activity with both existing and declined activities and title context
      const suggestedActivityName = await getAISuggestedActivity(
        existingActivityNames, 
        declinedSuggestions,
        currentTitle?.name || 'Kids Activity',
        currentTitle?.category || 'family',
        currentTitle?.description || 'Random activities'
      );
      
      // Show popup with suggestion instead of directly adding
      setPendingSuggestion(suggestedActivityName);
      setShowSuggestionPopup(true);
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

  const handleDeleteActivityByName = (activityName: string) => {
    const updatedActivities = activities.filter(activity => activity.name !== activityName);
    // Reassign colors optimally after deletion with current theme
    const recoloredActivities = reassignAllColors(updatedActivities, currentTheme.wheelColors);
    setActivities(recoloredActivities);
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
    // Set optimal reset count based on current title category
    if (currentTitle) {
      const optimalCount = getOptimalCountForCategory(currentTitle.category);
      setResetCount(optimalCount);
    } else {
      setResetCount(8); // Default for legacy "Kids Activity"
    }
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = async () => {
    try {
      let newActivities: Activity[];
      
      if (currentTitle && currentTitle.isPredetermined) {
        // For predetermined titles, reset to their original items
        // Take a subset based on resetCount or all items if resetCount is larger
        const itemsToUse = currentTitle.items.slice(0, Math.min(resetCount, currentTitle.items.length));
        
        // Add emojis to items that don't have them
        const activitiesWithEmojis = await Promise.all(itemsToUse.map(async (item, index) => ({
          id: (index + 1).toString(),
          name: item.name,
          color: currentTheme.wheelColors[index % currentTheme.wheelColors.length],
          emoji: item.emoji || await getEmoji(item.name)
        })));
        
        newActivities = activitiesWithEmojis;
      } else {
        // For legacy "Kids Activity" or custom titles, generate random activities
        const newDefaultActivities = generateDefaultActivities(resetCount);
        newActivities = reassignAllColors(newDefaultActivities, currentTheme.wheelColors);
      }
      
      setActivities(newActivities);
      setShowResetConfirmation(false);
      // Clear any selected activity
      setSelectedActivity(null);
      setPreviousSelectedActivity(null);
      setNewlyAddedActivityId(null);
      
      console.log(`✅ Reset completed for "${currentTitle?.name || 'Kids Activity'}" with ${newActivities.length} items`);
    } catch (error) {
      console.error('Error during reset:', error);
      // Fallback to original behavior if something goes wrong
      const newDefaultActivities = generateDefaultActivities(resetCount);
      const themedActivities = reassignAllColors(newDefaultActivities, currentTheme.wheelColors);
      setActivities(themedActivities);
      setShowResetConfirmation(false);
      setSelectedActivity(null);
      setPreviousSelectedActivity(null);
      setNewlyAddedActivityId(null);
    }
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
    
    // Show interstitial ad every 3 spins (only if available)
    if (newSpinCount % 3 === 0 && showInterstitialAd) {
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

  const handleLoadActivities = async (loadedActivities: Activity[], title: string, titleEmoji?: string, themeInfo?: { themeId: string; customTheme?: any }) => {
    // Handle theme restoration if theme info is provided
    if (themeInfo) {
      try {
        if (themeInfo.themeId === 'custom' && themeInfo.customTheme) {
          // Restore custom theme
          await setCustomTheme(themeInfo.customTheme);
        } else {
          // Restore built-in theme
          await setTheme(themeInfo.themeId);
        }
        // Use the restored theme colors for activities
        const rethemedActivities = reassignAllColors(loadedActivities, 
          themeInfo.customTheme ? themeInfo.customTheme.colors : 
          getThemeById(themeInfo.themeId).wheelColors
        );
        setActivities(rethemedActivities);
      } catch (error) {
        console.error('Error restoring theme:', error);
        // Fallback: just apply current theme colors
        const rethemedActivities = reassignAllColors(loadedActivities, currentTheme.wheelColors);
        setActivities(rethemedActivities);
      }
    } else {
      // No theme info, use current theme colors
      const rethemedActivities = reassignAllColors(loadedActivities, currentTheme.wheelColors);
      setActivities(rethemedActivities);
    }
    
    if (currentTitle && title) {
      setCurrentTitle({ 
        ...currentTitle, 
        name: title,
        emoji: titleEmoji || currentTitle.emoji // Use saved emoji or fallback to current
      });
    } else if (title) {
      // If no current title but we have title data, create a basic title object
      setCurrentTitle({
        id: 'loaded-title',
        name: title,
        emoji: titleEmoji || '🎯', // Use saved emoji or default
        description: 'Loaded from save slot',
        category: TitleCategory.CUSTOM,
        items: loadedActivities,
        isCustom: true,
        isPredetermined: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        spinCount: 0
      });
    }
  };

  const handleCloseSaveLoad = () => {
    setShowSaveLoadModal(false);
  };

  // Helper function to get current custom theme data for saving
  const getCurrentCustomThemeData = async (): Promise<CustomThemeData | undefined> => {
    if (currentTheme.id === 'custom') {
      try {
        const customThemeData = await loadCustomTheme();
        return customThemeData || undefined;
      } catch (error) {
        console.error('Error loading custom theme data:', error);
        return undefined;
      }
    }
    return undefined;
  };

  const handleOpenTheme = () => {
    setShowThemeModal(true);
  };

  const handleCloseTheme = () => {
    setShowThemeModal(false);
  };

  const handleSaveLoad = (loadedActivities: Activity[]) => {
    const recoloredActivities = reassignAllColors(loadedActivities, currentTheme.wheelColors);
    setActivities(recoloredActivities);
  };

  // Title Management handlers
  const handleOpenHamburgerMenu = async () => {
    try {
      const recent = await TitleManager.getRecentlyUsedTitles(3);
      setRecentlyUsedTitles(recent);
      setShowHamburgerMenu(true);
    } catch (error) {
      console.error("Failed to load recent titles for menu:", error);
      setShowHamburgerMenu(true);
    }
  };

  const handleOpenTitleManagement = () => {
    setShowTitleManagementModal(true);
    setShowHamburgerMenu(false); // Close hamburger menu
  };

  const handleCloseTitleManagement = () => {
    setShowTitleManagementModal(false);
  };

  const handleOpenActivityManagement = () => {
    setOpenActivityListExternal(true);
  };

  // Helper function to get optimal count for different title categories
  const getOptimalCountForCategory = (category: string): number => {
    switch (category) {
      case 'food':
        return 12; // Meals - good variety without overwhelming choice
      case 'numbers':
        return 20; // Numbers - decent range for random selection
      case 'games':
        return 15; // Games/entertainment - enough variety for fun
      case 'education':
        return 10; // Study topics - manageable for focus
      case 'workplace':
        return 8; // Work activities - quick decision making
      case 'family':
        return 12; // Family activities - good variety for different interests
      case 'entertainment':
        return 15; // Movies/shows - enough options for browsing
      case 'decisions':
        return 8; // Simple decisions - quick choices
      case 'custom':
        return 8; // Custom titles - conservative default
      default:
        return 12; // General default
    }
  };

  // Helper function to get maximum items available for current wheel
  const getMaxItemsForCurrentWheel = (): number => {
    if (currentTitle && currentTitle.items) {
      return currentTitle.items.length;
    }
    // Fallback to 100 for legacy or undefined cases
    return 100;
  };

  // Helper function to get dynamic font size based on text length
  const getDynamicFontSize = (text: string): number => {
    const length = text.length;
    if (length <= 15) {
      return 28; // Original size for short titles
    } else if (length <= 25) {
      return 24; // Slightly smaller for medium titles
    } else if (length <= 35) {
      return 20; // Smaller for longer titles
    } else {
      return 18; // Minimum size for very long titles
    }
  };

  // Settings management functions
  const loadSettings = async (): Promise<AppSettings> => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    // Return default settings if loading fails
    return { soundMuted: false, language: 'en' };
  };

  const saveSettings = async (settings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setAppSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSoundMute = async () => {
    const newSettings = { ...appSettings, soundMuted: !appSettings.soundMuted };
    await saveSettings(newSettings);
    // Update the sound utilities mute state
    setSoundMuted(newSettings.soundMuted);
  };

  const handleSelectTitle = async (title: Title) => {
    try {
      setCurrentTitle(title);
      
      // Get optimal count for this category
      const optimalCount = getOptimalCountForCategory(title.category);
      
      // Take only the optimal number of items from the title
      const itemsToUse = title.items.slice(0, Math.min(optimalCount, title.items.length));
      
      // Add emojis to items that don't have them and apply current theme colors
      const activitiesWithEmojis = await Promise.all(itemsToUse.map(async (item, index) => ({
        id: (index + 1).toString(),
        name: item.name,
        color: currentTheme.wheelColors[index % currentTheme.wheelColors.length],
        emoji: item.emoji || await getEmoji(item.name)
      })));
      
      setActivities(activitiesWithEmojis);
      
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TITLE_ID, title.id);
      
      // Update the title's last used timestamp
      const updatedTitle = { ...title, lastUsed: new Date() };
      await TitleManager.saveTitle(updatedTitle);
      
      console.log(`✅ Title selected: "${title.name}" with ${activitiesWithEmojis.length}/${title.items.length} items (optimal for ${title.category})`);
    } catch (error) {
      console.error('Error selecting title:', error);
      
      // Fallback to original behavior if something goes wrong
      const activitiesWithCurrentTheme = reassignAllColors(title.items, currentTheme.wheelColors);
      setActivities(activitiesWithCurrentTheme);
    }
  };

  // New handlers for bulk functionality
  const handleAddActivities = async (activityNames: string[]) => {
    
    for (const name of activityNames) {
      try {
        // Get emoji for each activity
        const emoji = await getEmoji(name);
        
        // Create new activity
        const newActivity: Activity = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          color: currentTheme.wheelColors[0], // Temporary color, will be reassigned
          emoji,
        };
        
        // Add the new activity
        setActivities(prev => [...prev, newActivity]);
      } catch (error) {
        console.error('Error adding activity with emoji:', error);
        
        // Fallback without emoji
        const newActivity: Activity = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          color: currentTheme.wheelColors[0],
          emoji: '🎲',
        };
        
        setActivities(prev => [...prev, newActivity]);
      }
    }
    
    // Reassign all colors optimally after bulk addition
    setTimeout(() => {
      setActivities(prev => {
        const recoloredActivities = reassignAllColors(prev, currentTheme.wheelColors);
        return recoloredActivities;
      });
    }, 100);
  };

  const handleBulkAISuggest = async (count: number, category?: string) => {
    setIsLoadingBulkAI(true);
    
    try {
      const existingActivityNames = activities.map(a => a.name);
      const declinedSuggestions = await getDeclinedSuggestions();
      
      // Use the existing working single AI suggestion function multiple times
      // This avoids CORS issues and uses the proven working API endpoint
      const suggestions: string[] = [];
      const maxAttempts = count * 2; // Try more times to get enough unique suggestions
      let attempts = 0;
      
      while (suggestions.length < count && attempts < maxAttempts) {
        attempts++;
        
        try {
          // Use existing working function with current state and title context
          const allExisting = [...existingActivityNames, ...suggestions];
          const newSuggestion = await getAISuggestedActivity(
            allExisting, 
            declinedSuggestions,
            currentTitle?.name || 'Kids Activity',
            currentTitle?.category || 'family',
            currentTitle?.description || 'Random activities'
          );
          
          // Check if suggestion is unique
          if (!suggestions.includes(newSuggestion) && !existingActivityNames.includes(newSuggestion)) {
            suggestions.push(newSuggestion);
          }
        } catch (error) {
          console.error(`❌ Error getting suggestion ${attempts}:`, error);
          // Continue trying other suggestions
        }
      }
      
      setBulkAISuggestions(suggestions);
      
      if (suggestions.length === 0) {
        alert('Sorry, I couldn\'t generate activities right now. Please try again!');
      }
    } catch (error) {
      console.error('Error generating bulk AI suggestions:', error);
      alert('Sorry, I couldn\'t generate activities right now. Please try again!');
    } finally {
      setIsLoadingBulkAI(false);
    }
  };

  const handleAcceptBulkSuggestions = async (selectedActivities: string[]) => {
    await handleAddActivities(selectedActivities);
    setBulkAISuggestions([]);
  };

  const handleClearBulkSuggestions = () => {
    setBulkAISuggestions([]);
  };

  const renderContent = () => (
          <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]} onLayout={onLayout}>
            <View style={styles.contentWrapper}>
              
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
                activities={activities}
                onDeleteActivity={handleDeleteActivityByName}
                onAddActivities={handleAddActivities}
                onBulkAISuggest={handleBulkAISuggest}
                isLoadingBulkAI={isLoadingBulkAI}
                bulkAISuggestions={bulkAISuggestions}
                onAcceptBulkSuggestions={handleAcceptBulkSuggestions}
                onClearBulkSuggestions={handleClearBulkSuggestions}
                externalOpenActivityList={openActivityListExternal}
                onExternalOpenHandled={() => setOpenActivityListExternal(false)}
              />
              
                              <ThemedText style={[styles.subtitle, { color: currentTheme.uiColors.secondary }]}>✨ for AI suggestions, 📃 to manage more!</ThemedText>

              {containerWidth > 0 ? (
                <ErrorBoundary>
                  <RouletteWheel
                    activities={activities}
                    onActivitySelect={handleActivitySelect}
                    onActivityDelete={handleDeleteActivity}
                    onPreviousActivityChange={handlePreviousActivityChange}
                    parentWidth={containerWidth}
                    selectedActivity={selectedActivity}
                    newlyAddedActivityId={newlyAddedActivityId}
                    onNewActivityIndicatorComplete={handleNewActivityIndicatorComplete}
                    onReset={() => setShowResetConfirmation(true)}
                  />
                </ErrorBoundary>
              ) : (
                <ThemedText style={{textAlign: 'center', marginVertical: 20, color: currentTheme.uiColors.text}}>Loading wheel...</ThemedText>
              )}

              {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
            </View>
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
          {/* Fixed Header at Top */}
          <View style={[styles.fixedHeader, { 
            backgroundColor: currentTheme.backgroundColor,
            borderBottomColor: currentTheme.uiColors.secondary + '40'
          }]}>
            <View style={styles.headerContentWrapper}>
              {/* NEW: Header with hamburger menu */}
              <View style={styles.topHeader}>
                <ThemedText type="subtitle" style={[styles.appTitle, { color: currentTheme.uiColors.primary }]}>Spin2Pick</ThemedText>
                <TouchableOpacity onPress={handleOpenHamburgerMenu} style={styles.menuButton}>
                  <Ionicons name="menu" size={32} color={currentTheme.uiColors.primary} />
                </TouchableOpacity>
              </View>

              {/* NEW: Dynamic title header */}
              <View style={styles.dynamicTitleContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleEmoji}>{currentTitle?.emoji || '🎯'}</Text>
                  <ThemedText 
                    type="title" 
                    style={[
                      styles.dynamicTitle, 
                      { 
                        color: currentTheme.uiColors.primary,
                        fontSize: getDynamicFontSize(currentTitle?.name || 'Kids Activity')
                      }
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.7}
                  >
                    {currentTitle?.name || 'Kids Activity'}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => setShowTitleDescription(!showTitleDescription)}>
                  <ThemedText style={[styles.titleDescription, { color: currentTheme.uiColors.secondary }]}>
                    {showTitleDescription 
                      ? (currentTitle?.description || 'Fun activities for kids of all ages') 
                      : `${currentTitle?.items?.length || activities.length} activities • Tap for details`
                    }
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
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
            <Text allowFontScaling={false} style={[styles.popupTitle, { color: currentTheme.uiColors.primary }]}>Reset Picks 🔄</Text>
            <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary }]}>
              {currentTitle && currentTitle.isPredetermined 
                ? `How many items from "${currentTitle.name}" do you want?`
                : 'How many random picks do you want?'}
            </Text>
            <Text allowFontScaling={false} style={[styles.popupMessage, { color: currentTheme.uiColors.secondary, fontSize: 14, textAlign: 'center', marginTop: -5, marginBottom: 15 }]}>
              (Max {getMaxItemsForCurrentWheel()} for this wheel)
            </Text>
            <TextInput
              style={[styles.resetCountInput, { 
                borderColor: currentTheme.uiColors.primary,
                color: currentTheme.uiColors.text,
              }]}
              keyboardType="numeric"
              onChangeText={(text: string) => {
                const num = parseInt(text, 10);
                const maxItems = getMaxItemsForCurrentWheel();
                if (!isNaN(num) && num > 0 && num <= maxItems) {
                  setResetCount(num);
                } else if (text === '') {
                  setResetCount(0); // Allow empty input temporarily
                }
                // Silently ignore invalid values (negative, zero, or above max)
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
              {currentTitle && currentTitle.isPredetermined 
                ? `Current picks will be replaced with ${resetCount} items from "${currentTitle.name}".`
                : `Current picks will be deleted and replaced with ${resetCount} random picks.`}
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
        currentTitle={currentTitle?.name || ''}
        currentTitleEmoji={currentTitle?.emoji}
        onLoadActivities={handleLoadActivities}
        currentThemeId={currentTheme.id}
        getCurrentCustomThemeData={getCurrentCustomThemeData}
      />
      
      {/* Hamburger Menu */}
      <HamburgerMenu
        visible={showHamburgerMenu}
        onClose={() => setShowHamburgerMenu(false)}
        onNavigateToTitleManagement={handleOpenTitleManagement}
        onNavigateToActivityManagement={handleOpenActivityManagement}
        onNavigateToSettings={() => {/* TODO: Implement */}}
        onNavigateToThemes={() => setShowThemeModal(true)}
        onNavigateToSaveLoad={() => setShowSaveLoadModal(true)}
        onExportData={() => {/* TODO: Implement */}}
        onToggleSoundMute={toggleSoundMute}
        recentlyUsedTitles={recentlyUsedTitles}
        onSelectTitle={handleSelectTitle}
        isSoundMuted={appSettings.soundMuted}
      />
      
      {/* Title Management Modal */}
      <TitleManagementModal
        visible={showTitleManagementModal}
        onClose={handleCloseTitleManagement}
        onSelectTitle={handleSelectTitle}
        currentTitle={currentTitle}
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
  fixedHeader: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    zIndex: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center', // Center the content wrapper
  },
  headerContentWrapper: {
    width: '100%',
    maxWidth: 350, // Match the content wrapper width
    paddingHorizontal: 10,
  },
  container: {
    width: '100%',
    alignItems: 'center', // Center the content wrapper
    padding: 0,
    paddingTop: 20, // Add top padding since header is now fixed
    paddingBottom: 10,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 350, // Limit max width like other RN Web apps
    alignItems: 'stretch', // Don't constrain child widths
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
    marginTop: 10,
    marginBottom: 10,
    fontFamily: FONTS.jua,
  },
  // NEW: Top header styles
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 1,
    backgroundColor: 'transparent',
  },
  appTitle: {
    fontSize: 18,
    fontFamily: FONTS.jua,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    fontFamily: FONTS.jua,
  },
  // NEW: Dynamic title styles
  dynamicTitleContainer: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  dynamicTitle: {
    fontSize: 28, // Default size, will be overridden dynamically
    fontFamily: FONTS.jua,
    textAlign: 'center',
    flex: 1, // Allow text to use available space
  },
  titleDescription: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
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