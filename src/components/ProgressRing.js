import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/theme';

export default function ProgressRing({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8, 
  children,
  color = COLORS.primary[500],
  backgroundColor = COLORS.neutral.gray[200]
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Animatable.View animation="zoomIn" style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={[styles.content, { width: size, height: size }]}>
        {children || (
          <View style={styles.defaultContent}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            <Text style={styles.label}>पूर्ण</Text>
          </View>
        )}
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultContent: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[600],
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray[600],
    marginTop: SPACING.xs,
  },
});
