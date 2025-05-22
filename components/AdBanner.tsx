import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AD_UNIT_IDS, isAdMobAvailable } from '../utils/adMobUtils';

// Conditional import for AdMob components
let BannerAd: any = null;
let BannerAdSize: any = null;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  BannerAd = mobileAds.BannerAd;
  BannerAdSize = mobileAds.BannerAdSize;
} catch (error) {
  console.log('AdMob BannerAd not available - running in Expo Go mode');
}

interface AdBannerProps {
  size?: any; // Using any since BannerAdSize might not be available
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size 
}) => {
  // If AdMob is not available (Expo Go), show a placeholder
  if (!isAdMobAvailable() || !BannerAd) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            📱 AdMob Banner (Development Mode)
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
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