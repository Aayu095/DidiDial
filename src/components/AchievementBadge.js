import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';

export default function AchievementBadge({ 
  title, 
  icon, 
  isUnlocked = false, 
  description,
  rarity = 'common', // common, rare, epic, legendary
  delay = 0 
}) {
  const getRarityColors = () => {
    switch (rarity) {
      case 'rare':
        return [COLORS.secondary[400], COLORS.secondary[600]];
      case 'epic':
        return [COLORS.accent[400], COLORS.accent[600]];
      case 'legendary':
        return [COLORS.primary[400], COLORS.primary[600]];
      default:
        return [COLORS.neutral.gray[400], COLORS.neutral.gray[600]];
    }
  };

  const getRarityBorder = () => {
    switch (rarity) {
      case 'rare':
        return COLORS.secondary[300];
      case 'epic':
        return COLORS.accent[300];
      case 'legendary':
        return COLORS.primary[300];
      default:
        return COLORS.neutral.gray[300];
    }
  };

  return (
    <Animatable.View 
      animation={isUnlocked ? "bounceIn" : "fadeIn"} 
      delay={delay}
      style={styles.container}
    >
      <LinearGradient
        colors={isUnlocked ? getRarityColors() : [COLORS.neutral.gray[300], COLORS.neutral.gray[500]]}
        style={[
          styles.badge, 
          { borderColor: isUnlocked ? getRarityBorder() : COLORS.neutral.gray[400] }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, !isUnlocked && styles.lockedIcon]}>
            {isUnlocked ? icon : '🔒'}
          </Text>
        </View>
        
        <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
          {isUnlocked ? title : 'लॉक्ड'}
        </Text>
        
        {description && (
          <Text style={[styles.description, !isUnlocked && styles.lockedText]}>
            {isUnlocked ? description : 'अभी तक अनलॉक नहीं हुआ'}
          </Text>
        )}
        
        {isUnlocked && rarity !== 'common' && (
          <View style={styles.rarityIndicator}>
            <Text style={styles.rarityText}>
              {rarity === 'legendary' ? '⭐⭐⭐' : rarity === 'epic' ? '⭐⭐' : '⭐'}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: SPACING.xs,
  },
  badge: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...SHADOWS.md,
  },
  iconContainer: {
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: 32,
    textAlign: 'center',
  },
  lockedIcon: {
    opacity: 0.5,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.tight * TYPOGRAPHY.fontSize.xs,
  },
  lockedText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  rarityIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  rarityText: {
    fontSize: 12,
  },
});
