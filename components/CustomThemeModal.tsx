import { FONTS } from '@/app/_layout';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../hooks/useTheme';
import { CustomThemeData, DEFAULT_CUSTOM_COLORS, generateRandomColors } from '../utils/colorUtils';
import ColorPicker from './ColorPicker';

/**
 * Get the appropriate API base URL based on platform
 * @returns The base URL for API calls
 */
const getApiBaseUrl = (): string => {
  // 🔒 Secure API configuration - uses deployed Vercel API
  // API keys stay secure on the server side
  const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  
  if (configuredUrl) {
    return configuredUrl;
  }
  
  // Fallback to deployed API (no API keys exposed)
  return 'https://spin2pick-app.vercel.app';
};

interface CustomThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomThemeModal: React.FC<CustomThemeModalProps> = ({ 
  visible, 
  onClose 
}) => {
  const { currentTheme, setCustomTheme } = useTheme();
  
  // Initialize with current custom theme if active, otherwise use defaults
  const getInitialColors = () => {
    if (currentTheme.id === 'custom' && currentTheme.wheelColors) {
      return [...currentTheme.wheelColors];
    }
    return [...DEFAULT_CUSTOM_COLORS];
  };
  
  const getInitialThemeName = () => {
    if (currentTheme.id === 'custom' && currentTheme.displayName) {
      return currentTheme.displayName;
    }
    return 'My Custom Theme';
  };
  
  const [themeName, setThemeName] = useState(getInitialThemeName());
  const [colors, setColors] = useState<string[]>(getInitialColors());
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [colorInput, setColorInput] = useState(getInitialColors()[0] || '#FF6B6B');

  // Update state when modal opens or current theme changes
  useEffect(() => {
    if (visible) {
      const initialColors = getInitialColors();
      const initialName = getInitialThemeName();
      
      setColors(initialColors);
      setThemeName(initialName);
      setColorInput(initialColors[0] || '#FF6B6B');
      setSelectedColorIndex(0); // Reset to first color when modal opens
    }
  }, [visible, currentTheme.id, currentTheme.wheelColors, currentTheme.displayName]);

  // Update colorInput when selectedColorIndex changes
  useEffect(() => {
    setColorInput(colors[selectedColorIndex] || '#FF6B6B');
  }, [selectedColorIndex, colors]);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const modalWidth = screenWidth < 500 ? '98%' : 500;
  const modalHeight = screenWidth < 500 ? '95%' : '90%';
  const modalMinHeight = screenWidth < 500 ? Math.min(screenHeight * 0.75, 600) : 600;

  const handleColorChange = (colorIndex: number, newColor: string) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex] = newColor;
    setColors(updatedColors);
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      Alert.alert('Error', 'Please enter a theme name.');
      return;
    }

    try {
      const customData: CustomThemeData = {
        colors,
        name: themeName.trim(),
        createdAt: new Date(),
        isActive: true,
      };

      await setCustomTheme(customData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom theme. Please try again.');
    }
  };

  const handleRandomColors = () => {
    const randomColors = generateRandomColors(12);
    setColors(randomColors);
    setColorInput(randomColors[selectedColorIndex]);
  };

  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [selectedAIStyle, setSelectedAIStyle] = useState('modern_vibrant');

  // AI Color Style options with descriptions
  const aiColorStyles = [
    { id: 'modern_vibrant', name: 'Modern Vibrant', emoji: '🌟', description: 'Bright, energetic colors' },
    { id: 'neon_futuristic', name: 'Neon Futuristic', emoji: '🌃', description: 'Electric cyberpunk colors' },
    { id: 'pastel_harmony', name: 'Pastel Harmony', emoji: '🌸', description: 'Soft, gentle colors' },
    { id: 'sunset_gradient', name: 'Sunset Gradient', emoji: '🌅', description: 'Warm flowing colors' },
    { id: 'ocean_depths', name: 'Ocean Depths', emoji: '🌊', description: 'Cool blues and teals' },
    { id: 'forest_earth', name: 'Forest Earth', emoji: '🌲', description: 'Natural earth tones' },
    { id: 'retro_synthwave', name: 'Retro Synthwave', emoji: '🕹️', description: '80s electric colors' },
    { id: 'minimal_elegant', name: 'Minimal Elegant', emoji: '✨', description: 'Sophisticated muted tones' },
  ];

  const handleAIColors = async () => {
    setIsAIGenerating(true);
    setAIError(null);
    
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/generate-colors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: 12,
          style: selectedAIStyle,
          context: 'roulette wheel game',
          existingColors: colors // Pass current colors to avoid duplicates
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract colors and background from the API response
      let aiColors = data.extractedColors;
      let aiBackgroundColor = data.backgroundColor;
      
      // Fallback if API didn't return valid colors
      if (!Array.isArray(aiColors) || aiColors.length === 0) {
        console.warn('AI API returned invalid colors, using fallback');
        
        // Style-specific fallback colors with backgrounds
        const styleDefaults: Record<string, { colors: string[], background: string }> = {
          neon_futuristic: {
            colors: ['#FF0080', '#00FFFF', '#FF1493', '#00FF00', '#FF4500', '#9400D3'],
            background: '#1a1a2e'
          },
          pastel_harmony: {
            colors: ['#FFACAB', '#FFCEA2', '#FFF29C', '#E4FEBD', '#C2FFE1', '#ABFCFE'],
            background: '#faf8ff'
          },
          sunset_gradient: {
            colors: ['#FF6B35', '#F7931E', '#FF8E53', '#FFD93D', '#FFC72C', '#FF9F1C'],
            background: '#fff5e6'
          },
          ocean_depths: {
            colors: ['#0077BE', '#00A8CC', '#7DD3C0', '#86C5D8', '#4CB5F5', '#2E8BC0'],
            background: '#f0f9ff'
          },
          retro_synthwave: {
            colors: ['#FF00FF', '#00FFFF', '#FF1493', '#FFFF00', '#FF0080', '#00FF00'],
            background: '#0d1117'
          },
          forest_earth: {
            colors: ['#228B22', '#32CD32', '#90EE90', '#9ACD32', '#8FBC8F', '#66CDAA'],
            background: '#f8fff8'
          },
          minimal_elegant: {
            colors: ['#E8E8E8', '#D1D1D1', '#B8B8B8', '#A0A0A0', '#909090', '#808080'],
            background: '#fafafa'
          }
        };
        
        const fallbackData = styleDefaults[selectedAIStyle] || {
          colors: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C',
                  '#E67E22', '#34495E', '#F1C40F', '#E91E63', '#FF9800', '#607D8B'],
          background: '#f8f9fa'
        };
        
        aiColors = fallbackData.colors;
        aiBackgroundColor = fallbackData.background;
        
        // Extend to 12 colors if needed
        while (aiColors.length < 12) {
          aiColors.push(aiColors[aiColors.length % 6]);
        }
        aiColors = aiColors.slice(0, 12);
      }
      
      // Update colors and current color input
      setColors(aiColors);
      setColorInput(aiColors[selectedColorIndex]);
      
      // If we have an AI background color, create and save the complete theme immediately
      if (aiBackgroundColor) {
        const customData: CustomThemeData = {
          colors: aiColors,
          backgroundColor: aiBackgroundColor,
          name: themeName || `${selectedAIStyle.replace('_', ' ')} Theme`,
          createdAt: new Date(),
          isActive: true
        };
        
        // Apply the theme immediately to show the background effect
        await setCustomTheme(customData);
        
        console.log(`🎨 AI theme created with background: ${aiBackgroundColor}`);
      }
      
      // Track successful AI usage
      setAiUsageCount(prev => prev + 1);
      
      console.log('🤖 AI generated colors:', aiColors);
      console.log('🎨 Style used:', data.styleName || selectedAIStyle);
      console.log('📊 AI usage count:', aiUsageCount + 1);
      
    } catch (error) {
      console.error('Error generating AI colors:', error);
      setAIError('Failed to generate AI colors. Please try again.');
      
      // Fallback to random colors on error
      const fallbackColors = generateRandomColors(12);
      setColors(fallbackColors);
      setColorInput(fallbackColors[selectedColorIndex]);
      
      Alert.alert(
        'AI Generation Failed', 
        'Could not connect to AI service. Generated random colors instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAIGenerating(false);
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={[
            styles.modalContainer, 
            { 
              width: modalWidth,
              maxHeight: modalHeight,
              minHeight: modalMinHeight,
              backgroundColor: currentTheme.uiColors.modalBackground,
              borderColor: currentTheme.uiColors.primary,
            }
          ]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: currentTheme.uiColors.secondary }]}>
              <Text style={[
                styles.title,
                { color: currentTheme.uiColors.primary }
              ]}>
                ⭐ Create Custom Theme
              </Text>
              <Text style={[
                styles.subtitle,
                { color: currentTheme.uiColors.secondary }
              ]}>
                Choose 12 colors for your wheel
              </Text>
              
              {/* Preview Colors in Header */}
              <View style={styles.headerPreviewSection}>
                <View style={styles.previewContainer}>
                  {colors.map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.previewSlice,
                        { backgroundColor: color }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Content Container with proper scroll handling */}
            <View style={styles.contentWrapper}>
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={Platform.OS === 'ios'}
                alwaysBounceVertical={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
              >
              {/* Theme Name Input */}
              <View style={styles.section}>
                <Text style={[
                  styles.sectionTitle,
                  { color: currentTheme.uiColors.text }
                ]}>
                  Theme Name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: currentTheme.uiColors.secondary,
                      color: currentTheme.uiColors.text,
                      backgroundColor: currentTheme.uiColors.cardBackground,
                    }
                  ]}
                  value={themeName}
                  onChangeText={setThemeName}
                  placeholder="Enter theme name"
                  placeholderTextColor={currentTheme.uiColors.secondary}
                  maxLength={20}
                  allowFontScaling={false}
                />
              </View>

              {/* AI Style Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[
                    styles.sectionTitle,
                    { color: currentTheme.uiColors.text }
                  ]}>
                    AI Color Style
                  </Text>
                  {Platform.OS === 'web' && (
                    <Text style={[
                      styles.scrollHint,
                      { color: currentTheme.uiColors.secondary }
                    ]}>
                      Scroll →
                    </Text>
                  )}
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={Platform.OS === 'web'}
                  style={[
                    styles.styleSelector,
                    Platform.OS === 'web' && styles.styleSelectorWeb
                  ]}
                  contentContainerStyle={styles.styleSelectorContent}
                  {...(Platform.OS === 'web' && {
                    overScrollMode: 'never', // Prevent rubber band effect on web
                  })}
                >
                  {aiColorStyles.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleButton,
                        {
                          backgroundColor: selectedAIStyle === style.id 
                            ? currentTheme.uiColors.primary 
                            : currentTheme.uiColors.cardBackground,
                          borderColor: selectedAIStyle === style.id 
                            ? currentTheme.uiColors.primary 
                            : currentTheme.uiColors.secondary,
                        }
                      ]}
                      onPress={() => setSelectedAIStyle(style.id)}
                    >
                      <Text style={[
                        styles.styleEmoji,
                        { 
                          color: selectedAIStyle === style.id 
                            ? currentTheme.uiColors.buttonText 
                            : currentTheme.uiColors.text 
                        }
                      ]}>
                        {style.emoji}
                      </Text>
                      <Text allowFontScaling={false} style={[
                        styles.styleName,
                        { 
                          color: selectedAIStyle === style.id 
                            ? currentTheme.uiColors.buttonText 
                            : currentTheme.uiColors.text 
                        }
                      ]}>
                        {style.name}
                      </Text>
                      <Text allowFontScaling={false} style={[
                        styles.styleDescription,
                        { 
                          color: selectedAIStyle === style.id 
                            ? currentTheme.uiColors.buttonText 
                            : currentTheme.uiColors.secondary 
                        }
                      ]}>
                        {style.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Color Generation Buttons */}
              <View style={styles.section}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.halfButton,
                      { backgroundColor: currentTheme.uiColors.accent }
                    ]}
                    onPress={handleRandomColors}
                  >
                    <Text allowFontScaling={false} style={[
                      styles.buttonText,
                      { color: currentTheme.uiColors.buttonText }
                    ]}>
                      🎲 Random Colors
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.halfButton,
                      { 
                        backgroundColor: isAIGenerating 
                          ? currentTheme.uiColors.secondary 
                          : currentTheme.uiColors.primary,
                        opacity: isAIGenerating ? 0.7 : 1
                      }
                    ]}
                    onPress={handleAIColors}
                    disabled={isAIGenerating}
                  >
                    {isAIGenerating ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator 
                          size="small" 
                          color={currentTheme.uiColors.buttonText} 
                        />
                        <Text allowFontScaling={false} style={[
                          styles.buttonText,
                          { color: currentTheme.uiColors.buttonText, marginLeft: 8 }
                        ]}>
                          Generating...
                        </Text>
                      </View>
                    ) : (
                      <Text allowFontScaling={false} style={[
                        styles.buttonText,
                        { color: currentTheme.uiColors.buttonText }
                      ]}>
                        ✨ AI Colors
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {aiError && (
                  <View style={styles.errorContainer}>
                    <Text allowFontScaling={false} style={[
                      styles.errorText,
                      { color: '#E74C3C' }
                    ]}>
                      ⚠️ {aiError}
                    </Text>
                  </View>
                )}


              </View>

              {/* Color Grid */}
              <View style={styles.section}>
                <Text style={[
                  styles.sectionTitle,
                  { color: currentTheme.uiColors.text }
                ]}>
                  Colors ({colors.length}/12)
                </Text>
                <View style={styles.colorGrid}>
                  {colors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorBox,
                        { backgroundColor: color },
                        selectedColorIndex === index && {
                          borderColor: currentTheme.uiColors.primary,
                          borderWidth: 3,
                        }
                      ]}
                      onPress={() => {
                        setSelectedColorIndex(index);
                        setColorInput(color);
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.colorIndex}>{index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Input */}
              <View style={styles.section}>
                <Text style={[
                  styles.sectionTitle,
                  { color: currentTheme.uiColors.text }
                ]}>
                  Edit Color #{selectedColorIndex + 1}
                </Text>

                {/* Visual Color Picker */}
                <View style={styles.visualPickerContainer}>
                  <ColorPicker
                    color={colors[selectedColorIndex]}
                    onColorChange={(newColor) => {
                      handleColorChange(selectedColorIndex, newColor);
                      setColorInput(newColor);
                    }}
                    size={Math.min(screenWidth - 120, 240)}
                  />
                </View>

                {/* Hex Input */}
                <View style={styles.hexInputSection}>
                  <Text style={[
                    styles.hexInputLabel,
                    { color: currentTheme.uiColors.text }
                  ]}>
                    Hex Code
                  </Text>
                  <View style={styles.colorInputContainer}>
                    <TextInput
                      style={[
                        styles.colorInput,
                        {
                          borderColor: currentTheme.uiColors.secondary,
                          color: currentTheme.uiColors.text,
                          backgroundColor: currentTheme.uiColors.cardBackground,
                        }
                      ]}
                      value={colorInput}
                      onChangeText={setColorInput}
                      placeholder="#FFFFFF"
                      placeholderTextColor={currentTheme.uiColors.secondary}
                      maxLength={7}
                      autoCapitalize="characters"
                      allowFontScaling={false}
                    />
                    <TouchableOpacity
                      style={[
                        styles.applyColorButton,
                        { backgroundColor: currentTheme.uiColors.accent }
                      ]}
                      onPress={() => {
                        if (isValidHexColor(colorInput)) {
                          handleColorChange(selectedColorIndex, colorInput);
                        } else {
                          Alert.alert('Invalid Color', 'Please enter a valid hex color (e.g., #FF6B6B)');
                        }
                      }}
                    >
                      <Text allowFontScaling={false} style={[
                        styles.applyColorButtonText,
                        { color: currentTheme.uiColors.buttonText }
                      ]}>
                        Apply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>


              </View>


              </ScrollView>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  { backgroundColor: currentTheme.uiColors.secondary }
                ]}
                onPress={onClose}
              >
                <Text allowFontScaling={false} style={[
                  styles.footerButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  { backgroundColor: currentTheme.uiColors.accent }
                ]}
                onPress={handleSaveTheme}
              >
                <Text allowFontScaling={false} style={[
                  styles.footerButtonText,
                  { color: currentTheme.uiColors.buttonText }
                ]}>
                  Save & Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </GestureHandlerRootView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    borderWidth: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  headerPreviewSection: {
    marginTop: 16,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 15,
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.nunito,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorIndex: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: FONTS.nunito,
  },
  colorInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.nunito,
  },
  applyColorButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyColorButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  previewContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    height: 30,
  },
  previewSlice: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  visualPickerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  randomizerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  randomizerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  singleRandomButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  randomizerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  halfButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
  },
  previewSection: {
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    marginBottom: 8,
  },
  hexInputSection: {
    marginTop: 16,
  },
  hexInputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    marginBottom: 8,
  },
  // AI Style Selection styles
  styleSelector: {
    marginTop: 8,
  },
  styleSelectorWeb: {
    // Web-specific horizontal scroll styling
    scrollbarWidth: 'thin',
    scrollbarColor: '#888 #f1f1f1',
  } as any, // Cast to any because React Native StyleSheet doesn't recognize web CSS properties
  styleSelectorContent: {
    paddingHorizontal: 4,
  },
  scrollHint: {
    fontSize: 12,
    fontFamily: FONTS.nunito,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  styleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  styleName: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    marginBottom: 2,
  },
  styleDescription: {
    fontSize: 10,
    fontFamily: FONTS.nunito,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 