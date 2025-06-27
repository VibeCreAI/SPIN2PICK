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
  }
];

// Get theme by ID
export const getThemeById = (themeId: string): ColorTheme => {
  return COLOR_THEMES.find(theme => theme.id === themeId) || COLOR_THEMES[0];
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