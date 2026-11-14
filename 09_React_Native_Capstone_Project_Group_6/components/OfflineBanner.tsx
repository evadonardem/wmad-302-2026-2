/**
 * Small banner shown when the data on screen came from the offline copy
 * (the phone had no internet). It reads the flag kept by recipeApi.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';

export function OfflineBanner() {
  const { colors } = useTheme();
  if (!recipeApi.isUsingCache) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.secondaryContainer }]}>
      <MaterialCommunityIcons name="cloud-off-outline" size={18} color={colors.onSecondaryContainer} />
      <Text variant="labelLarge" style={{ color: colors.onSecondaryContainer }}>
        Offline - showing saved recipes
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
});
