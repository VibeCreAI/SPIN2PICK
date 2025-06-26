import { FONTS } from '@/app/_layout';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { playClickSound, playSpinningSound, playSuccessSound, stopSpinningSound } from '../utils/soundUtils';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Updated pastel colors to match reference image
const PASTEL_COLORS = [
  '#9fe7f5', // Light Blue (Sing Songs)
  '#94c4f5', // Blue (Craft Corner)
  '#b79ff5', // Purple (Jump Trampoline)
  '#f59fdc', // Pink (Plant Seeds)
  '#f59f9f', // Coral (Hide and Seek)
  '#f5c09f', // Light Orange (Dance Party)
  '#f5ea9f', // Light Yellow (Puzzle Time)
  '#c4f59f', // Light Green (Read a Book)
];

interface Activity {
  id: string;
  name: string;
  color: string;
  emoji?: string; // Added emoji field
}

interface RouletteWheelProps {
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
  onActivityDelete: (activityId: string) => void;
  onPreviousActivityChange: (activity: Activity | null) => void;
  parentWidth: number;
  selectedActivity: Activity | null;
  newlyAddedActivityId?: string | null; // ID of the newly added activity to highlight
  onNewActivityIndicatorComplete?: () => void; // Callback when indicator animation completes
  onReset?: () => void; // Callback for reset button
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  activities,
  onActivitySelect,
  onActivityDelete,
  onPreviousActivityChange,
  parentWidth,
  selectedActivity,
  newlyAddedActivityId,
  onNewActivityIndicatorComplete,
  onReset,
}) => {
  // Get screen dimensions for web platform
  const screenData = Dimensions.get('window');
  
  // Responsive width settings (matching ActivityInput)
  const screenWidth = screenData.width;
  const isNarrowScreen = screenWidth < 360; // Very narrow screens
  const isSmallScreen = screenWidth < 400; // Small screens
  const isMediumScreen = screenWidth < 500; // Medium screens
  
  // Dynamic minWidth based on screen size for better text centering (matching RouletteWheel)
  const getResponsiveMinWidth = () => {
    // Smaller minWidth on narrow screens allows text to center better
    // when content is shorter than the container width
    if (screenWidth < 320) return 260; // Very narrow - smaller minWidth for better centering
    if (screenWidth < 360) return 280; // Narrow
    if (screenWidth < 400) return 300; // Small  
    if (screenWidth < 500) return 330; // Medium
    return 340; // Wide screens - original value
  };
  
  const containerMinWidth = getResponsiveMinWidth();
  const containerMaxWidth = isSmallScreen ? '95%' : '90%';
  const containerMarginHorizontal = isNarrowScreen ? 8 : 16;
  
  // Calculate wheel size with platform-specific limits
  const WHEEL_SIZE = useMemo(() => {
    let calculatedSize = parentWidth * 0.9;
    
    // Apply size limits for web platform
    if (Platform.OS === 'web') {
      const minSize = 350; // Minimum wheel size for web
      const maxSize = Math.min(screenData.width * 0.7, screenData.height * 0.7, 350); // Max 500px or 60% of screen
      calculatedSize = Math.max(Math.min(calculatedSize, maxSize), minSize); // Apply both min and max constraints
    }
    
    return calculatedSize;
  }, [parentWidth, screenData]);
  const CENTER = useMemo(() => WHEEL_SIZE / 2, [WHEEL_SIZE]);

  const [rotation] = useState(new Animated.Value(0));
  const [isSpinning, setIsSpinning] = useState(false);
  const spinValue = useRef(0);
  const [highlightedSlice, setHighlightedSlice] = useState<string | null>(null);
  const [previousSelectedActivity, setPreviousSelectedActivity] = useState<Activity | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0.7)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // New activity indicator state and animation
  const [showNewIndicator, setShowNewIndicator] = useState<string | null>(null);
  const newIndicatorAnim = useRef(new Animated.Value(0)).current;
  const newIndicatorPulse = useRef(new Animated.Value(1)).current;

  // Optimized rotation tracking - use ref instead of state to avoid re-renders
  const currentRotationDegrees = useRef(0);
  const lastFrameTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const pulseAnimationRef = useRef<any>(null);

  // Optimize rotation listener with throttling to reduce flickering
  const updateRotation = useCallback((value: number) => {
    const now = Date.now();
    // Throttle updates to ~60fps (16.67ms intervals) for better performance
    if (now - lastFrameTime.current >= 16) {
      currentRotationDegrees.current = value % 360;
      lastFrameTime.current = now;
    }
  }, []);

  // Improved rotation listener with cleanup
  useEffect(() => {
    const listener = rotation.addListener(({ value }) => {
      updateRotation(value);
    });

    return () => {
      rotation.removeListener(listener);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [rotation, updateRotation]);

  // Update previousSelectedActivity when selectedActivity changes
  useEffect(() => {
    if (selectedActivity) {
      setPreviousSelectedActivity(selectedActivity);
      
      // Make the result bounce in
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      
      // Fade in the persistent results box
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [selectedActivity]);

  // Notify parent when previousSelectedActivity changes
  useEffect(() => {
    onPreviousActivityChange(previousSelectedActivity);
  }, [previousSelectedActivity, onPreviousActivityChange]);

  // Handle new activity indicator
  useEffect(() => {
    console.log('🆕 New activity indicator effect triggered:', newlyAddedActivityId);
    if (newlyAddedActivityId) {
      console.log('🎯 Setting new indicator for activity:', newlyAddedActivityId);
      setShowNewIndicator(newlyAddedActivityId);
      
      // Start the indicator animation
      Animated.sequence([
        Animated.timing(newIndicatorAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(newIndicatorPulse, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(newIndicatorPulse, {
              toValue: 1,
              duration: 800,
              useNativeDriver: Platform.OS !== 'web',
            })
          ]),
          { iterations: 3 } // Pulse 3 times
        )
      ]).start();
      
      // Hide the indicator after 5 seconds
      const timeout = setTimeout(() => {
        Animated.timing(newIndicatorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }).start(() => {
          setShowNewIndicator(null);
          newIndicatorAnim.setValue(0);
          newIndicatorPulse.setValue(1);
          // Notify parent that indicator animation is complete
          onNewActivityIndicatorComplete?.();
        });
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [newlyAddedActivityId]);

  // Pulsing animation for the wheel - only when not spinning
  const startPulseAnimation = useCallback(() => {
    if (isSpinning) return; // Don't pulse when spinning
    
    // Stop any existing pulse animation first
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
    }
    
    pulseAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    );
    
    pulseAnimationRef.current.start();
  }, [isSpinning, pulseAnim]);

  // Initialize animations when component mounts (moved here after startPulseAnimation declaration)
  useEffect(() => {
    // Start scale animation for wheel appearance
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    
    // Start the pulsing animation
    startPulseAnimation();
    
    // Cleanup function to prevent memory leaks
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [startPulseAnimation, pulseAnim, scaleAnim]);

  const spinWheel = useCallback(() => {
    if (isSpinning || activities.length < 2) return;
    setIsSpinning(true);
    
    // Disable new activity indicator when spinning starts
    if (showNewIndicator) {
      setShowNewIndicator(null);
      newIndicatorAnim.setValue(0);
      newIndicatorPulse.setValue(1);
      // Notify parent that indicator animation is complete
      onNewActivityIndicatorComplete?.();
    }
    
    // Stop pulse animation during spinning
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1); // Reset to normal size
    
    // Play click and spinning sounds
    playClickSound();
    playSpinningSound();
    
    // Reset bounce animation before spin
    bounceAnim.setValue(0);
    
    // Generate random extra rotations (between 2-4 full rotations)
    const randomExtraRotations = Math.floor(Math.random() * 3) + 2;
    
    // Generate random degrees for the final position (0-360)
    const randomFinalDegrees = Math.random() * 360;
    
    // Calculate total rotation with randomness
    const totalRandomDegrees = randomFinalDegrees + (360 * randomExtraRotations);
    spinValue.current += totalRandomDegrees;
    
    // Randomize initial spin speed and duration
    // Random factor between 0.7 (faster) and 1.3 (slower)
    const speedFactor = 0.7 + (Math.random() * 0.6);
    
    // Base duration is 4000ms, but adjust based on speed factor
    // Faster initial speed (smaller speedFactor) = longer spin duration
    const spinDuration = Math.round(4000 * (2 - speedFactor));
    
    // Improved easing curve for smoother deceleration
    Animated.timing(rotation, {
      toValue: spinValue.current,
      duration: spinDuration,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // More realistic deceleration
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIsSpinning(false);
      
      // Restart pulse animation after spinning
      startPulseAnimation();
      
      // Stop spinning sound and play success sound
      stopSpinningSound();
      playSuccessSound();
      
      const finalRotation = spinValue.current % 360;
      const normalizedRotation = (360 - finalRotation) % 360;
      
      const sliceAngle = 360 / activities.length;
      let selectedIndex = Math.floor(normalizedRotation / sliceAngle);
      selectedIndex = Math.min(selectedIndex, activities.length - 1); // Ensure index is within bounds

      if (activities[selectedIndex]) {
        onActivitySelect(activities[selectedIndex]);
      }
    });
  }, [isSpinning, activities.length, pulseAnim, bounceAnim, rotation, activities, onActivitySelect, startPulseAnimation, showNewIndicator, newIndicatorAnim, newIndicatorPulse, onNewActivityIndicatorComplete]);

  // Memoize rotation interpolation to prevent flickering
  const rotationInterpolation = useMemo(() => {
    return rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
      extrapolate: 'extend', // Allow values beyond 360 degrees
    });
  }, [rotation]);

  // Memoize wheel rendering to reduce computational overhead
  const wheelContent = useMemo(() => {
    if (activities.length < 2 && WHEEL_SIZE > 0) {
      const placeholderText = activities.length === 0 ? "Add at least 2 activities!" : "Add 1 more activity!";
      return (
        <SvgText 
          x={CENTER} 
          y={CENTER} 
          textAnchor="middle" 
          fontSize="16" 
          fill="#333"
          fontFamily={FONTS.jua}
        >
          {placeholderText}
        </SvgText>
      );
    }
    if (activities.length < 2) return null;

    const numActivities = activities.length;
    const sliceAngleDegrees = 360 / numActivities;

    return [
      // Background circle
      <Circle 
        key="wheel-bg" 
        cx={CENTER} 
        cy={CENTER} 
        r={CENTER * 0.95} 
        fill="#E8F4FC"
        stroke="#FFFFFF" 
        strokeWidth={2} 
      />,
      
      // Render the slices
      ...activities.map((activity, index) => {
        // Use the actual color from the activity object instead of calculating it
        const sliceColor = activity.color;
        
        const startAngleDegrees = index * sliceAngleDegrees;
        const endAngleDegrees = (index + 1) * sliceAngleDegrees;
        
        // Calculate arc path
        const startAngleRad = (startAngleDegrees - 90) * (Math.PI / 180);
        const endAngleRad = (endAngleDegrees - 90) * (Math.PI / 180);
      
        const radius = CENTER * 0.95;
        const x1 = CENTER + radius * Math.cos(startAngleRad);
        const y1 = CENTER + radius * Math.sin(startAngleRad);
        const x2 = CENTER + radius * Math.cos(endAngleRad);
        const y2 = CENTER + radius * Math.sin(endAngleRad);
      
        const largeArcFlag = endAngleDegrees - startAngleDegrees > 180 ? 1 : 0;
      
        const pathData = [
          `M ${CENTER} ${CENTER}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');

        const midAngleDegrees = startAngleDegrees + sliceAngleDegrees / 2;
        const textAngleRad = (midAngleDegrees - 90) * (Math.PI / 180);
        
        // DYNAMIC CONCENTRIC WHEELS - Size increases with activity count
        // More activities = both wheels move further from center for better space utilization
        
        // Outer wheel for emojis (dynamically expanding outward)
        const getEmojiWheelRadius = (activityCount: number) => {
          // As activities increase, emoji wheel moves closer to edge for more space
          const baseRadius = 0.75; // Starting point for few activities
          const expansionRate = 0.008; // How much to expand per activity
          const maxRadius = 0.88; // Maximum safe distance from edge
          
          const dynamicRadius = baseRadius + (activityCount * expansionRate);
          return CENTER * Math.min(dynamicRadius, maxRadius);
        };

        // Inner wheel for text (dynamically expanding but always inside emoji wheel)
        const getTextWheelRadius = (activityCount: number, hasEmoji: boolean) => {
          if (!hasEmoji) {
            // If no emoji, text can expand more into the middle-outer zone
            const baseRadius = 0.60;
            const expansionRate = 0.006;
            const maxRadius = 0.75;
            
            const dynamicRadius = baseRadius + (activityCount * expansionRate);
            return CENTER * Math.min(dynamicRadius, maxRadius);
          }
          
          // Text wheel - CLOSER to emoji wheel with smaller gap
          const baseRadius = 0.58; // Start much closer to emoji wheel
          const expansionRate = 0.01; // Slightly faster expansion to keep close
          const maxRadius = 0.80; // Higher maximum for better space usage
          
          const dynamicRadius = baseRadius + (activityCount * expansionRate);
          return CENTER * Math.min(dynamicRadius, maxRadius);
        };

                          const emojiRadius = getEmojiWheelRadius(activities.length);
         const textRadius = getTextWheelRadius(activities.length, !!activity.emoji);
         
         // TEXT ALIGNMENT FIX - All text starts from same distance from center
         // Instead of centering text at radius, we position it to start at the text wheel boundary
         const textStartX = CENTER + textRadius * Math.cos(textAngleRad);
         const textStartY = CENTER + textRadius * Math.sin(textAngleRad);
        
        // Dynamic font sizes based on activity count
        const getDynamicSizes = (activityCount: number) => {
          // Base sizes for optimal readability
          const baseTextSize = 14;
          const baseEmojiSize = 22;
          
          // Scaling factors based on activity count
          if (activityCount <= 4) return { textSize: baseTextSize, emojiSize: baseEmojiSize + 4 }; // Larger for few items
          if (activityCount <= 6) return { textSize: baseTextSize, emojiSize: baseEmojiSize }; // Standard
          if (activityCount <= 8) return { textSize: baseTextSize - 1, emojiSize: baseEmojiSize - 2 }; // Slightly smaller
          if (activityCount <= 14) return { textSize: baseTextSize - 2, emojiSize: baseEmojiSize - 3 }; // Smaller
          if (activityCount <= 26) return { textSize: baseTextSize - 3, emojiSize: baseEmojiSize - 4 }; // Much smaller
          return { textSize: Math.max(baseTextSize - 4, 8), emojiSize: Math.max(baseEmojiSize - 8, 12) }; // Minimum readable
        };

        const { textSize: fontSize, emojiSize: emojiFontSize } = getDynamicSizes(activities.length);

        // Calculate emoji position using the new function
        const emojiPositionRadius = emojiRadius;
        const emojiX = CENTER + emojiPositionRadius * Math.cos(textAngleRad);
        const emojiY = CENTER + emojiPositionRadius * Math.sin(textAngleRad);
        
        // Calculate text rotation angle
        const textRotationAngle = midAngleDegrees + 90;

        // Check if slice is highlighted for deletion
        const isHighlighted = highlightedSlice === activity.id;
        const fillColor = isHighlighted ? 
          `rgba(${parseInt(sliceColor.slice(1, 3), 16)}, ${parseInt(sliceColor.slice(3, 5), 16)}, ${parseInt(sliceColor.slice(5, 7), 16)}, 0.7)` : 
          sliceColor;

        // SMART CHARACTER LIMITS for concentric wheel system
        // Calculate available space in the inner text wheel
        const getDynamicMaxChars = (activityCount: number, sliceAngleDegrees: number, hasEmoji: boolean) => {
          // Calculate the arc length available in the text wheel
          const textWheelCircumference = 2 * Math.PI * textRadius;
          const availableArcLength = (sliceAngleDegrees / 360) * textWheelCircumference;
          
          // Estimate character width based on font size (more conservative approximation)
          const avgCharWidth = fontSize * 0.7; // More conservative character width
          const maxCharsFromSpace = Math.floor(availableArcLength / avgCharWidth);
          
          // FORCE SINGLE LINE for many activities to save vertical space
          if (activityCount >= 12) {
            // For many activities, be very restrictive
            return Math.max(Math.min(maxCharsFromSpace, 8), 3); // Very short single-line
          }
          
          // For fewer activities, ENCOURAGE WRAPPING by using lower character limits
          if (activityCount <= 4) {
            // Force wrapping for wide slices to utilize vertical space better
            return Math.min(maxCharsFromSpace, 8); // Lower limit to encourage wrapping
          }
          if (activityCount <= 6) {
            return Math.min(maxCharsFromSpace, 9); // Encourage wrapping
          }
          if (activityCount <= 8) {
            return Math.min(maxCharsFromSpace, 10); // Standard
          }
          if (activityCount <= 10) {
            return Math.min(maxCharsFromSpace, 12); // Getting tighter
          }
          
          // For 11+ activities, be restrictive
          return Math.max(Math.min(maxCharsFromSpace, 7), 4); // Short but readable
        };

        const wordWrap = (text: string): string[] => {
          const maxChars = getDynamicMaxChars(activities.length, sliceAngleDegrees, !!activity.emoji);
          
          // Debug logging for dynamic concentric wheel system (can be removed later)
          if (activity.id === activities[0]?.id) {
            const textWheelCircumference = 2 * Math.PI * textRadius;
            const availableArcLength = (sliceAngleDegrees / 360) * textWheelCircumference;
            const avgCharWidth = fontSize * 0.7;
            const maxCharsFromSpace = Math.floor(availableArcLength / avgCharWidth);
            
            console.log(`🎯 Dynamic Concentric Wheels for ${activities.length} activities:`);
            console.log(`   📏 Text wheel: ${(textRadius/CENTER*100).toFixed(1)}% | Emoji wheel: ${(emojiRadius/CENTER*100).toFixed(1)}%`);
            console.log(`   🔤 Font sizes: text=${fontSize}px, emoji=${emojiFontSize}px`);
            console.log(`   📐 Arc calc: ${availableArcLength.toFixed(1)}px ÷ ${avgCharWidth.toFixed(1)}px = ${maxCharsFromSpace} chars`);
            console.log(`   📝 Final limit: ${maxChars} chars (after activity-based cap)`);
            console.log(`   🎨 Slice angle: ${sliceAngleDegrees.toFixed(1)}°`);
            console.log(`   ✨ Text alignment: START from wheel boundary (not centered)`);
          }
          
          // FORCE SINGLE LINE for many activities by truncating if necessary
          if (activities.length >= 12) {
            if (text.length <= maxChars) {
              return [text];
            } else {
              // Try to truncate at word boundary first
              const words = text.split(' ');
              if (words.length > 1) {
                // Try to fit first word(s)
                let truncated = words[0];
                for (let i = 1; i < words.length; i++) {
                  const candidate = truncated + ' ' + words[i];
                  if (candidate.length <= maxChars - 1) {
                    truncated = candidate;
                  } else {
                    break;
                  }
                }
                if (truncated.length < text.length) {
                  return [truncated + '…'];
                }
              }
              // Fall back to character truncation
              return [text.substring(0, maxChars - 1) + '…'];
            }
          }
          
          // No wrapping needed for short text
          if (text.length <= maxChars) return [text];
          
          const words = text.split(' ');
          const lines: string[] = [];
          
          // Try word-based wrapping first
          if (words.length > 1 && !words.some(w => w.length > maxChars)) {
            let currentLine = '';
            
            for (const word of words) {
              if (currentLine.length === 0) {
                currentLine = word;
              } else if ((currentLine + ' ' + word).length <= maxChars) {
                currentLine += ' ' + word;
              } else {
                lines.push(currentLine);
                currentLine = word;
              }
            }
            
            if (currentLine.length > 0) {
              lines.push(currentLine);
            }
          } 
          // Fall back to character wrapping for long words
          else {
            let currentLine = '';
            for (let i = 0; i < text.length; i++) {
              currentLine += text[i];
              if (currentLine.length >= maxChars && i < text.length - 1) {
                lines.push(currentLine);
                currentLine = '';
              }
            }
            
            if (currentLine.length > 0) {
              lines.push(currentLine);
            }
          }
          
          return lines;
        };
        
        const textLines = wordWrap(activity.name);
        
        // Direct rendering of text with specific positioning
        const renderActivityText = () => {
          // For single lines, simpler positioning
          if (textLines.length === 1) {
            return (
              <SvgText
                x={textStartX}
                y={textStartY}
                fill="#4e4370"
                fontSize={fontSize}
                fontFamily={FONTS.jua}
                textAnchor="start"
                alignmentBaseline="middle"
                transform={`rotate(${textRotationAngle}, ${textStartX}, ${textStartY})`}
                textDecoration="none"
              >
                {activity.name}
              </SvgText>
            );
          } 
          // Multi-line text needs specific alignment
          else {
            // Dynamic line spacing based on font size and activity count
            const getLineSpacing = (fontSize: number, activityCount: number) => {
              const baseSpacing = fontSize * 1.15;
              // Tighter spacing for more activities to fit better
              if (activityCount <= 6) return baseSpacing;
              if (activityCount <= 12) return fontSize * 1.1;
              return fontSize * 1.05; // Tighter for many activities
            };
            
            const lineSpacing = getLineSpacing(fontSize, activities.length);
            const totalHeight = textLines.length * lineSpacing;
            const verticalOffset = -(totalHeight / 2) + (lineSpacing / 2);
            
            return textLines.map((line, index) => {
              // Calculate vertical position for this line
              const lineY = textStartY + verticalOffset + (index * lineSpacing);
              
              return (
                <SvgText
                  key={`line-${index}`}
                  x={textStartX}
                  y={lineY}
                  fill="#4e4370"
                  fontSize={fontSize}
                  fontFamily={FONTS.jua}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  transform={`rotate(${textRotationAngle}, ${textStartX}, ${textStartY})`}
                  textDecoration="none"
                >
                  {line}
                </SvgText>
              );
            });
          }
        };

        // Render emoji if available
        const renderEmoji = () => {
          if (!activity.emoji) return null;
          
          return (
            <SvgText
              x={emojiX}
              y={emojiY}
              fill="#333333"
              fontSize={emojiFontSize}
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${textRotationAngle}, ${emojiX}, ${emojiY})`}
            >
              {activity.emoji}
            </SvgText>
          );
        };

        // Check if this is the newly added activity
        const isNewActivity = showNewIndicator === activity.id;
        if (isNewActivity) {
          console.log('✨ Rendering NEW indicator for activity:', activity.name, activity.id);
        }

        return (
          <G key={`segment-${activity.id}`}>
            {isNewActivity ? (
              <AnimatedPath 
                d={pathData} 
                fill={fillColor}
                stroke="#4e4370"
                strokeWidth={newIndicatorPulse.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [4, 6]
                })}
                opacity={newIndicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })}
              />
            ) : (
              <Path 
                d={pathData} 
                fill={fillColor}
                stroke="#FFFFFF" 
                strokeWidth={2}
                opacity={isSpinning ? 1 : (isHighlighted ? 0.7 : 0.9)}
              />
            )}
            {renderActivityText()}
            {renderEmoji()}
          </G>
        );
      })
    ];
  }, [activities, CENTER, WHEEL_SIZE, highlightedSlice, isSpinning, showNewIndicator, newIndicatorAnim, newIndicatorPulse]);

  const renderWheel = () => {
    return wheelContent;
  };

  // Handle deleting an activity when trash icon is clicked
  const handleDeleteActivity = (activityId: string) => {
    if (isSpinning || activities.length <= 2) {
      if (activities.length <= 2) {
        alert("You need at least two activities to keep the fun going!");
      }
      return;
    }

    // Play click sound for feedback
    playClickSound();
    
    // Trigger haptic feedback if available
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Ignore if haptics not available
    }
    
    // Delete the activity
    onActivityDelete(activityId);
  };

  // Calculate which activity is at a specific angle
  const getActivityAtAngle = (angle: number): Activity | null => {
    if (activities.length === 0) return null;
    
    const sliceAngle = 360 / activities.length;
    
    // Normalize angle to 0-360 range
    const normalizedAngle = (angle + 360) % 360;
    
    // Calculate which slice index this angle falls into
    // We need to account for the wheel's current rotation
    const effectiveAngle = (normalizedAngle + currentRotationDegrees.current) % 360;
    const sliceIndex = Math.floor(effectiveAngle / sliceAngle);
    
    // Make sure index is valid
    if (sliceIndex >= 0 && sliceIndex < activities.length) {
      return activities[sliceIndex];
    }
    
    return null;
  };

  // Create positions for the touch buttons
  const buttonPositions = useMemo(() => {
    if (activities.length < 2) return [];
    
    const sliceAngleDegrees = 360 / activities.length;
    
    return activities.map((activity, index) => {
      const midAngleDegrees = index * sliceAngleDegrees + sliceAngleDegrees / 2;
      const angleRad = (midAngleDegrees - 90) * (Math.PI / 180);
      
      // Position buttons at 60% of radius (same as text)
      const buttonRadius = CENTER * 0.6;
      const x = CENTER + buttonRadius * Math.cos(angleRad);
      const y = CENTER + buttonRadius * Math.sin(angleRad);
      
      return {
        id: activity.id,
        x: x - 25, // Center the 50x30 button
        y: y - 15,
        angle: midAngleDegrees
      };
    });
  }, [activities, CENTER]);

  // Comprehensive cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up all animations when component unmounts
      rotation.stopAnimation();
      pulseAnim.stopAnimation();
      bounceAnim.stopAnimation();
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
      }
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [rotation, pulseAnim, bounceAnim, fadeAnim, scaleAnim]);

  if (WHEEL_SIZE <= 0) {
    return (
        <View style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>Wheel cannot be displayed (size: {WHEEL_SIZE})</ThemedText>
        </View>
    );
  }
  
  const canSpin = activities.length >= 2;

  return (
    <ThemedView lightColor="transparent" darkColor="transparent" style={styles.container}>
      {/* Platform-specific margin adjustment for Android */}
      <ThemedView style={[
        styles.pointerContainer, 
        { 
          left: '50%', 
          marginLeft: Platform.OS === 'android' ? -20 : -16,
          top: -7,
        }
      ]}>
        <ThemedView style={styles.pointerBorder} />
        <ThemedView style={styles.pointer} />
      </ThemedView>

      <Animated.View 
        style={{ 
          width: WHEEL_SIZE, 
          height: WHEEL_SIZE, 
          alignItems: 'center', 
          justifyContent: 'center',
          transform: [
            { scale: scaleAnim },
            { perspective: 1000 }
          ]
        }}
      >
        <Animated.View
          style={[
            {
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: [
                { rotate: rotationInterpolation },
                { scale: pulseAnim }
              ],
            },
          ]}
        >
          <View style={styles.svgContainer}>
            <Svg 
              width={WHEEL_SIZE} 
              height={WHEEL_SIZE} 
              viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            >
              {renderWheel()}
            </Svg>
          </View>
        </Animated.View>
        
        {/* Overlay deletion buttons that rotate with the wheel */}
        <Animated.View
          style={[
            styles.buttonOverlay,
            {
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              transform: [{ rotate: rotationInterpolation }],
            },
          ]}
          pointerEvents="box-none"
        >
          {!isSpinning && buttonPositions.map((button) => (
            <TouchableOpacity
              key={`delete-button-${button.id}`}
              style={[
                styles.deleteButton,
                {
                  left: button.x,
                  top: button.y,
                  transform: [{ rotate: `${button.angle + 90}deg` }]
                }
              ]}
              onPress={() => handleDeleteActivity(button.id)}
              activeOpacity={0.7}
              disabled={isSpinning || activities.length <= 2}
            >
              {/* Empty Text component keeps the button working but invisible */}
              <Text allowFontScaling={false} style={styles.invisibleText}></Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {canSpin && !selectedActivity && (
          <TouchableOpacity
            style={[styles.spinButton, styles.spinButtonCenter]}
            onPress={spinWheel}
            disabled={isSpinning}
          >
            <ThemedText style={styles.spinButtonText}>SPIN</ThemedText>
          </TouchableOpacity>
        )}
        
        {selectedActivity && (
          <Animated.View 
            style={[
              styles.spinButton, 
              styles.spinButtonCenter, 
              styles.resultCenter,
              { 
                transform: [
                  { scale: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }
                ] 
              }
            ]}
          >
            <ThemedText style={styles.resultSubtext}>
              Let's play:
            </ThemedText>
            <ThemedText style={styles.resultCenterText}>
              {selectedActivity.emoji ? `${selectedActivity.emoji} ${selectedActivity.name}` : selectedActivity.name}
            </ThemedText>
          </Animated.View>
        )}
      </Animated.View>

      {/* Instruction text with reset button - positioned relative to avoid flickering */}
      <ThemedView lightColor="transparent" darkColor="transparent" style={styles.instructionContainer}>
        <ThemedView lightColor="transparent" darkColor="transparent" style={styles.instructionRow}>
          <ThemedText style={styles.instructionText}>
            Tap activity name to remove 🗑️
          </ThemedText>
          {onReset && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={onReset}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.resetButtonText}>🔄 Reset</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Last selected activity box - positioned relative to avoid flickering */}
      <ThemedView 
        lightColor="#fff" 
        darkColor="#fff" 
        style={[styles.lastActivityContainer, {
          minWidth: containerMinWidth,
          maxWidth: containerMaxWidth,
          marginHorizontal: containerMarginHorizontal,
        }]}
      >
        <ThemedView lightColor="#fff" darkColor="#fff" style={styles.lastActivityContent}>
          <ThemedView lightColor="#fff" darkColor="#fff" style={styles.labelContainer}>
            <Text allowFontScaling={false} style={styles.lastActivityLabel}>Last selected activity:</Text>
          </ThemedView>
          <ThemedView lightColor="#fff" darkColor="#fff" style={styles.activityTextContainer}>
            <Text allowFontScaling={false} style={styles.lastActivityText}>
              {previousSelectedActivity 
                ? (previousSelectedActivity.emoji ? `${previousSelectedActivity.emoji} ${previousSelectedActivity.name}` : previousSelectedActivity.name)
                : ""
              }
            </Text>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Copyright text - positioned relative to avoid flickering */}
      <ThemedView lightColor="transparent" darkColor="transparent" style={styles.copyrightContainer}>
        <ThemedText style={styles.copyrightText}>
          © {new Date().getFullYear()} VibeCreAI - All rights reserved
        </ThemedText>
      </ThemedView>

      {!canSpin && (
        <ThemedView lightColor="#f0f0f0" darkColor="#f0f0f0" style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>
            {activities.length === 0 ? "Add at least 2 activities!" : "Add 1 more activity!"}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Platform.OS === 'web' ? 5 : 10,
    marginBottom: 60,
    position: 'relative',
    width: '100%',
  },
  pointerContainer: {
    position: 'absolute',
    top: -5,
    zIndex: 30,
    width: 36, // Explicit width of the visual pointer
  },
  pointerBorder: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderTopWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF', // White border
    position: 'absolute',
    left: 0,
    top: 0,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#9fe7f5',
    position: 'absolute', // Explicitly absolute
    left: 3, // (36 - 30) / 2 to center within pointerBorder
    top: 1.5, // Adjusts for border thickness difference
  },
  spinButton: { 
    width: 100,
    height: 100,
    borderRadius: 50, 
    backgroundColor: '#B6E0F8', // Light blue to match the center of the reference image
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  spinButtonCenter: { 
    position: 'absolute', 
  },
  spinButtonText: {
    fontSize: 28, 
    color: '#4e4370',
    fontFamily: FONTS.jua,
  },
  messageContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 9999, // Perfect circle
  },
  wheelTouchOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999, // Perfect circle
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  instructionContainer: {
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12, // Reduced from 20 for narrow screens
    marginTop: 8,
    width: '100%',
  },
  instructionRow: {
    flexDirection: 'column', // Stack vertically on narrow screens
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // Reduced gap
    width: '100%',
  },
  instructionText: {
    fontSize: 16, // Reduced from 16
    color: '#666',
    fontFamily: FONTS.jua,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  resetButton: {
    backgroundColor: '#4e4370',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: FONTS.jua,
    textAlign: 'center',
  },
  lastActivityContainer: {
    alignSelf: 'center', // Center the container
    width: 'auto', // Let content determine width
    marginVertical: 8, // Added to match ActivityInput
    marginTop: 5,
    marginBottom: 7, // Added to match ActivityInput
    padding: 16, // Changed from 15 to match ActivityInput
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8F4FC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    // Add explicit centering
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastActivityContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  labelContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastActivityLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.jua, // Back to original font
    textAlign: 'center',
  },
  activityTextContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastActivityText: {
    fontSize: 22,
    color: '#4e4370',
    fontFamily: FONTS.jua, // Back to original font
    marginTop: 4,
    textAlign: 'center',
  },
  copyrightContainer: {
    marginTop: 10, // Fixed margin instead of absolute positioning
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontFamily: FONTS.jua,
  },
  resultCenter: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Slightly transparent white
    borderColor: '#9fe7f5',
    borderWidth: 3,
    width: 300, // 100% larger horizontally (was 150)
    height: 150,
  },
  resultCenterText: {
    fontSize: 36,
    color: '#4e4370',
    fontFamily: FONTS.jua,
    textAlign: 'center',
    padding: 5,
  },
  resultSubtext: {
    fontSize: 24, // Increased accordingly (was 18)
    color: '#333',
    fontFamily: FONTS.jua,
    textAlign: 'center',
  },
  buttonOverlay: {
    position: 'absolute',
    pointerEvents: 'box-none',
  },
  deleteButton: {
    position: 'absolute',
    width: 50,
    height: 30,
    backgroundColor: 'transparent', // Make button background transparent
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // Remove border
    zIndex: 20,
  },
  invisibleText: {
    fontSize: 1,
    color: 'transparent',
    height: 0,
    opacity: 0,
  },
}); 