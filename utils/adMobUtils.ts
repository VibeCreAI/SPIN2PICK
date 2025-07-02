// AdMob utilities with proper EAS build support

// Check if we're in Expo Go
let isExpoGo = false;
try {
  const Constants = require('expo-constants');
  isExpoGo = Constants.appOwnership === 'expo';
} catch (e) {
  // Constants not available, assume development
  isExpoGo = true;
}

// Check if AdMob package is available (only in EAS builds)
let isPackageAvailable: boolean = false;
let BannerAd: any = null;
let InterstitialAd: any = null;
let TestIds: any = null;
let AdEventType: any = null;

if (!isExpoGo) {
  try {
    const adMobPackage = require('react-native-google-mobile-ads');
    BannerAd = adMobPackage.BannerAd;
    InterstitialAd = adMobPackage.InterstitialAd;
    TestIds = adMobPackage.TestIds;
    AdEventType = adMobPackage.AdEventType;
    isPackageAvailable = true;
    console.log('AdMob package loaded successfully');
  } catch (error) {
    console.log('AdMob package not available:', error);
    isPackageAvailable = false;
  }
}

export const isAdMobAvailable = (): boolean => {
  return !isExpoGo && isPackageAvailable;
};

// Return real or test ad unit IDs based on environment
export const getAdUnitIds = () => {
  const isDev = __DEV__;
  
  if (!isAdMobAvailable() || isDev) {
    return {
      banner: TestIds?.BANNER || 'test-banner-id',
      interstitial: TestIds?.INTERSTITIAL || 'test-interstitial-id'
    };
  }
  
  return {
    banner: 'ca-app-pub-7239598551330509/4053464457', // Your real banner ID
    interstitial: 'ca-app-pub-7239598551330509/1234567890' // Replace with your interstitial ID
  };
};

// Interstitial ad instance
let interstitialAd: any = null;

export const initializeInterstitialAd = () => {
  if (!isAdMobAvailable() || !InterstitialAd) {
    console.log('AdMob initialization skipped - not available');
    return;
  }
  
  try {
    const adUnitIds = getAdUnitIds();
    interstitialAd = InterstitialAd.createForAdRequest(adUnitIds.interstitial);
    
    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
    });
    
    interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error('Interstitial ad error:', error);
    });
    
    interstitialAd.load();
    console.log('AdMob interstitial initialized');
  } catch (error) {
    console.error('Error initializing interstitial ad:', error);
  }
};

export const loadInterstitialAd = () => {
  if (!isAdMobAvailable() || !interstitialAd) {
    console.log('AdMob loading skipped - not available');
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
    if (!isAdMobAvailable() || !interstitialAd) {
      console.log('AdMob show skipped - not available');
      resolve(false);
      return;
    }
    
    try {
      if (interstitialAd.loaded) {
        interstitialAd.show();
        resolve(true);
      } else {
        console.log('Interstitial ad not loaded yet');
        resolve(false);
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      resolve(false);
    }
  });
};

export const isInterstitialLoaded = (): boolean => {
  if (!isAdMobAvailable() || !interstitialAd) {
    return false;
  }
  
  try {
    return interstitialAd.loaded;
  } catch (error) {
    console.error('Error checking interstitial ad status:', error);
    return false;
  }
};

// Export the AdMob components for use in other files
export { BannerAd, TestIds, AdEventType };