import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { hexToHsv, hsvToRgb, rgbToHex } from '../utils/colorUtils';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  size?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ColorPicker({ color, onColorChange, size = Math.min(screenWidth - 80, 280) }: ColorPickerProps) {
  const { currentTheme } = useTheme();
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [h, s, v] = hsv;

  // Shared values for animations  
  const translateX = useSharedValue(s * size);
  const translateY = useSharedValue((1 - v) * size);
  const hueTranslateX = useSharedValue((h / 360) * size);

  // Update internal state when color prop changes
  useEffect(() => {
    const newHsv = hexToHsv(color);
    const [newH, newS, newV] = newHsv;
    
    setHsv(newHsv);
    
    // Update cursor positions to match the new color
    translateX.value = newS * size;
    translateY.value = (1 - newV) * size;
    hueTranslateX.value = (newH / 360) * size;
  }, [color, size, translateX, translateY, hueTranslateX]);

  const updateColor = useCallback((newH: number, newS: number, newV: number) => {
    const [r, g, b] = hsvToRgb(newH, newS, newV);
    const hex = rgbToHex(r, g, b);
    setHsv([newH, newS, newV]);
    onColorChange(hex);
  }, [onColorChange]);

  // Get the current base color for the saturation/value area
  const [baseR, baseG, baseB] = hsvToRgb(h, 1, 1);
  const baseColorHex = rgbToHex(baseR, baseG, baseB);

  // Create gesture handlers that recreate when HSV values change
  const svPanGesture = useMemo(() => Gesture.Pan()
    .onStart((event) => {
      'worklet';
      const newS = Math.max(0, Math.min(1, event.x / size));
      const newV = Math.max(0, Math.min(1, 1 - (event.y / size)));
      translateX.value = newS * size;
      translateY.value = (1 - newV) * size;
      runOnJS(updateColor)(h, newS, newV);
    })
    .onUpdate((event) => {
      'worklet';
      const newS = Math.max(0, Math.min(1, event.x / size));
      const newV = Math.max(0, Math.min(1, 1 - (event.y / size)));
      translateX.value = newS * size;
      translateY.value = (1 - newV) * size;
      runOnJS(updateColor)(h, newS, newV);
    }), [h, updateColor, size, translateX, translateY]);

  const svTapGesture = useMemo(() => Gesture.Tap()
    .onStart((event) => {
      'worklet';
      const newS = Math.max(0, Math.min(1, event.x / size));
      const newV = Math.max(0, Math.min(1, 1 - (event.y / size)));
      translateX.value = newS * size;
      translateY.value = (1 - newV) * size;
      runOnJS(updateColor)(h, newS, newV);
    }), [h, updateColor, size, translateX, translateY]);

  // Hue bar gestures
  const huePanGesture = useMemo(() => Gesture.Pan()
    .onStart((event) => {
      'worklet';
      const newH = Math.max(0, Math.min(360, (event.x / size) * 360));
      hueTranslateX.value = (newH / 360) * size;
      runOnJS(updateColor)(newH, s, v);
    })
    .onUpdate((event) => {
      'worklet';
      const newH = Math.max(0, Math.min(360, (event.x / size) * 360));
      hueTranslateX.value = (newH / 360) * size;
      runOnJS(updateColor)(newH, s, v);
    }), [s, v, updateColor, size, hueTranslateX]);

  const hueTapGesture = useMemo(() => Gesture.Tap()
    .onStart((event) => {
      'worklet';
      const newH = Math.max(0, Math.min(360, (event.x / size) * 360));
      hueTranslateX.value = (newH / 360) * size;
      runOnJS(updateColor)(newH, s, v);
    }), [s, v, updateColor, size, hueTranslateX]);

  // Combine gestures for smooth interaction
  const svCombinedGesture = Gesture.Race(svPanGesture, svTapGesture);
  const hueCombinedGesture = Gesture.Race(huePanGesture, hueTapGesture);

  // Animated styles for cursors
  const svCursorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - 10 },
      { translateY: translateY.value - 10 }
    ],
  }));

  const hueCursorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hueTranslateX.value - 2 }],
  }));

  return (
    <View style={styles.container}>
      {/* Saturation/Brightness Area */}
      <GestureDetector gesture={svCombinedGesture}>
        <Animated.View style={[styles.svArea, { width: size, height: size }]}>
          <LinearGradient
            colors={['#FFFFFF', baseColorHex]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Saturation/Brightness Cursor */}
          <Animated.View
            style={[styles.svCursor, svCursorStyle]}
          />
        </Animated.View>
      </GestureDetector>

      {/* Hue Bar */}
      <GestureDetector gesture={hueCombinedGesture}>
        <Animated.View style={[styles.hueBar, { width: size }]}>
          <LinearGradient
            colors={[
              '#FF0000', '#FFFF00', '#00FF00', '#00FFFF',
              '#0000FF', '#FF00FF', '#FF0000'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Hue Cursor */}
          <Animated.View
            style={[styles.hueCursor, hueCursorStyle]}
          />
        </Animated.View>
      </GestureDetector>

      {/* Selected Color Display */}
      <View style={styles.footer}>
        <View
          style={[
            styles.selectedColor,
            { backgroundColor: color, borderColor: currentTheme.uiColors.secondary }
          ]}
        />
        <Text style={[
          styles.colorText,
          { color: currentTheme.uiColors.text }
        ]}>
          {color.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  svArea: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  svCursor: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  hueBar: {
    height: 30,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hueCursor: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  selectedColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  colorText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
}); 