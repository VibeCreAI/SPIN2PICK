// Web version - no AdMob functionality
export const AD_UNIT_IDS = {
  banner: 'web-placeholder-banner',
  interstitial: 'web-placeholder-interstitial',
};

export const isAdMobAvailable = (): boolean => {
  return false;
};

export const initializeInterstitialAd = () => {
  console.log('AdMob not available on web platform');
};

export const loadInterstitialAd = () => {
  console.log('AdMob not available on web platform');
};

export const showInterstitialAd = (): Promise<boolean> => {
  return Promise.resolve(false);
};

export const isInterstitialLoaded = (): boolean => {
  return false;
}; 