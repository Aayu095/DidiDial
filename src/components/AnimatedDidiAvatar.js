import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../config/theme';

const { width } = Dimensions.get('window');

export default function AnimatedDidiAvatar({ 
  isListening = false, 
  isSpeaking = false, 
  emotion = 'neutral',
  size = 120 
}) {
  const [currentExpression, setCurrentExpression] = useState('neutral');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;

  // Animation effects based on state
  useEffect(() => {
    if (isListening) {
      // Gentle pulsing when listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  useEffect(() => {
    if (isSpeaking) {
      // Mouth animation when speaking
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(mouthAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      mouthAnim.setValue(0);
    }
  }, [isSpeaking]);

  // Blinking animation
  useEffect(() => {
    const blinkLoop = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Random blink interval between 2-5 seconds
        setTimeout(blinkLoop, Math.random() * 3000 + 2000);
      });
    };
    blinkLoop();
  }, []);

  // Update expression based on emotion
  useEffect(() => {
    setCurrentExpression(emotion);
  }, [emotion]);

  const getAvatarStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.background.surface,
      borderWidth: 4,
      borderColor: COLORS.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: COLORS.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    };

    if (isListening) {
      baseStyle.borderColor = COLORS.status.success;
      baseStyle.shadowColor = COLORS.status.success;
    } else if (isSpeaking) {
      baseStyle.borderColor = COLORS.accent[500];
      baseStyle.shadowColor = COLORS.accent[500];
    }

    return baseStyle;
  };

  const getFaceExpression = () => {
    switch (currentExpression) {
      case 'happy':
        return { eyes: '😊', eyeScale: 1.2 };
      case 'encouraging':
        return { eyes: '😌', eyeScale: 1.1 };
      case 'thinking':
        return { eyes: '🤔', eyeScale: 1.0 };
      case 'concerned':
        return { eyes: '😟', eyeScale: 1.0 };
      case 'proud':
        return { eyes: '😊', eyeScale: 1.3 };
      default:
        return { eyes: '😊', eyeScale: 1.0 };
    }
  };

  const face = getFaceExpression();
  const mouthHeight = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 8],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          getAvatarStyle(),
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
          },
        ]}
      >
        {/* Face Background */}
        <View style={styles.face}>
          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <Animated.View
              style={[
                styles.eye,
                {
                  transform: [{ scaleY: blinkAnim }],
                },
              ]}
            >
              <View style={styles.eyeball} />
            </Animated.View>
            <Animated.View
              style={[
                styles.eye,
                {
                  transform: [{ scaleY: blinkAnim }],
                },
              ]}
            >
              <View style={styles.eyeball} />
            </Animated.View>
          </View>

          {/* Nose */}
          <View style={styles.nose} />

          {/* Mouth */}
          <Animated.View
            style={[
              styles.mouth,
              {
                height: mouthHeight,
                borderRadius: mouthHeight / 2,
              },
            ]}
          />

          {/* Cheeks (when happy) */}
          {(currentExpression === 'happy' || currentExpression === 'proud') && (
            <>
              <View style={[styles.cheek, styles.leftCheek]} />
              <View style={[styles.cheek, styles.rightCheek]} />
            </>
          )}
        </View>

        {/* Hair/Dupatta */}
        <View style={styles.hair} />
        
        {/* Bindi */}
        <View style={styles.bindi} />
      </Animated.View>

      {/* Status indicator */}
      {isListening && (
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.status.success }]} />
          <View style={[styles.statusDot, { backgroundColor: COLORS.status.success }]} />
          <View style={[styles.statusDot, { backgroundColor: COLORS.status.success }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    width: '80%',
    height: '80%',
    backgroundColor: '#F4D1AE', // Warm skin tone
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: -10,
  },
  eye: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  eyeball: {
    width: 6,
    height: 6,
    backgroundColor: '#2F1B14',
    borderRadius: 3,
  },
  nose: {
    width: 3,
    height: 6,
    backgroundColor: '#E6C2A6',
    borderRadius: 2,
    marginTop: 2,
  },
  mouth: {
    width: 16,
    backgroundColor: '#D2691E',
    marginTop: 8,
    minHeight: 2,
  },
  cheek: {
    width: 8,
    height: 8,
    backgroundColor: '#F0B27A',
    borderRadius: 4,
    position: 'absolute',
    top: '45%',
  },
  leftCheek: {
    left: '15%',
  },
  rightCheek: {
    right: '15%',
  },
  hair: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    height: '50%',
    backgroundColor: '#2F1B14',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: -1,
  },
  bindi: {
    position: 'absolute',
    top: '25%',
    width: 4,
    height: 4,
    backgroundColor: '#DC143C',
    borderRadius: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
});
