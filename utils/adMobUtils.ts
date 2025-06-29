// AdMob utilities - completely disabled for Expo Go compatibility

// Always disable AdMob for Expo Go compatibility
let isPackageAvailable: boolean = false;

// Always return false for Expo Go compatibility
export const isAdMobAvailable = (): boolean => {
  console.log('AdMob disabled for Expo Go compatibility');
  return false;
};

// Return placeholder ad unit IDs
export const getAdUnitIds = () => {
  return {
    banner: 'test-banner-id',
    interstitial: 'test-interstitial-id'
  };
};

// No-op functions for Expo Go compatibility
export const initializeInterstitialAd = () => {
  console.log('AdMob initialization skipped - Expo Go mode');
};

export const loadInterstitialAd = () => {
  console.log('AdMob loading skipped - Expo Go mode');
};

export const showInterstitialAd = (): Promise<boolean> => {
  console.log('AdMob show skipped - Expo Go mode');
  return Promise.resolve(false);
};

export const isInterstitialLoaded = (): boolean => {
  return false;
};