import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationBell from './NotificationBell';
import UpdatedHeaderMenu from './UpdatedHeaderMenu';
import { SPACING } from '../config/theme';

export default function HeaderRightSection({ navigation }) {
  return (
    <View style={styles.headerRightContainer}>
      <NotificationBell navigation={navigation} />
      <UpdatedHeaderMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.xs,
  },
});