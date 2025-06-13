# Font Scaling Prevention Guide

This guide ensures that all Text components in the app automatically disable font scaling to prevent Android system font size settings from breaking the UI layout.

## 🎯 Problem Solved
Android users can increase their system font size, which causes React Native Text components to scale beyond intended sizes, breaking UI layouts and designs.

## ✅ Solutions Implemented

### 1. Custom Text Component
**File**: `components/Text.tsx`

A drop-in replacement for React Native's Text component that automatically sets `allowFontScaling={false}`.

```tsx
// ❌ OLD WAY - Don't do this anymore
import { Text } from 'react-native';

// ✅ NEW WAY - Use this for all new Text components
import { Text } from '@/components/Text';
```

### 2. ThemedText Component
**File**: `components/ThemedText.tsx`

Already updated to include `allowFontScaling={false}`. Continue using this for themed text.

```tsx
// ✅ This is already configured correctly
import { ThemedText } from '@/components/ThemedText';
```

## 📋 Development Rules

### For All New Code:

1. **Always use the custom Text component**:
   ```tsx
   import { Text } from '@/components/Text';  // ✅ Correct
   import { Text } from 'react-native';       // ❌ Don't use
   ```

2. **For themed text, use ThemedText**:
   ```tsx
   import { ThemedText } from '@/components/ThemedText';
   ```

3. **Never add `allowFontScaling={true}` unless absolutely necessary**

## 🔧 Advanced Options

### Option A: Global Override (Recommended)
Uncomment this line in `metro.config.js` to automatically replace ALL Text imports:

```javascript
// Uncomment this line in metro.config.js:
'react-native/Libraries/Text/Text': path.resolve(__dirname, 'components/Text.tsx'),
```

### Option B: ESLint Rule
Add this to your `.eslintrc.js` to catch direct Text imports:

```javascript
rules: {
  'no-direct-text-import': 'error'
}
```

## 🧪 Testing
- Test on Android devices with large font settings
- Check that UI layouts remain consistent
- Verify text doesn't overflow containers

## 📝 Examples

### ✅ Correct Usage
```tsx
import { Text } from '@/components/Text';
import { ThemedText } from '@/components/ThemedText';

function MyComponent() {
  return (
    <View>
      <Text>This text won't scale with system font</Text>
      <ThemedText type="title">This themed text is also protected</ThemedText>
    </View>
  );
}
```

### ❌ Incorrect Usage
```tsx
import { Text } from 'react-native'; // Don't do this

function MyComponent() {
  return (
    <Text allowFontScaling={true}>  {/* Don't do this */}
      This text will break layouts on Android
    </Text>
  );
}
```

## 🔄 Migration Checklist
- [x] Updated existing Text components
- [x] Created custom Text component
- [x] Updated ThemedText component
- [x] Set up development guidelines
- [ ] Optional: Enable Metro global override
- [ ] Optional: Add ESLint rules

## 📱 Result
All text in your app will now maintain consistent sizes regardless of Android system font scaling settings, ensuring your UI design remains intact across all devices and accessibility configurations. 