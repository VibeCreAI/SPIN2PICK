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

// Windows-specific fixes for EACCES permission errors
// Exclude problematic paths that cause permission errors on Windows
config.resolver.blockList = [
  /node_modules\/\.bin\/.*/,  // Exclude .bin directory temp files
  /\.expo-.*/,               // Exclude Expo temp files (like .expo-C0RsZN5N)
  /\.git\/.*/,               // Exclude git directory
  /\.vscode\/.*/,            // Exclude VS Code settings
  /\.claude\/.*/,            // Exclude Claude settings
];

// Configure watchman for better Windows compatibility
config.watchFolders = [__dirname];

// Reduce Metro memory usage on Windows
config.maxWorkers = Math.max(1, Math.floor(require('os').cpus().length / 2));

// Configure file watcher to be less aggressive on Windows
config.fileMap = {
  ...config.fileMap,
  unstable_enableSymlinks: false,
};

module.exports = config; 