const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver alias to automatically use our custom Text component
config.resolver.alias = {
  ...config.resolver.alias,
  // Uncomment the line below to globally override React Native's Text component
  // 'react-native/Libraries/Text/Text': path.resolve(__dirname, 'components/Text.tsx'),
};

module.exports = config; 