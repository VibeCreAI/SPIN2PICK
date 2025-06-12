
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

// Your actual Ad Unit IDs
export const AD_UNIT_IDS = {
  banner: isPackageAvailable && __DEV__ 
    ? TestIds?.ADAPTIVE_BANNER || 'test-banner'
    : 'ca-app-pub-7239598551330509/4053464457', // Your banner ad unit ID
  
  interstitial: isPackageAvailable && __DEV__ 
    ? TestIds?.INTERSTITIAL || 'test-interstitial'
    : 'ca-app-pub-7239598551330509/4053464457', // Using same ID for now - you may want to create a separate interstitial ad unit
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