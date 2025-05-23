import { FONTS } from '@/app/_layout';
import { ActivityInput } from '@/components/ActivityInput';
import { AdBanner } from '@/components/AdBanner';
import { Celebration } from '@/components/Celebration';
import { RouletteWheel } from '@/components/RouletteWheel';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { initializeInterstitialAd, showInterstitialAd } from '../utils/adMobUtils';
import { getEmoji } from '../utils/emojiUtils';
import { initSounds, unloadSounds } from '../utils/soundUtils';

// Updated pastel colors to match reference image
const PASTEL_COLORS = [
  '#9fe7f5', // Light Blue (Sing Songs)
  '#94c4f5', // Blue (Craft Corner)
  '#b79ff5', // Purple (Jump Trampoline)
  '#f59fdc', // Pink (Plant Seeds)
  '#f59f9f', // Coral (Hide and Seek)
  '#f5c09f', // Light Orange (Dance Party)
  '#f5ea9f', // Light Yellow (Puzzle Time)
  '#c4f59f', // Light Green (Read a Book)
];

const DEFAULT_ACTIVITIES = [
  { id: '1', name: 'Sing Songs', color: PASTEL_COLORS[0], emoji: '🎤' },
  { id: '2', name: 'Craft Corner', color: PASTEL_COLORS[1], emoji: '🎨' },
  { id: '3', name: 'Jump Trampoline', color: PASTEL_COLORS[2], emoji: '🏂' },
  { id: '4', name: 'Plant Seeds', color: PASTEL_COLORS[3], emoji: '🌱' },
  { id: '5', name: 'Hide and Seek', color: PASTEL_COLORS[4], emoji: '🙈' },
  { id: '6', name: 'Dance Party', color: PASTEL_COLORS[5], emoji: '💃' },
  { id: '7', name: 'Puzzle Time', color: PASTEL_COLORS[6], emoji: '🧩' },
  { id: '8', name: 'Read a Book', color: PASTEL_COLORS[7], emoji: '📚' },
];

const STORAGE_KEY = 'PICK2PLAY_ACTIVITIES';
const SPIN_COUNT_KEY = 'PICK2PLAY_SPIN_COUNT';

export default function HomeScreen() {
  const [activities, setActivities] = useState<Array<{ id: string; name: string; color: string; emoji?: string }>>(DEFAULT_ACTIVITIES);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<{ id: string; name: string; color: string; emoji?: string } | null>(null);
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
          setActivities(JSON.parse(savedActivities));
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
      
      // Create new activity with emoji
      const newActivity = {
        id: Date.now().toString(),
        name,
        color: PASTEL_COLORS[activities.length % PASTEL_COLORS.length],
        emoji,
      };
      
      setActivities([...activities, newActivity]);
    } catch (error) {
      console.error('Error adding activity with emoji:', error);
      
      // Fallback to adding without emoji if there's an error
      const newActivity = {
        id: Date.now().toString(),
        name,
        color: PASTEL_COLORS[activities.length % PASTEL_COLORS.length],
        emoji: '🎲', // Default fallback
      };
      
      setActivities([...activities, newActivity]);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleActivitySelect = async (activity: { id: string; name: string; color: string; emoji?: string }) => {
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

  return (
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
          <RouletteWheel
            activities={activities}
            onActivitySelect={handleActivitySelect}
            onActivityDelete={handleDeleteActivity}
            parentWidth={containerWidth}
            selectedActivity={selectedActivity}
          />
        ) : (
          <ThemedText style={{textAlign: 'center', marginVertical: 20}}>Loading wheel...</ThemedText>
        )}

        {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}

        <View style={styles.footer}>
          <ThemedText style={styles.copyright}>
            © {new Date().getFullYear()} Creative Kang - All rights reserved
          </ThemedText>
        </View>
      </View>
      
      {/* Banner Ad at the bottom */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f3efff',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    paddingBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
    color: '#4e4370',
    fontFamily: FONTS.gamjaFlower,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontFamily: FONTS.nunito,
  },
  footer: {
    marginTop: 'auto',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
}); 