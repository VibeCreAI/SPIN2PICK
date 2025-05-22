import { Platform } from 'react-native';

// Conditional import to handle Expo Go vs development build
let mobileAdsModule: any = null;
let TestIds: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  mobileAdsModule = mobileAds.default;
  TestIds = mobileAds.TestIds;
  InterstitialAd = mobileAds.InterstitialAd;
  AdEventType = mobileAds.AdEventType;
} catch (error) {
  console.log('AdMob module not available - running in Expo Go mode');
}

// Test IDs for development - replace with your real Ad Unit IDs in production
export const AD_UNIT_IDS = {
  banner: __DEV__ 
    ? TestIds?.ADAPTIVE_BANNER || 'test-banner'
    : Platform.OS === 'ios' 
      ? 'ca-app-pub-XXXXXXXX/XXXXXXXXXX' // Your iOS banner ad unit ID
      : 'ca-app-pub-XXXXXXXX/XXXXXXXXXX', // Your Android banner ad unit ID
  
  interstitial: __DEV__ 
    ? TestIds?.INTERSTITIAL || 'test-interstitial'
    : Platform.OS === 'ios' 
      ? 'ca-app-pub-XXXXXXXX/XXXXXXXXXX' // Your iOS interstitial ad unit ID
      : 'ca-app-pub-XXXXXXXX/XXXXXXXXXX', // Your Android interstitial ad unit ID
};

// Initialize interstitial ad
let interstitialAd: any = null;

export const isAdMobAvailable = (): boolean => {
  return mobileAdsModule !== null && InterstitialAd !== null;
};

export const initializeInterstitialAd = () => {
  if (!isAdMobAvailable()) {
    console.log('AdMob not available - skipping interstitial ad initialization');
    return;
  }

  interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
  
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial ad loaded');
  });
  
  interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
    console.error('Interstitial ad error:', error);
  });
  
  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Interstitial ad closed');
    // Reload the ad for next use
    loadInterstitialAd();
  });
  
  loadInterstitialAd();
};

export const loadInterstitialAd = () => {
  if (!isAdMobAvailable() || !interstitialAd) {
    return;
  }
  interstitialAd.load();
};

export const showInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isAdMobAvailable()) {
      console.log('AdMob not available - simulating interstitial ad');
      resolve(false);
      return;
    }

    if (interstitialAd && interstitialAd.loaded) {
      interstitialAd.show();
      resolve(true);
    } else {
      console.log('Interstitial ad not ready');
      resolve(false);
    }
  });
};

export const isInterstitialLoaded = (): boolean => {
  if (!isAdMobAvailable()) {
    return false;
  }
  return interstitialAd ? interstitialAd.loaded : false;
}; 