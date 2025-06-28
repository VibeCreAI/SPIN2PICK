# SPIN2PICK - Project Context Guide for Claude Code

## 🎯 Project Overview

**SPIN2PICK** is a sophisticated React Native/Expo cross-platform roulette wheel application designed for activity selection, particularly for families, educators, and caregivers. The app combines the thrill of spinning with AI-powered activity suggestions, advanced theming, and comprehensive activity management.

### **Key Features**
- **Interactive Roulette Wheel**: SVG-based wheel with realistic physics and animations
- **AI-Powered Suggestions**: OpenRouter integration for smart activity recommendations
- **Advanced Theme System**: 8 built-in themes + custom theme creation with AI color intelligence
- **Bulk Activity Management**: Add/manage multiple activities with smart parsing
- **Cross-Platform**: iOS, Android, and Web deployment
- **Monetization**: AdMob (mobile) and AdSense (web) integration
- **Audio & Haptics**: Immersive feedback with sound effects and haptic responses

---

## 🏗️ Architecture & Technology Stack

### **Core Framework**
```typescript
// Current versions from package.json
"react": "19.0.0"
"react-native": "0.79.4" 
"expo": "53.0.12"
"typescript": "~5.8.3"
```

### **Key Dependencies**
- **Navigation**: Expo Router v5.1 with typed routes
- **Animations**: React Native Reanimated ~3.17.4
- **Storage**: AsyncStorage for persistent data
- **Graphics**: React Native SVG for wheel rendering
- **AI Services**: OpenRouter API (Llama 3.2 3B Instruct)
- **Monetization**: Google Mobile Ads ^15.3.1
- **Audio**: Expo Audio for sound effects
- **Haptics**: Expo Haptics for tactile feedback

### **Project Structure**
```
SPIN2PICK/
├── 📱 app/                     # Expo Router app directory
│   ├── index.tsx              # Main game screen (758 lines)
│   ├── _layout.tsx            # Root layout with fonts/themes
│   └── +html.tsx              # Web SEO and AdSense setup
├── 🧩 components/             # React components
│   ├── RouletteWheel.tsx      # Core wheel logic (1635 lines)
│   ├── ActivityInput.tsx      # Activity management (465 lines)
│   ├── SaveLoadModal.tsx      # Data persistence (740 lines)
│   ├── ThemeSelectionModal.tsx # Theme picker (368 lines)
│   ├── CustomThemeModal.tsx   # Custom theme creator (694 lines)
│   └── [other components]
├── 🔧 utils/                  # Utility functions
│   ├── colorUtils.ts          # Advanced color/theme system (626 lines)
│   ├── emojiUtils.ts          # AI emoji matching (387 lines)
│   ├── soundUtils.ts          # Audio management
│   └── adMobUtils.ts          # Monetization utilities
├── 🌐 api/                    # Vercel serverless functions
│   ├── suggest-activity.js    # Single AI suggestions
│   ├── suggest-multiple-activities.js # Bulk AI generation
│   ├── generate-colors.js     # AI color palette creation
│   └── get-emoji.js          # Emoji service
├── 🎨 assets/                 # Static resources
│   ├── images/               # Icons and graphics
│   ├── fonts/                # Custom fonts (Jua, GamjaFlower, Nunito)
│   └── sounds/               # Audio effects (spinning, click, success)
├── 🪝 hooks/                  # Custom React hooks
│   └── useTheme.tsx          # Advanced theme management (148 lines)
└── ⚙️ Configuration files
```

---

## 🎨 Advanced Theme System

### **Built-in Themes**
The app features 8 professionally designed themes:

1. **🌸 Pastel Dream** - Soft, gentle colors for calm experiences
2. **🌅 Sunset Vibes** - Warm oranges and corals for energy
3. **🌊 Ocean Breeze** - Cool blues and teals for peace
4. **🌲 Forest Fresh** - Natural greens for nature connection
5. **🌃 Neon Night** - Vibrant electric colors for high energy
6. **📜 Vintage Charm** - Muted classic tones for timeless feel
7. **🌌 Aurora Magic** - Mystical northern lights inspired
8. **🍂 Autumn Harvest** - Rich fall colors with warm golds

### **Theme Architecture**
```typescript
interface ColorTheme {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  backgroundColor: string;
  wheelColors: string[];        // 12 colors for activities
  uiColors: {
    primary: string;           // Main brand color
    secondary: string;         // Supporting color
    accent: string;           // Highlight color
    text: string;             // Body text
    cardBackground: string;   // Card backgrounds
    modalBackground: string;  // Modal backgrounds
    buttonBackground: string; // Button fills
    buttonText: string;       // Button text
  };
}
```

### **AI-Powered Custom Themes**
- **Color Intelligence**: WCAG accessibility compliance with contrast ratio analysis
- **Luminance Detection**: Automatic light/dark text color selection
- **Harmony Analysis**: Color theory integration for pleasing palettes
- **Background Generation**: AI creates optimal background colors from palettes

---

## 🤖 AI Integration & API Architecture

### **Serverless API Structure**
The app uses Vercel serverless functions for AI features:

**⚠️ CRITICAL DEPLOYMENT REQUIREMENT:**
```bash
# 🚨 MANDATORY: Deploy to Vercel before API calls work
vercel --prod

# Why this is essential:
# 1. API functions only exist as Vercel serverless functions
# 2. Environment variables (OpenRouter keys) only available in production
# 3. Local development cannot access external AI services
# 4. CORS configuration is production-domain specific
```

### **API Endpoints**
- `POST /api/suggest-activity` - Single AI activity suggestion
- `POST /api/suggest-multiple-activities` - Bulk activity generation (3-10 items)
- `POST /api/generate-colors` - AI color palette creation
- `GET /api/get-emoji` - Emoji fetching and management

### **AI Service Configuration**
```javascript
// OpenRouter API integration
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://spin2pick.app",
    "X-Title": "Spin2Pick App"
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3.2-3b-instruct",
    messages: [/* AI prompts */],
    max_tokens: 200,
    temperature: 0.7
  })
});
```

---

## 🎮 Core Game Logic

### **RouletteWheel Component** (`components/RouletteWheel.tsx`)
- **SVG-based rendering** for scalable graphics
- **Physics simulation** with realistic spinning animation
- **Activity highlighting** with pulsing borders for new items
- **Smart color distribution** preventing adjacent similar colors
- **Touch interactions** with haptic feedback
- **Responsive design** adapting to all screen sizes

### **Activity Management** (`components/ActivityInput.tsx`)
- **Bulk addition** via comma/line-separated input
- **AI suggestions** with decline tracking to avoid repeats
- **Smart parsing** supporting numbered lists and mixed formats
- **Duplicate prevention** and validation
- **Visual feedback** for loading states

### **Data Persistence** (`components/SaveLoadModal.tsx`)
- **5 save slots** with custom naming (15 char limit)
- **AsyncStorage** for cross-session persistence
- **Theme-aware loading** activities adapt to current theme
- **Confirmation dialogs** for destructive actions

---

## 🎯 Development Guidelines

### **Code Style & Patterns**
- **TypeScript strict mode** with comprehensive typing
- **React 19 features** using new hooks and concurrent features
- **Expo Router v5.1** with typed routes
- **Font scaling prevention** on Android (`allowFontScaling={false}`)
- **Platform-specific code** using `.ios.tsx` and `.web.tsx` extensions

### **Component Architecture**
```typescript
// ✅ Good: Themed components with consistent API
interface ThemedComponentProps {
  style?: ViewStyle;
  children: ReactNode;
}

export const ThemedView: React.FC<ThemedComponentProps> = ({ style, children }) => {
  const { currentTheme } = useTheme();
  return (
    <View style={[{ backgroundColor: currentTheme.backgroundColor }, style]}>
      {children}
    </View>
  );
};
```

### **State Management Patterns**
```typescript
// ✅ Good: AsyncStorage with proper error handling
const saveActivities = async (activities: Activity[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving activities:', error);
    // Handle gracefully without breaking app
  }
};
```

### **Animation Best Practices**
```typescript
// ✅ Good: React Native Reanimated worklets
const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ rotate: `${rotation.value}deg` }]
  };
});

const spin = () => {
  'worklet';
  rotation.value = withSpring(rotation.value + 360, {
    damping: 10,
    stiffness: 100
  });
};
```

---

## 📱 Platform-Specific Considerations

### **Web Deployment**
- **Vercel hosting** with static site generation
- **Google AdSense** integration for monetization
- **SEO optimization** with meta tags and sitemaps
- **Progressive Web App** features for mobile web

### **Mobile (iOS/Android)**
- **EAS Build** for native app compilation
- **AdMob integration** for banner and interstitial ads
- **Haptic feedback** for enhanced user experience
- **Native performance** with optimized bundle sizes

### **Cross-Platform Consistency**
- **Shared components** with platform-specific variants
- **Consistent theming** across all platforms
- **Unified asset management** with proper scaling
- **Feature parity** maintaining same functionality everywhere

---

## 🔧 Configuration Files

### **Key Configuration**
- **`app.config.js`**: Expo configuration with environment variables
- **`eas.json`**: Build configuration for iOS/Android
- **`vercel.json`**: Web deployment settings
- **`package.json`**: Dependencies and build scripts
- **`.cursor/rules/`**: Development guidelines and best practices

### **Environment Variables**
```javascript
// app.config.js
export default {
  expo: {
    extra: {
      apiBaseUrl: process.env.VERCEL_URL || 'https://spin2pick.vercel.app',
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
      enableAIFeatures: process.env.ENABLE_AI_FEATURES || 'true',
      adMobAppId: process.env.ADMOB_APP_ID,
    },
  },
};
```

---

## 🚀 Build & Deployment

### **Development Commands**
```bash
# Start development server
npm start

# Platform-specific development
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web development

# Code quality
npm run lint       # ESLint checking
```

### **Deployment Workflow**
```bash
# Web deployment (Vercel)
npm run predeploy  # Build for web
npm run deploy     # Deploy to Vercel

# Mobile deployment (EAS)
eas build --platform ios      # iOS build
eas build --platform android  # Android build
eas submit                     # App store submission
```

---

## 🎵 Asset Management

### **Audio Files** (`assets/sounds/`)
- **`spinning.mp3`** (235KB) - Wheel spinning sound
- **`click.mp3`** (19KB) - UI interaction sound
- **`success.mp3`** (39KB) - Win celebration sound
- **Proper attribution** documented in `sounds/README.md`

### **Font System** (`assets/fonts/`)
- **Jua** - Korean round font for titles (2MB)
- **GamjaFlower** - Decorative Korean font (12MB)
- **Nunito** - Primary UI font family (regular + bold)
- **Ionicons** - Icon font for UI elements

### **Image Assets** (`assets/images/`)
- **High-resolution icons** (1MB each) for app stores
- **Web optimized** favicon and social media previews
- **Splash screen** assets for all platforms

---

## 🔒 Security & Best Practices

### **API Security**
- **Environment variables** for sensitive keys
- **CORS configuration** for production domains
- **Input validation** for all user-submitted data
- **Rate limiting** on API endpoints

### **Data Privacy**
- **Local storage only** - no personal data collection
- **GDPR compliant** advertising integration
- **Transparent permissions** for audio and haptics

---

## 🐛 Common Issues & Solutions

### **Font Scaling Issues (Android)**
```typescript
// ✅ Solution: Add allowFontScaling={false} to all Text components
<Text allowFontScaling={false} style={styles.text}>
  Content
</Text>
```

### **API Deployment Dependencies**
```bash
# ❌ Problem: Local API calls fail
# ✅ Solution: Always deploy to Vercel first
vercel --prod
```

### **Theme Switching Performance**
```typescript
// ✅ Solution: Use React.memo for expensive components
const MemoizedWheel = React.memo(RouletteWheel);
```

---

## 📊 Performance Optimization

### **Bundle Size Management**
- **Dynamic imports** for large components
- **Asset optimization** with proper compression
- **Tree shaking** for unused exports
- **Code splitting** for web builds

### **Runtime Performance**
- **React.memo** for expensive re-renders
- **useCallback/useMemo** for heavy computations
- **Proper cleanup** of subscriptions and timers
- **Optimized SVG rendering** with minimal re-draws

---

## 🔄 Recent Updates & Version History

### **v1.2.0 - Major Feature Expansion**
- Complete theme system with 8 themes + custom creation
- Bulk activity management with AI-powered suggestions
- Enhanced UI/UX with consistent theming
- Dynamic color adaptation system

### **Key Improvements**
- Font scaling prevention on Android
- Mobile web optimization (flicker-free)
- Reset functionality with confirmation dialogs
- Advanced save/load system with 5 slots

---

This context guide provides comprehensive understanding of SPIN2PICK's architecture, features, and development patterns. Use this information to maintain consistency with existing code patterns and make informed decisions about new features or modifications.