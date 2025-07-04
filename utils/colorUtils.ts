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

// Autumn theme colors - rich fall colors with warm golds and deep reds (12 colors)
export const AUTUMN_COLORS = [
  '#B22222', '#CD853F', '#DAA520', '#FF8C00',
  '#DC143C', '#A0522D', '#D2691E', '#FF7F50',
  '#B8860B', '#8B4513', '#A52A2A', '#FF6347',
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
  backgroundColor?: string;  // AI-generated background color
  name: string;
  createdAt: Date;
  isActive: boolean;
}

// Import the new Item interface from titleUtils
import { Item } from './titleUtils';

// Legacy Activity interface - now extends Item for backwards compatibility
export interface Activity extends Item {
  // Activity is now just an alias for Item - maintains existing API
}

// 🆕 NEW TERMINOLOGY - Option interface as alias for Activity/Item
export interface Option extends Item {
  // Option is the new preferred terminology - same as Activity but clearer naming
}

// Type aliases for better readability and migration
export type { Item } from './titleUtils';

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
  },
  {
    id: 'autumn',
    name: 'autumn',
    displayName: 'Autumn Harvest',
    emoji: '🍂',
    backgroundColor: '#fff8f0',
    wheelColors: AUTUMN_COLORS,
    uiColors: {
      primary: '#A0522D',
      secondary: '#8B4513',
      accent: '#FF8C00',
      text: '#5D2F0A',
      cardBackground: '#FFF8F0',
      modalBackground: '#FFF8F0',
      buttonBackground: '#FF8C00',
      buttonText: '#fff',
    }
  }
];

// Get theme by ID
export const getThemeById = (themeId: string): ColorTheme => {
  return COLOR_THEMES.find(theme => theme.id === themeId) || COLOR_THEMES[0];
};

// Helper function to create a very light tint from a color for backgrounds
const createLightTint = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Create a very light tint by blending with white (95% white, 5% color)
  const tintedR = Math.round(r * 0.05 + 255 * 0.95);
  const tintedG = Math.round(g * 0.05 + 255 * 0.95);
  const tintedB = Math.round(b * 0.05 + 255 * 0.95);
  
  // Convert back to hex
  return '#' + ((1 << 24) + (tintedR << 16) + (tintedG << 8) + tintedB).toString(16).slice(1).toUpperCase();
};

// Helper function to calculate luminance of a color (for text contrast)
const getLuminance = (hexColor: string): number => {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  // Apply gamma correction
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

// Helper function to get optimal text color based on background
const getOptimalTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  
  // If background is dark (low luminance), use light text
  // If background is light (high luminance), use dark text
  // Threshold of 0.5 works well for most cases
  return luminance > 0.5 ? '#333333' : '#FFFFFF';
};

// Helper function to create a darker variant of a color for text
const createDarkVariant = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Create a darker variant (60% of original brightness)
  const darkR = Math.round(r * 0.6);
  const darkG = Math.round(g * 0.6);
  const darkB = Math.round(b * 0.6);
  
  return '#' + ((1 << 24) + (darkR << 16) + (darkG << 8) + darkB).toString(16).slice(1).toUpperCase();
};

// Create custom theme object
export const createCustomTheme = (customData: CustomThemeData): ColorTheme => {
  // Use AI-provided background color if available, otherwise create a subtle background tint
  const backgroundTint = customData.backgroundColor || createLightTint(customData.colors[0]);
  
  // Get optimal text color based on background luminance
  const textColor = getOptimalTextColor(backgroundTint);
  
  // Check if we have a dark background
  const luminance = getLuminance(backgroundTint);
  const isDarkBackground = luminance <= 0.5;
  
  // Set modal/card backgrounds based on main background
  const modalBackground = isDarkBackground ? '#1e1e1e' : '#ffffff';
  const cardBackground = isDarkBackground ? '#2a2a2a' : '#ffffff';
  
  // Create a darker variant of the primary color for better text contrast
  const primaryDark = createDarkVariant(customData.colors[0]);
  
  return {
    id: 'custom',
    name: 'custom',
    displayName: customData.name || 'My Custom Theme',
    emoji: '⭐',
    backgroundColor: backgroundTint,
    wheelColors: customData.colors,
    uiColors: {
      primary: customData.colors[0],
      secondary: customData.colors[1],
      accent: customData.colors[2],
      text: textColor, // Dynamic text color based on background luminance
      cardBackground: cardBackground, // Dynamic based on background
      modalBackground: modalBackground, // Dynamic based on background
      buttonBackground: customData.colors[2],
      buttonText: '#ffffff',
    }
  };
};

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

// Reassign colors optimally to all items/activities with custom color palette
// Works with both Item and Activity interfaces for universal compatibility
export const reassignAllColors = <T extends Item>(items: T[], colorPalette: string[] = PASTEL_COLORS): T[] => {
  const numItems = items.length;
  const numColors = colorPalette.length;

  if (numItems === 0) {
    return [];
  }

  // Create a new array of items to avoid modifying the original array directly.
  const result = items.map(item => ({ ...item, color: '' }));

  for (let i = 0; i < numItems; i++) {
    const forbidden = new Set<string>();

    // Add the previous slice's color to the forbidden set.
    if (i > 0) {
      forbidden.add(result[i - 1].color);
    }

    // For the last slice, it must also not conflict with the first slice's color
    // to ensure a seamless wrap-around on the wheel.
    if (i === numItems - 1 && numItems > 1) {
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

// Legacy function name for backwards compatibility
export const reassignAllActivities = reassignAllColors;

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

// Generate truly random vibrant colors with maximum variety
export const generateRandomColors = (count: number = 12): string[] => {
  const colors: string[] = [];
  
  // Create pools of different color approaches for maximum variety
  const colorStrategies = [
    // Pure random with high saturation
    () => {
      const h = Math.floor(Math.random() * 360);
      const s = 0.7 + Math.random() * 0.3; // 70-100%
      const v = 0.8 + Math.random() * 0.2; // 80-100%
      return { h, s, v };
    },
    
    // Warm colors (reds, oranges, yellows)
    () => {
      const h = Math.random() < 0.5 
        ? Math.floor(Math.random() * 60)        // 0-60 (reds to yellows)
        : Math.floor(Math.random() * 30) + 300; // 300-330 (magentas)
      const s = 0.6 + Math.random() * 0.4; // 60-100%
      const v = 0.75 + Math.random() * 0.25; // 75-100%
      return { h, s, v };
    },
    
    // Cool colors (greens, blues, purples)
    () => {
      const h = Math.floor(Math.random() * 180) + 120; // 120-300
      const s = 0.6 + Math.random() * 0.4; // 60-100%
      const v = 0.75 + Math.random() * 0.25; // 75-100%
      return { h, s, v };
    },
    
    // Neon/electric colors
    () => {
      const neonHues = [0, 30, 60, 120, 180, 240, 270, 300, 330];
      const h = neonHues[Math.floor(Math.random() * neonHues.length)] + 
                (Math.random() - 0.5) * 20; // Add slight variation
      const s = 0.9 + Math.random() * 0.1; // 90-100%
      const v = 0.9 + Math.random() * 0.1; // 90-100%
      return { h: ((h % 360) + 360) % 360, s, v };
    },
    
    // Pastel variations
    () => {
      const h = Math.floor(Math.random() * 360);
      const s = 0.4 + Math.random() * 0.4; // 40-80%
      const v = 0.85 + Math.random() * 0.15; // 85-100%
      return { h, s, v };
    },
    
    // Deep/rich colors
    () => {
      const h = Math.floor(Math.random() * 360);
      const s = 0.8 + Math.random() * 0.2; // 80-100%
      const v = 0.6 + Math.random() * 0.3; // 60-90%
      return { h, s, v };
    }
  ];
  
  // Track used colors to avoid duplicates
  const usedColors = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let colorHex = '';
    
    // Try up to 10 times to generate a unique color
    while (attempts < 10) {
      // Randomly select a color strategy
      const strategy = colorStrategies[Math.floor(Math.random() * colorStrategies.length)];
      const { h, s, v } = strategy();
      
      // Convert to RGB and hex
      const [r, g, b] = hsvToRgb(h, s, v);
      colorHex = rgbToHex(r, g, b);
      
      // Check if color is too similar to existing ones
      let tooSimilar = false;
      for (const existingColor of usedColors) {
        if (getColorDistance(colorHex, existingColor) < 30) {
          tooSimilar = true;
          break;
        }
      }
      
      if (!tooSimilar) {
        break;
      }
      
      attempts++;
    }
    
    usedColors.add(colorHex);
    colors.push(colorHex);
  }
  
  // Final shuffle for complete randomness
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  
  return colors;
};

// Helper function to calculate color distance (perceptual difference)
const getColorDistance = (color1: string, color2: string): number => {
  const [r1, g1, b1] = [
    parseInt(color1.slice(1, 3), 16),
    parseInt(color1.slice(3, 5), 16),
    parseInt(color1.slice(5, 7), 16)
  ];
  const [r2, g2, b2] = [
    parseInt(color2.slice(1, 3), 16),
    parseInt(color2.slice(3, 5), 16),
    parseInt(color2.slice(5, 7), 16)
  ];
  
  // Simplified color distance calculation
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  );
};

// Generate a background color that harmonizes with wheel colors
export const generateRandomBackgroundColor = (wheelColors: string[] = []): string => {
  if (wheelColors.length === 0) {
    // Return a neutral light background if no wheel colors provided
    const neutralBackgrounds = ['#f8f9fa', '#ffffff', '#fefefe', '#f5f5f5', '#f0f0f0'];
    return neutralBackgrounds[Math.floor(Math.random() * neutralBackgrounds.length)];
  }
  
  // Analyze the wheel colors to determine the best background approach
  const avgLuminance = wheelColors.reduce((sum, color) => {
    return sum + getLuminance(color);
  }, 0) / wheelColors.length;
  
  // Determine if we should use a light or dark background based on wheel colors
  const useDarkBackground = avgLuminance > 0.6; // If wheel colors are bright, use dark background
  
  if (useDarkBackground) {
    // Generate dark backgrounds for bright wheel colors
    const darkBackgrounds = [
      '#1a1a2e', '#16213e', '#0d1117', '#1e1e1e', '#2a2a2a',
      '#1a1b23', '#0f0f23', '#1f1f2e', '#252538', '#2d2d44'
    ];
    return darkBackgrounds[Math.floor(Math.random() * darkBackgrounds.length)];
  } else {
    // Generate light backgrounds for darker wheel colors
    // Create tints based on the average color of the wheel
    const [avgR, avgG, avgB] = wheelColors.reduce((acc, color) => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return [acc[0] + r, acc[1] + g, acc[2] + b];
    }, [0, 0, 0]).map(sum => Math.round(sum / wheelColors.length));
    
    // Create a very light tint (95% white, 5% average color)
    const tintR = Math.round(avgR * 0.05 + 255 * 0.95);
    const tintG = Math.round(avgG * 0.05 + 255 * 0.95);
    const tintB = Math.round(avgB * 0.05 + 255 * 0.95);
    
    return rgbToHex(tintR, tintG, tintB);
  }
};

// Get style-appropriate background color for AI styles
export const getStyleBackground = (style: string, wheelColors: string[] = []): string => {
  const styleBackgrounds: Record<string, string[]> = {
    'modern_vibrant': ['#f8f9fa', '#ffffff', '#fefefe'],
    'neon_futuristic': ['#0d1117', '#1a1a2e', '#16213e'],
    'pastel_harmony': ['#faf8ff', '#fff5f8', '#f8f0ff'],
    'sunset_gradient': ['#fff5e6', '#fdf4f0', '#fef7f0'],
    'ocean_depths': ['#f0f9ff', '#e6f3ff', '#f0f8ff'],
    'forest_earth': ['#f8fff8', '#f0f8f0', '#f5fff5'],
    'retro_synthwave': ['#0d1117', '#1a1a2e', '#16213e'],
    'minimal_elegant': ['#fafafa', '#f5f5f5', '#f8f8f8']
  };
  
  const backgrounds = styleBackgrounds[style] || styleBackgrounds['modern_vibrant'];
  return backgrounds[Math.floor(Math.random() * backgrounds.length)];
};

// Generate harmonious background based on color theory
export const generateHarmoniousBackground = (wheelColors: string[]): string => {
  if (wheelColors.length === 0) {
    return '#f8f9fa';
  }
  
  // Find the dominant hue in the wheel colors
  const hues = wheelColors.map(color => {
    const [h] = hexToHsv(color);
    return h;
  });
  
  // Calculate average hue
  const avgHue = hues.reduce((sum, hue) => sum + hue, 0) / hues.length;
  
  // Generate complementary background (opposite on color wheel) but very light
  const complementaryHue = (avgHue + 180) % 360;
  
  // Create a very light background with complementary hue
  const [r, g, b] = hsvToRgb(complementaryHue, 0.08, 0.98); // Very low saturation, very high brightness
  
  return rgbToHex(r, g, b);
}; 