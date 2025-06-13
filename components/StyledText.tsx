import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Custom Text component that automatically disables font scaling
 * to prevent Android system font size settings from affecting the app layout.
 * 
 * This component should be used instead of React Native's Text component
 * throughout the app to ensure consistent text rendering.
 */
export const Text: React.FC<TextProps> = ({ allowFontScaling, ...props }) => {
  return (
    <RNText 
      allowFontScaling={false} // Always disable font scaling
      {...props} 
    />
  );
};

// Also export as default for convenience
export default Text; 