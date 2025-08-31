import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../config/theme';

export default function VoiceVisualizer({ isActive = false, intensity = 0.5 }) {
  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isActive]);

  const startAnimation = () => {
    const animations = animatedValues.map((animatedValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.8 + (Math.random() * 0.4 * intensity),
            duration: 300 + (index * 100),
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: 300 + (index * 100),
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.stagger(100, animations).start();
  };

  const stopAnimation = () => {
    animatedValues.forEach(animatedValue => {
      Animated.timing(animatedValue, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 60],
              }),
              backgroundColor: isActive ? COLORS.primary[400] : COLORS.neutral.gray[400],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 4,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 10,
  },
});
