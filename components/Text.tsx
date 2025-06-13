import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Global Text component that automatically disables font scaling.
 * 
 * This component replaces React Native's default Text component throughout
 * the app to ensure that Android system font scaling doesn't affect the UI layout.
 * 
 * Usage:
 * Instead of: import { Text } from 'react-native';
 * Use: import { Text } from '@/components/Text';
 * 
 * Or set up a path alias to automatically use this component.
 */
const Text: React.FC<TextProps> = ({ allowFontScaling, ...props }) => {
  return (
    <RNText 
      allowFontScaling={false} // Always disable font scaling
      {...props} 
    />
  );
};

export default Text;
export { Text };
