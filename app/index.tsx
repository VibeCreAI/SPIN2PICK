import { FONTS } from '@/app/_layout';
import { ActivityInput } from '@/components/ActivityInput';
import { AdBanner } from '@/components/AdBanner';
import { Celebration } from '@/components/Celebration';
import { RouletteWheel } from '@/components/RouletteWheel';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initializeInterstitialAd, showInterstitialAd } from '../utils/adMobUtils';
import { PASTEL_COLORS, reassignAllColors, type Activity } from '../utils/colorUtils';
import { getEmoji } from '../utils/emojiUtils';
import { initSounds, unloadSounds } from '../utils/soundUtils';

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: '1', name: 'Sing Songs', color: PASTEL_COLORS[0], emoji: '🎤' },      // Light Blue
  { id: '2', name: 'Craft Corner', color: PASTEL_COLORS[1], emoji: '🎨' },   // Pink
  { id: '3', name: 'Jump Trampoline', color: PASTEL_COLORS[2], emoji: '🤸' }, // Light Green
  { id: '4', name: 'Plant Seeds', color: PASTEL_COLORS[3], emoji: '🌱' },     // Light Orange
  { id: '5', name: 'Hide and Seek', color: PASTEL_COLORS[4], emoji: '🙈' },  // Purple
  { id: '6', name: 'Dance Party', color: PASTEL_COLORS[5], emoji: '💃' },    // Light Yellow
  { id: '7', name: 'Puzzle Time', color: PASTEL_COLORS[6], emoji: '🧩' },    // Blue
  { id: '8', name: 'Read a Book', color: PASTEL_COLORS[7], emoji: '📚' },    // Coral
];

const STORAGE_KEY = 'PICK2PLAY_ACTIVITIES';
const SPIN_COUNT_KEY = 'PICK2PLAY_SPIN_COUNT';

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
  const [spinCount, setSpinCount] = useState(0);

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
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteActivity = (id: string) => {
    const activitiesAfterDeletion = activities.filter(activity => activity.id !== id);
    const recoloredActivities = reassignAllColors(activitiesAfterDeletion);
    setActivities(recoloredActivities);
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

  const handlePreviousActivityChange = (activity: Activity | null) => {
    setPreviousSelectedActivity(activity);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.mainContainer}>
          <View style={styles.container} onLayout={onLayout}>
            <ThemedText type="title" style={styles.title}>PICK2PLAY</ThemedText>
            <ThemedText style={styles.subtitle}>Spin the wheel for your next adventure!</ThemedText>
            
            <ActivityInput
              onAddActivity={handleAddActivity}
              existingActivities={activities.map(a => a.name)}
              isLoading={isAddingActivity}
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
                    />
                  </ErrorBoundary>
                );
              })()
            ) : (
              <ThemedText style={{textAlign: 'center', marginVertical: 20}}>Loading wheel...</ThemedText>
            )}

            {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Fixed elements that shouldn't move with keyboard */}
      <View style={styles.fixedBottomContainer}>
        {/* Banner Ad at the bottom */}
        <AdBanner />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3efff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f3efff',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },
  title: {
    fontSize: 52,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
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
}); 