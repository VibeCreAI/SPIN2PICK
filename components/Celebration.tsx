import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface Activity {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

interface CelebrationProps {
  onComplete: () => void;
  winnerActivity?: Activity;
  slicePosition?: { x: number; y: number };
}

export const Celebration: React.FC<CelebrationProps> = ({ 
  onComplete, 
  winnerActivity,
  slicePosition 
}) => {
  const { currentTheme } = useTheme();
  const confettiRef = useRef<ConfettiCannon>(null);
  const secondaryConfettiRef = useRef<ConfettiCannon>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Simple color extraction without complex operations
  const getConfettiColors = () => {
    const colors = [];
    
    // Add winner activity color if available
    if (winnerActivity?.color) {
      colors.push(winnerActivity.color);
    }
    
    // Add theme colors (first 4 wheel colors for simplicity)
    if (currentTheme.wheelColors && currentTheme.wheelColors.length > 0) {
      colors.push(...currentTheme.wheelColors.slice(0, 4));
    }
    
    // Add theme accent colors
    if (currentTheme.uiColors?.accent) {
      colors.push(currentTheme.uiColors.accent);
    }
    if (currentTheme.uiColors?.primary) {
      colors.push(currentTheme.uiColors.primary);
    }
    
    // Fallback colors if nothing else available
    if (colors.length === 0) {
      colors.push('#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD');
    }
    
    return colors;
  };

  const confettiColors = getConfettiColors();

  useEffect(() => {
    // Start both confetti cannons immediately for instant response
    if (confettiRef.current) {
      confettiRef.current.start();
    }
    
    if (secondaryConfettiRef.current) {
      secondaryConfettiRef.current.start();
    }

    // Hide celebration after 3 seconds (longer duration)
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    return () => clearTimeout(hideTimeout);
  }, [onComplete]);

  if (!isVisible) return null;

  // Calculate confetti origin based on winner slice position
  const primaryOrigin = slicePosition ? 
    { x: slicePosition.x - 50, y: slicePosition.y } : 
    { x: -10, y: 0 };

  return (
    <View style={styles.container}>
      {/* Primary confetti from winner slice */}
      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={primaryOrigin}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={300}
        fallSpeed={2200}
        colors={confettiColors}
      />
      
      {/* Secondary confetti for screen-wide celebration */}
      <ConfettiCannon
        ref={secondaryConfettiRef}
        count={80}
        origin={{ x: -20, y: 100 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={250}
        fallSpeed={2000}
        colors={confettiColors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
}); 