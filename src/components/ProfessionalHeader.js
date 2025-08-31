import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/theme';

export default function ProfessionalHeader() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        {/* Main Logo */}
        <Text style={styles.logoText}>DidiDial</Text>
        
        {/* Tagline */}
        <Text style={styles.taglineText}>दीदी के साथ सीखें</Text>
        
        {/* Decorative Elements - At the very bottom, centered */}
        <View style={styles.decorativeElements}>
          <View style={styles.decorativeDot} />
          <View style={styles.decorativeLine} />
          <View style={styles.decorativeDot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    // Removed LinearGradient background
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'System',
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  decorativeElements: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    gap: 3,
  },
  decorativeDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  decorativeLine: {
    width: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});