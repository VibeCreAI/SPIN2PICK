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
    interstitial: 'ca-app-pub-7239598551330509/6947827311' // Your real interstitial ID
  };
};

// Interstitial ad instance and session management
let interstitialAd: any = null;
let lastAdShownTime: number = 0;
let adsShownThisSession: number = 0;
const AD_COOLDOWN_MINUTES = 5;
const MAX_ADS_PER_SESSION = 2;

export const initializeInterstitialAd = () => {
  if (!isAdMobAvailable() || !InterstitialAd) {
    console.log('AdMob initialization skipped - not available');
    return;
  }
  
  try {
    const adUnitIds = getAdUnitIds();
    interstitialAd = InterstitialAd.createForAdRequest(adUnitIds.interstitial);
    
    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded successfully');
    });
    
    interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error('❌ Interstitial ad error:', error);
      // Auto-retry loading after error
      setTimeout(() => {
        if (interstitialAd && !interstitialAd.loaded) {
          console.log('🔄 Retrying interstitial ad load...');
          loadInterstitialAd();
        }
      }, 5000);
    });
    
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('📺 Interstitial ad closed - loading next ad');
      lastAdShownTime = Date.now();
      adsShownThisSession++;
      // Preload next ad for future use
      setTimeout(() => loadInterstitialAd(), 1000);
    });
    
    interstitialAd.load();
    console.log('🚀 AdMob interstitial initialized');
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

// Enhanced interstitial showing with session management
export const canShowInterstitialAd = (): boolean => {
  // Check session limits
  if (adsShownThisSession >= MAX_ADS_PER_SESSION) {
    console.log('📺 Session ad limit reached');
    return false;
  }
  
  // Check cooldown period
  const timeSinceLastAd = Date.now() - lastAdShownTime;
  const cooldownMs = AD_COOLDOWN_MINUTES * 60 * 1000;
  if (timeSinceLastAd < cooldownMs) {
    const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastAd) / 60000);
    console.log(`⏱️ Ad cooldown: ${remainingMinutes} minutes remaining`);
    return false;
  }
  
  return true;
};

export const showInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isAdMobAvailable() || !interstitialAd) {
      console.log('AdMob show skipped - not available');
      resolve(false);
      return;
    }
    
    // Check session limits and cooldown
    if (!canShowInterstitialAd()) {
      resolve(false);
      return;
    }
    
    try {
      if (interstitialAd.loaded) {
        console.log('📺 Showing interstitial ad');
        interstitialAd.show();
        resolve(true);
      } else {
        console.log('⏳ Interstitial ad not loaded yet');
        // Try to load and show after a short delay
        loadInterstitialAd();
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