const IS_DEV = process.env.NODE_ENV === 'development';

module.exports = {
  expo: {
    name: "Spin2Pick",
    slug: "spin2pick",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "spin2pick",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.vibecreai.spin2pick",
      buildNumber: "11",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        GADApplicationIdentifier: "ca-app-pub-7239598551330509~5791479155"
      }
    },
    android: {
      versionCode: 11,
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.vibecreai.spin2pick",
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "com.google.android.gms.permission.AD_ID"
      ],
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#000000"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-audio",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          resizeMode: "contain",
          backgroundColor: "#000000"
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-7239598551330509~5791479155",
          iosAppId: "ca-app-pub-7239598551330509~5791479155"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    extra: {
      router: {},
      eas: {
        projectId: "f8f80de9-8015-4e53-9b50-69306f5d74f2"
      },
      // 🔑 Secure API Configuration
      // No API keys - only safe endpoint URLs
      apiBaseUrl: "https://spin2pick-app.vercel.app",
      enableAIFeatures: true,
    },
    owner: "vibecreai"
  },
  "react-native-google-mobile-ads": {
    androidAppId: "ca-app-pub-7239598551330509~5791479155",
    iosAppId: "ca-app-pub-7239598551330509~5791479155"
  }
}; 