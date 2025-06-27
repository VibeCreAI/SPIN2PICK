import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
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

  const updateColor = useCallback((newH: number, newS: number, newV: number) => {
    const newHsv: [number, number, number] = [newH, newS, newV];
    setHsv(newHsv);
    const [r, g, b] = hsvToRgb(newH, newS, newV);
    const hexColor = rgbToHex(r, g, b);
    onColorChange(hexColor);
  }, [onColorChange]);

  // Handle touch on saturation/brightness area
  const handleSVTouch = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const newS = Math.max(0, Math.min(1, locationX / size));
    const newV = Math.max(0, Math.min(1, 1 - (locationY / size)));
    updateColor(h, newS, newV);
  }, [h, size, updateColor]);

  // Handle touch on hue bar
  const handleHueTouch = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const newH = Math.max(0, Math.min(360, (locationX / size) * 360));
    updateColor(newH, s, v);
  }, [s, v, size, updateColor]);

  // Generate current color for the saturation/brightness area
  const [baseR, baseG, baseB] = hsvToRgb(h, 1, 1);
  const baseColor = rgbToHex(baseR, baseG, baseB);

  // Calculate cursor positions
  const svCursorX = s * size;
  const svCursorY = (1 - v) * size;
  const hueCursorX = (h / 360) * size;

  return (
    <View style={styles.container}>
      {/* Saturation/Brightness Area */}
      <TouchableWithoutFeedback onPress={handleSVTouch}>
        <View style={[styles.svArea, { width: size, height: size }]}>
          <LinearGradient
            colors={['#FFFFFF', baseColor]}
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
          <View
            style={[
              styles.svCursor,
              {
                left: svCursorX - 10,
                top: svCursorY - 10,
              },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Hue Bar */}
      <TouchableWithoutFeedback onPress={handleHueTouch}>
        <View style={[styles.hueBar, { width: size, marginTop: 16 }]}>
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
          <View
            style={[
              styles.hueCursor,
              {
                left: hueCursorX - 2,
              },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Color Preview */}
      <View style={[styles.colorPreview, { marginTop: 16 }]}>
        <View
          style={[
            styles.colorSwatch,
            { backgroundColor: color }
          ]}
        />
        <Text style={[styles.hexText, { color: currentTheme.uiColors.text }]}>
          {color.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  svArea: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  svCursor: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  hueBar: {
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  hueCursor: {
    position: 'absolute',
    width: 4,
    height: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  hexText: {
    fontSize: 16,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '600',
  },
}); 