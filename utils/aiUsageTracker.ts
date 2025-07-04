import AsyncStorage from '@react-native-async-storage/async-storage';
import { canShowInterstitialAd, showInterstitialAd } from './adMobUtils';

// Storage keys for AI usage tracking
const AI_USAGE_KEY = 'SPIN2PICK_AI_USAGE_COUNT';
const AI_LAST_AD_KEY = 'SPIN2PICK_AI_LAST_AD_TIME';
const AI_TOTAL_ADS_KEY = 'SPIN2PICK_AI_TOTAL_ADS_SHOWN';

// Progressive frequency thresholds for showing interstitial ads
const AD_THRESHOLDS = [5, 9, 12]; // 1st ad after 5 uses, 2nd after 9 total, 3rd after 12 total
const ONGOING_FREQUENCY = 3; // After 3rd ad, show every 3 AI uses

export interface AIUsageStats {
  totalUsage: number;
  totalAdsShown: number;
  lastAdTime: number;
  nextAdThreshold: number;
  usageUntilNextAd: number;
}

/**
 * AI Feature Types for tracking
 */
export enum AIFeatureType {
  SINGLE_SUGGESTION = 'single_suggestion',
  BULK_SUGGESTION = 'bulk_suggestion', 
  AI_COLORS = 'ai_colors',
  CUSTOM_WHEEL_CREATION = 'custom_wheel_creation'
}

/**
 * Initialize AI usage tracking (call on app start)
 */
export const initializeAIUsageTracking = async (): Promise<void> => {
  try {
    const usage = await AsyncStorage.getItem(AI_USAGE_KEY);
    if (!usage) {
      // First time setup
      await AsyncStorage.setItem(AI_USAGE_KEY, '0');
      await AsyncStorage.setItem(AI_TOTAL_ADS_KEY, '0');
      await AsyncStorage.setItem(AI_LAST_AD_KEY, '0');
      console.log('🤖 AI usage tracking initialized');
    } else {
      console.log(`🤖 AI usage tracking loaded: ${usage} total uses`);
    }
  } catch (error) {
    console.error('Error initializing AI usage tracking:', error);
  }
};

/**
 * Get current AI usage statistics
 */
export const getAIUsageStats = async (): Promise<AIUsageStats> => {
  try {
    const totalUsage = parseInt(await AsyncStorage.getItem(AI_USAGE_KEY) || '0');
    const totalAdsShown = parseInt(await AsyncStorage.getItem(AI_TOTAL_ADS_KEY) || '0');
    const lastAdTime = parseInt(await AsyncStorage.getItem(AI_LAST_AD_KEY) || '0');
    
    // Calculate next ad threshold
    let nextAdThreshold: number;
    if (totalAdsShown < AD_THRESHOLDS.length) {
      nextAdThreshold = AD_THRESHOLDS[totalAdsShown];
    } else {
      // After initial thresholds, use ongoing frequency
      const lastThreshold = AD_THRESHOLDS[AD_THRESHOLDS.length - 1];
      const additionalAds = totalAdsShown - AD_THRESHOLDS.length;
      nextAdThreshold = lastThreshold + (additionalAds + 1) * ONGOING_FREQUENCY;
    }
    
    const usageUntilNextAd = Math.max(0, nextAdThreshold - totalUsage);
    
    return {
      totalUsage,
      totalAdsShown,
      lastAdTime,
      nextAdThreshold,
      usageUntilNextAd
    };
  } catch (error) {
    console.error('Error getting AI usage stats:', error);
    return {
      totalUsage: 0,
      totalAdsShown: 0,
      lastAdTime: 0,
      nextAdThreshold: AD_THRESHOLDS[0],
      usageUntilNextAd: AD_THRESHOLDS[0]
    };
  }
};

/**
 * Increment AI usage count and check if ad should be shown
 */
export const trackAIUsage = async (
  featureType: AIFeatureType,
  context?: string
): Promise<boolean> => {
  try {
    const stats = await getAIUsageStats();
    const newUsage = stats.totalUsage + 1;
    
    // Update usage count
    await AsyncStorage.setItem(AI_USAGE_KEY, newUsage.toString());
    
    console.log(`🤖 AI ${featureType} used (${newUsage} total uses)${context ? ` - ${context}` : ''}`);
    
    // Check if we should show an interstitial ad
    const shouldShowAd = newUsage >= stats.nextAdThreshold;
    
    if (shouldShowAd) {
      console.log(`📺 AI usage threshold reached (${newUsage}/${stats.nextAdThreshold}) - attempting to show ad`);
      
      // Check AdMob session limits and cooldowns (only if AdMob is available)
      if (canShowInterstitialAd && canShowInterstitialAd()) {
        const adShown = showInterstitialAd ? await showInterstitialAd() : false;
        
        if (adShown) {
          // Update ad tracking
          const newAdsShown = stats.totalAdsShown + 1;
          await AsyncStorage.setItem(AI_TOTAL_ADS_KEY, newAdsShown.toString());
          await AsyncStorage.setItem(AI_LAST_AD_KEY, Date.now().toString());
          
          console.log(`✅ Interstitial ad shown after AI usage (${newAdsShown} total ads)`);
          
          // Log analytics data for future premium upsell
          if (newAdsShown >= 3) {
            console.log('💎 Premium upsell opportunity - user has seen 3+ ads');
          }
          
          return true;
        } else {
          console.log('⚠️ Ad failed to show - will retry on next threshold');
        }
      } else if (canShowInterstitialAd && typeof canShowInterstitialAd === 'function') {
        console.log('⏳ Ad blocked by session limits/cooldown');
      } else {
        console.log('📱 AdMob not available in development and web environment');
      }
    } else {
      const remaining = stats.nextAdThreshold - newUsage;
      console.log(`📊 AI usage: ${remaining} more uses until next ad`);
    }
    
    return false;
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    return false;
  }
};

/**
 * Reset AI usage tracking (for testing or premium users)
 */
export const resetAIUsageTracking = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AI_USAGE_KEY, AI_LAST_AD_KEY, AI_TOTAL_ADS_KEY]);
    await initializeAIUsageTracking();
    console.log('🔄 AI usage tracking reset');
  } catch (error) {
    console.error('Error resetting AI usage tracking:', error);
  }
};

/**
 * Get debug information for AI usage tracking
 */
export const getAIUsageDebugInfo = async (): Promise<string> => {
  try {
    const stats = await getAIUsageStats();
    const canShow = canShowInterstitialAd();
    
    return `
🤖 AI Usage Debug Info:
📊 Total AI uses: ${stats.totalUsage}
📺 Total ads shown: ${stats.totalAdsShown}
🎯 Next ad threshold: ${stats.nextAdThreshold}
⏰ Uses until next ad: ${stats.usageUntilNextAd}
✅ Can show ad now: ${canShow}
🕐 Last ad time: ${stats.lastAdTime ? new Date(stats.lastAdTime).toLocaleString() : 'Never'}
`.trim();
  } catch (error) {
    return `Error getting debug info: ${error}`;
  }
};

/**
 * Check if user qualifies for premium upsell (seen multiple ads)
 */
export const shouldShowPremiumUpsell = async (): Promise<boolean> => {
  try {
    const stats = await getAIUsageStats();
    // Show premium upsell after user has seen 3+ interstitial ads
    return stats.totalAdsShown >= 3;
  } catch (error) {
    console.error('Error checking premium upsell eligibility:', error);
    return false;
  }
};

/**
 * Check if AdMob is available in current environment
 */
export const isAdMobAvailable = (): boolean => {
  return typeof canShowInterstitialAd === 'function' && typeof showInterstitialAd === 'function';
};