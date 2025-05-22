import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { FONTS } from '../app/_layout';
import { playClickSound, playSpinningSound, playSuccessSound, stopSpinningSound } from '../utils/soundUtils';
import { ThemedText } from './ThemedText';

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
  parentWidth: number;
  selectedActivity: Activity | null;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  activities,
  onActivitySelect,
  onActivityDelete,
  parentWidth,
  selectedActivity,
}) => {
  const WHEEL_SIZE = useMemo(() => parentWidth * 0.9, [parentWidth]);
  const CENTER = useMemo(() => WHEEL_SIZE / 2, [WHEEL_SIZE]);

  const [rotation] = useState(new Animated.Value(0));
  const [isSpinning, setIsSpinning] = useState(false);
  const spinValue = useRef(0);
  const [highlightedSlice, setHighlightedSlice] = useState<string | null>(null);
  const [previousSelectedActivity, setPreviousSelectedActivity] = useState<Activity | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // The actual rotation value in degrees, used for slice positioning
  const [currentRotationDegrees, setCurrentRotationDegrees] = useState(0);

  // Update current rotation when animation runs
  rotation.addListener(({ value }) => {
    setCurrentRotationDegrees(value % 360);
  });

  // Initialize animations when component mounts
  useEffect(() => {
    // Start scale animation for wheel appearance
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Start the pulsing animation
    startPulseAnimation();
  }, []);

  // Update previousSelectedActivity when selectedActivity changes
  useEffect(() => {
    if (selectedActivity) {
      setPreviousSelectedActivity(selectedActivity);
      
      // Make the result bounce in
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Fade in the persistent results box
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedActivity]);

  // Pulsing animation for the wheel
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const spinWheel = () => {
    if (isSpinning || activities.length < 2) return;
    setIsSpinning(true);
    
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
    
    // Create easing with randomized tension for varied spin feel
    const randomTension = 0.8 + (Math.random() * 0.4); // 0.8 - 1.2
    
    Animated.timing(rotation, {
      toValue: spinValue.current,
      duration: spinDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      
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
  };

  const renderWheel = () => {
    if (activities.length < 2 && WHEEL_SIZE > 0) {
      const placeholderText = activities.length === 0 ? "Add at least 2 activities!" : "Add 1 more activity!";
      return (
        <SvgText 
          x={CENTER} 
          y={CENTER} 
          textAnchor="middle" 
          fontSize="16" 
          fill="#333"
          fontFamily="Nunito-Bold"
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
        // Use the new pastel colors
        const colorIndex = index % PASTEL_COLORS.length;
        const sliceColor = PASTEL_COLORS[colorIndex];
        
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
        
        // Position text closer to the center, but not too close
        const textRadius = CENTER * 0.6; // Adjusted from 0.5 to 0.58 to move text slightly away from center
        const textX = CENTER + textRadius * Math.cos(textAngleRad);
        const textY = CENTER + textRadius * Math.sin(textAngleRad);
        
        // Position emoji near the outer edge of the wheel
        const emojiRadius = CENTER * 0.83; // Adjusted from 0.85 to 0.8 for better spacing with text
        const emojiX = CENTER + emojiRadius * Math.cos(textAngleRad);
        const emojiY = CENTER + emojiRadius * Math.sin(textAngleRad);
        
        // Unified font size
        const fontSize = 11;
        const emojiFontSize = 22; // Increased from 16 to 22 for larger emojis
        
        // Calculate text rotation angle
        const textRotationAngle = midAngleDegrees + 90;

        // Check if slice is highlighted for deletion
        const isHighlighted = highlightedSlice === activity.id;
        const fillColor = isHighlighted ? 
          `rgba(${parseInt(sliceColor.slice(1, 3), 16)}, ${parseInt(sliceColor.slice(3, 5), 16)}, ${parseInt(sliceColor.slice(5, 7), 16)}, 0.7)` : 
          sliceColor;

        // Simple word wrap function
        const wordWrap = (text: string): string[] => {
          let maxChars: number;
          
          // Adjust max characters based on slice width
          if (sliceAngleDegrees < 35) maxChars = 7;       // Increased from 6 to 7
          else if (sliceAngleDegrees < 45) maxChars = 8;  // Increased from 7 to 8
          else if (sliceAngleDegrees < 60) maxChars = 9;  // Increased from 8 to 9
          else maxChars = 10;                             // Increased from 9 to 10
          
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
                x={textX}
                y={textY}
                fill="#333333"
                fontSize={fontSize}
                fontWeight="bold" 
                fontFamily="Nunito-Bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform={`rotate(${textRotationAngle}, ${textX}, ${textY})`}
                textDecoration="none"
              >
                {activity.name}
              </SvgText>
            );
          } 
          // Multi-line text needs specific alignment
          else {
            const lineSpacing = fontSize * 1.3;
            const totalHeight = textLines.length * lineSpacing;
            const verticalOffset = -(totalHeight / 2) + (lineSpacing / 2);
            
            return textLines.map((line, index) => {
              // Calculate vertical position for this line
              const lineY = textY + verticalOffset + (index * lineSpacing);
              
              return (
                <SvgText
                  key={`line-${index}`}
                  x={textX}
                  y={lineY}
                  fill="#333333"
                  fontSize={fontSize}
                  fontWeight="bold" 
                  fontFamily="Nunito-Bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${textRotationAngle}, ${textX}, ${textY})`}
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

        return (
          <G key={`segment-${activity.id}`}>
            <Path 
              d={pathData} 
              fill={fillColor}
              stroke="#FFFFFF" 
              strokeWidth={2}
              opacity={isSpinning ? 1 : (isHighlighted ? 0.7 : 0.9)}
            />
            {renderActivityText()}
            {renderEmoji()}
          </G>
        );
      })
    ];
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
    const effectiveAngle = (normalizedAngle + currentRotationDegrees) % 360;
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

  if (WHEEL_SIZE <= 0) {
    return (
        <View style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>Wheel cannot be displayed (size: {WHEEL_SIZE})</ThemedText>
        </View>
    );
  }
  
  const canSpin = activities.length >= 2;

  return (
    <View style={styles.container}>
      {/* Platform-specific margin adjustment for Android */}
      <View style={[
        styles.pointerContainer, 
        { 
          left: '50%', 
          marginLeft: Platform.OS === 'android' ? -20 : -16,
          top: -7,
        }
      ]}>
        <View style={styles.pointerBorder} />
        <View style={styles.pointer} />
      </View>

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
                { rotate: rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
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
              transform: [{ rotate: rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }],
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
              <Text style={styles.invisibleText}></Text>
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

      {/* Instruction text - moved above the last selected activity box */}
      <View style={styles.instructionContainer}>
        <ThemedText style={styles.instructionText}>
          Tap on an activity name to remove it from the wheel
        </ThemedText>
      </View>

      {/* Persistent results box at the bottom */}
      {previousSelectedActivity && (
        <Animated.View 
          style={[
            styles.persistentResultBox,
            {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }
          ]}
        >
          <ThemedText style={styles.persistentResultLabel}>Last selected activity:</ThemedText>
          <ThemedText style={styles.persistentResultText}>
            {previousSelectedActivity.emoji ? `${previousSelectedActivity.emoji} ${previousSelectedActivity.name}` : previousSelectedActivity.name}
          </ThemedText>
        </Animated.View>
      )}

      {!canSpin && (
        <View style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>
            {activities.length === 0 ? "Add at least 2 activities!" : "Add 1 more activity!"}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
    width: '100%', // Ensure full width
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
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#4e4370',
    fontFamily: FONTS.gamjaFlower,
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
    marginTop: 10,
    alignItems: 'center',
    padding: 5,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Nunito',
    textAlign: 'center',
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
    fontWeight: 'bold',
    color: '#4e4370',
    fontFamily: FONTS.gamjaFlower,
    textAlign: 'center',
    padding: 5,
  },
  resultSubtext: {
    fontSize: 24, // Increased accordingly (was 18)
    color: '#333',
    fontFamily: 'Nunito',
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
  persistentResultBox: {
    marginTop: 15,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    width: 'auto', // Match parent width
    alignSelf: 'stretch', // Make it stretch horizontally like the input box
    borderWidth: 2,
    borderColor: '#E8F4FC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  persistentResultLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Nunito',
  },
  persistentResultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4e4370',
    fontFamily: FONTS.gamjaFlower,
    textAlign: 'center',
    marginTop: 4,
  },
}); 