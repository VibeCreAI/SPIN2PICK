import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface CelebrationProps {
  onComplete: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({ onComplete }) => {
  const confettiRef = useRef<ConfettiCannon>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }

    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onComplete();
    });
  }, [fadeAnim, onComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={2500}
      />
    </Animated.View>
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