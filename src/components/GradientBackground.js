import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/theme';

export default function GradientBackground({ 
  children, 
  colors = [COLORS.background.primary, COLORS.background.surface], 
  style = {},
  ...props 
}) {
  // Ensure colors is always an array
  const gradientColors = Array.isArray(colors) ? colors : [colors, colors];
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={[{ flex: 1 }, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}
