import { Platform } from 'react-native';

// Check if AdMob package is available
let isPackageAvailable = false;
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
  isPackageAvailable = true;
  console.log('AdMob package loaded successfully');
} catch (error) {
  console.log('AdMob package not available - using fallback mode');
  isPackageAvailable = false;
}

// Test IDs for development - replace with your real Ad Unit IDs in production
export const AD_UNIT_IDS = {
  banner: isPackageAvailable && __DEV__ 
    ? TestIds?.ADAPTIVE_BANNER || 'test-banner'
    : Platform.OS === 'ios' 
      ? 'ca-app-pub-XXXXXXXX/XXXXXXXXXX' // Your iOS banner ad unit ID
      : 'ca-app-pub-XXXXXXXX/XXXXXXXXXX', // Your Android banner ad unit ID
  
  interstitial: isPackageAvailable && __DEV__ 
    ? TestIds?.INTERSTITIAL || 'test-interstitial'
    : Platform.OS === 'ios' 
      ? 'ca-app-pub-XXXXXXXX/XXXXXXXXXX' // Your iOS interstitial ad unit ID
      : 'ca-app-pub-XXXXXXXX/XXXXXXXXXX', // Your Android interstitial ad unit ID
};

// Initialize interstitial ad
let interstitialAd: any = null;

export const isAdMobAvailable = (): boolean => {
  return isPackageAvailable && mobileAdsModule !== null && InterstitialAd !== null;
};

export const initializeInterstitialAd = () => {
  if (!isAdMobAvailable()) {
    console.log('AdMob not available - skipping interstitial ad initialization');
    return;
  }

  try {
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
  } catch (error) {
    console.error('Error initializing interstitial ad:', error);
  }
};

export const loadInterstitialAd = () => {
  if (!isAdMobAvailable() || !interstitialAd) {
    return;
  }
  try {
    interstitialAd.load();
  } catch (error) {
    console.error('Error loading interstitial ad:', error);
  }
};

export const showInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isAdMobAvailable()) {
      console.log('AdMob not available - skipping interstitial ad');
      resolve(false);
      return;
    }

    try {
      if (interstitialAd && interstitialAd.loaded) {
        interstitialAd.show();
        resolve(true);
      } else {
        console.log('Interstitial ad not ready');
        resolve(false);
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      resolve(false);
    }
  });
};

export const isInterstitialLoaded = (): boolean => {
  if (!isAdMobAvailable()) {
    return false;
  }
  try {
    return interstitialAd ? interstitialAd.loaded : false;
  } catch (error) {
    console.error('Error checking interstitial ad status:', error);
    return false;
  }
}; 