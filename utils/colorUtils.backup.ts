// Curated 12-color palette for beautiful, distinct pie slices (matching theme preview)
export const PASTEL_COLORS = [
  '#FFACAB', // Light red
  '#FFCEA2', // Light orange
  '#FFF29C', // Light yellow
  '#E4FEBD', // Light lime
  '#C2FFE1', // Mint
  '#ABFCFE', // Cyan
  '#C5E5FE', // Sky blue
  '#C4D1FE', // Periwinkle
  '#DDC4FC', // Light violet
  '#FEE0F3', // Light pink
  '#FFC7C6', // Coral
  '#FFD7B3', // Peach
];

// Sunset theme colors - warm, golden, and vibrant (12 colors)
export const SUNSET_COLORS = [
  '#FF6B6B', '#FF8E53', '#FF6B35', '#F7931E',
  '#FFD93D', '#FFC72C', '#FF9F1C', '#FF7F00',
  '#FF5722', '#FF4081', '#E91E63', '#9C27B0',
];

// Ocean theme colors - blues, teals, and aquatic tones (12 colors)
export const OCEAN_COLORS = [
  '#0077BE', '#00A8CC', '#7DD3C0', '#86C5D8',
  '#4CB5F5', '#2E8BC0', '#1E6091', '#0F3460',
  '#00BCD4', '#26C6DA', '#4DD0E1', '#80DEEA',
];

// Forest theme colors - greens, browns, and earth tones (12 colors)
export const FOREST_COLORS = [
  '#228B22', '#32CD32', '#90EE90', '#98FB98',
  '#00FF7F', '#00FA9A', '#66CDAA', '#8FBC8F',
  '#9ACD32', '#ADFF2F', '#7CFC00', '#7FFF00',
];

// Neon theme colors - bright, electric, and vibrant (12 colors)
export const NEON_COLORS = [
  '#FF0080', '#00FFFF', '#FF4500', '#FFFF00',
  '#FF1493', '#00FF00', '#FF6347', '#9400D3',
  '#FF00FF', '#00BFFF', '#FF69B4', '#32CD32',
];

// Vintage theme colors - muted, retro, and sophisticated (12 colors)
export const VINTAGE_COLORS = [
  '#D2691E', '#CD853F', '#DEB887', '#F4A460',
  '#BC8F8F', '#F5DEB3', '#FFE4B5', '#FFDAB9',
  '#EEE8AA', '#F0E68C', '#BDB76B', '#9ACD32',
];

// Aurora theme colors - mystical northern lights inspired (12 colors)
export const AURORA_COLORS = [
  '#B8E6B8', '#A8E6CF', '#77DD77', '#87CEEB',
  '#98D8E8', '#B19CD9', '#DDA0DD', '#F0B27A',
  '#FFB6C1', '#FFA07A', '#87CEFA', '#98FB98',
];

// Custom theme storage key
export const CUSTOM_THEME_STORAGE_KEY = 'SPIN2PICK_CUSTOM_THEME';

// Default custom theme template
export const DEFAULT_CUSTOM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F',
  '#4D96FF', '#9013FE', '#FF6EC7', '#FF9500',
  '#795548', '#607D8B', '#E91E63', '#00BCD4',
];

// Interface for custom theme data
export interface CustomThemeData {
  colors: string[];
  name: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Activity {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  backgroundColor: string;
  wheelColors: string[];
  uiColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    cardBackground: string;
    modalBackground: string;
    buttonBackground: string;
    buttonText: string;
  };
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'pastel',
    name: 'pastel',
    displayName: 'Pastel Dream',
    emoji: '🌸',
    backgroundColor: '#f3efff',
    wheelColors: PASTEL_COLORS,
    uiColors: {
      primary: '#4e4370',
      secondary: '#666',
      accent: '#94c4f5',
      text: '#333',
      cardBackground: '#fff',
      modalBackground: '#fff',
      buttonBackground: '#94c4f5',
      buttonText: '#fff',
    }
  },
  {
    id: 'sunset',
    name: 'sunset',
    displayName: 'Sunset Vibes',
    emoji: '🌅',
    backgroundColor: '#fff5e6',
    wheelColors: SUNSET_COLORS,
    uiColors: {
      primary: '#D2691E',
      secondary: '#8B4513',
      accent: '#FF6B35',
      text: '#4A4A4A',
      cardBackground: '#FFF8F0',
      modalBackground: '#FFF8F0',
      buttonBackground: '#FF6B35',
      buttonText: '#fff',
    }
  },
  {
    id: 'ocean',
    name: 'ocean',
    displayName: 'Ocean Breeze',
    emoji: '🌊',
    backgroundColor: '#e6f3ff',
    wheelColors: OCEAN_COLORS,
    uiColors: {
      primary: '#0077BE',
      secondary: '#2E8BC0',
      accent: '#00A8CC',
      text: '#1E3A8A',
      cardBackground: '#F0F9FF',
      modalBackground: '#F0F9FF',
      buttonBackground: '#00A8CC',
      buttonText: '#fff',
    }
  },
  {
    id: 'forest',
    name: 'forest',
    displayName: 'Forest Fresh',
    emoji: '🌲',
    backgroundColor: '#f0f8f0',
    wheelColors: FOREST_COLORS,
    uiColors: {
      primary: '#228B22',
      secondary: '#556B2F',
      accent: '#32CD32',
      text: '#2D5016',
      cardBackground: '#F8FFF8',
      modalBackground: '#F8FFF8',
      buttonBackground: '#32CD32',
      buttonText: '#fff',
    }
  },
  {
    id: 'neon',
    name: 'neon',
    displayName: 'Neon Night',
    emoji: '🌃',
    backgroundColor: '#1a1a2e',
    wheelColors: NEON_COLORS,
    uiColors: {
      primary: '#FF0080',
      secondary: '#00FFFF',
      accent: '#FF1493',
      text: '#FFFFFF',
      cardBackground: '#16213E',
      modalBackground: '#16213E',
      buttonBackground: '#FF1493',
      buttonText: '#000',
    }
  },
  {
    id: 'vintage',
    name: 'vintage',
    displayName: 'Vintage Charm',
    emoji: '📜',
    backgroundColor: '#faf7f2',
    wheelColors: VINTAGE_COLORS,
    uiColors: {
      primary: '#8B4513',
      secondary: '#A0522D',
      accent: '#D2691E',
      text: '#5D4037',
      cardBackground: '#FFF8E1',
      modalBackground: '#FFF8E1',
      buttonBackground: '#D2691E',
      buttonText: '#fff',
    }
  },
  {
    id: 'aurora',
    name: 'aurora',
    displayName: 'Aurora Magic',
    emoji: '🌌',
    backgroundColor: '#f0f8ff',
    wheelColors: AURORA_COLORS,
    uiColors: {
      primary: '#4B0082',
      secondary: '#6A5ACD',
      accent: '#9370DB',
      text: '#2F1B69',
      cardBackground: '#F8F8FF',
      modalBackground: '#F8F8FF',
      buttonBackground: '#9370DB',
      buttonText: '#fff',
    }
  }
];

// Get theme by ID
export const getThemeById = (themeId: string): ColorTheme => {
  return COLOR_THEMES.find(theme => theme.id === themeId) || COLOR_THEMES[0];
};

// Create custom theme object
export const createCustomTheme = (customData: CustomThemeData): ColorTheme => ({
  id: 'custom',
  name: 'custom',
  displayName: customData.name || 'My Custom Theme',
  emoji: '🎨',
  backgroundColor: '#ffffff',
  wheelColors: customData.colors,
  uiColors: {
    primary: customData.colors[0],
    secondary: customData.colors[1],
    accent: customData.colors[2],
    text: '#333333',
    cardBackground: '#ffffff',
    modalBackground: '#ffffff',
    buttonBackground: customData.colors[2],
    buttonText: '#ffffff',
  }
});

// Save custom theme
export const saveCustomTheme = async (customData: CustomThemeData): Promise<void> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
    await AsyncStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customData));
    console.log('🎨 Custom theme saved successfully');
  } catch (error) {
    console.error('❌ Error saving custom theme:', error);
    throw error;
  }
};

// Load custom theme
export const loadCustomTheme = async (): Promise<CustomThemeData | null> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
    const savedData = await AsyncStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (savedData) {
      const customData = JSON.parse(savedData);
      return {
        ...customData,
        createdAt: new Date(customData.createdAt)
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error loading custom theme:', error);
    return null;
  }
};

// Reassign colors optimally to all activities with custom color palette
export const reassignAllColors = (activities: Activity[], colorPalette: string[] = PASTEL_COLORS): Activity[] => {
  const numActivities = activities.length;
  const numColors = colorPalette.length;

  if (numActivities === 0) {
    return [];
  }

  // Create a new array of activities to avoid modifying the original array directly.
  const result = activities.map(activity => ({ ...activity, color: '' }));

  for (let i = 0; i < numActivities; i++) {
    const forbidden = new Set<string>();

    // Add the previous slice's color to the forbidden set.
    if (i > 0) {
      forbidden.add(result[i - 1].color);
    }

    // For the last slice, it must also not conflict with the first slice's color
    // to ensure a seamless wrap-around on the wheel.
    if (i === numActivities - 1 && numActivities > 1) {
      forbidden.add(result[0].color);
    }

    let bestColor = '';
    
    // To make the color distribution visually appealing and not biased towards
    // the start of the palette, we begin our search from a different point
    // in the color list for each slice. Using `i % numColors` ensures we still
    // generally follow the beautiful rainbow sequence of the curated palette.
    const startIdx = i % numColors;

    for (let j = 0; j < numColors; j++) {
      const colorIdx = (startIdx + j) % numColors;
      const candidateColor = colorPalette[colorIdx];
      if (!forbidden.has(candidateColor)) {
        bestColor = candidateColor;
        break; // Found a suitable color.
      }
    }

    // As a fallback (which should rarely, if ever, be needed with more than 2 colors),
    // if all colors are forbidden, we just pick the next in sequence and accept a conflict.
    if (bestColor === '') {
      bestColor = colorPalette[startIdx];
    }

    result[i].color = bestColor;
  }

  return result;
};

// Default storage key for theme persistence
export const THEME_STORAGE_KEY = 'SPIN2PICK_THEME';

// HSV to RGB conversion
export const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

// RGB to Hex conversion
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// Hex to HSV conversion
export const hexToHsv = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return [h, s, v];
};

// Generate random vibrant colors
export const generateRandomColors = (count: number = 12): string[] => {
  const colors: string[] = [];
  const goldenRatio = 0.618033988749895;
  let hue = Math.random();
  
  for (let i = 0; i < count; i++) {
    // Use golden ratio to distribute hues evenly
    hue = (hue + goldenRatio) % 1;
    
    // Generate vibrant colors with good saturation and brightness
    const h = Math.round(hue * 360);
    const s = 0.7 + Math.random() * 0.3; // 70-100% saturation
    const v = 0.8 + Math.random() * 0.2; // 80-100% brightness
    
    const [r, g, b] = hsvToRgb(h, s, v);
    colors.push(rgbToHex(r, g, b));
  }
  
  return colors;
};

// Generate harmonious color palette
export const generateHarmoniousColors = (baseColor: string, count: number = 12): string[] => {
  const [baseH, baseS, baseV] = hexToHsv(baseColor);
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Create variations based on the base color
    const hueShift = (i * 30) % 360; // Shift hue by 30 degrees
    const h = (baseH + hueShift) % 360;
    const s = Math.max(0.5, baseS + (Math.random() - 0.5) * 0.3);
    const v = Math.max(0.6, baseV + (Math.random() - 0.5) * 0.3);
    
    const [r, g, b] = hsvToRgb(h, s, v);
    colors.push(rgbToHex(r, g, b));
  }
  
  return colors;
}; 