import React from 'react';

interface AdBannerProps {
  size?: any;
}

// Web version - Hide ads until AdSense approval
export const AdBanner: React.FC<AdBannerProps> = () => {
  // Hide ads on web until AdSense approval - no impact on mobile/Android
  return null;
}; 