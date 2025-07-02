import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BannerAd, getAdUnitIds, isAdMobAvailable } from '../utils/adMobUtils';

// Import BannerAdSize from react-native-google-mobile-ads if available
let BannerAdSize: any = null;

try {
  if (isAdMobAvailable()) {
    const adMobPackage = require('react-native-google-mobile-ads');
    BannerAdSize = adMobPackage.BannerAdSize;
  }
} catch (error) {
  console.log('BannerAdSize not available:', error);
}

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

  // If AdMob is not available (Expo Go or development), show a placeholder
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