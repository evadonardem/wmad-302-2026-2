/**
 * ScreenHeader - back arrow + title, used on screens that open on top of the tabs
 * (Checkout, Orders, Order detail).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';

interface ScreenHeaderProps {
  title: string;
}

export function ScreenHeader({ title }: ScreenHeaderProps) {
  const router = useRouter();

  const goBack = () => {
    // If there is nothing to go back to (e.g. page was refreshed), go Home instead
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  };

  return (
    <View style={styles.bar}>
      <IconButton icon="arrow-left" onPress={goBack} accessibilityLabel="Go back" />
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#202124' },
});
