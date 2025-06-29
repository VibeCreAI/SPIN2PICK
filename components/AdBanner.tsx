import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { getAdUnitIds, isAdMobAvailable } from '../utils/adMobUtils';

// Conditional import for AdMob components
let BannerAd: any = null;
let BannerAdSize: any = null;

// Always disable AdMob for Expo Go compatibility
console.log('AdMob disabled for Expo Go compatibility');

// Check if we're in Expo Go first
let isExpoGo = true; // Force to true for now
try {
  const Constants = require('expo-constants');
  isExpoGo = Constants.appOwnership === 'expo' || true; // Always true for now
} catch (e) {
  // Constants not available, assume Expo Go
  isExpoGo = true;
}

// Never load AdMob modules for now
console.log('AdMob modules disabled - using placeholder mode');

interface AdBannerProps {
  size?: any; // Using any since BannerAdSize might not be available
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size 
}) => {
  // Hide ads on web until AdSense approval
  if (Platform.OS === 'web') {
    return null;
  }

  // If AdMob is not available (Expo Go), show a placeholder
  if (!isAdMobAvailable() || !BannerAd) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text allowFontScaling={false} style={styles.placeholderText}>
            📱 AdMob Banner (Development Mode)
          </Text>
        </View>
      </View>
    );
  }

  const adUnitIds = getAdUnitIds();
  
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitIds.banner}
        size={size || BannerAdSize?.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error: any) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f3efff',
    paddingVertical: 10,
  },
  placeholder: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 