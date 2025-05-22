import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface CelebrationProps {
  onComplete: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({ onComplete }) => {
  const confettiRef = useRef<ConfettiCannon>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  return (
    <View style={styles.container}>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
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