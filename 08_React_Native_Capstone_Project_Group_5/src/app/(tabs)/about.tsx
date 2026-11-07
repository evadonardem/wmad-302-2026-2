import { ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Divider, Text, useTheme } from 'react-native-paper';

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="titleLarge" style={[styles.heading, { color: theme.colors.onBackground }]}>
        🇵🇭 Lakbay PH
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        A React Native (Expo) capstone demo that maps Philippine geography and surfaces
        tourist spot photography — built for the web, Android, and iOS from one codebase.
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        How it works
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Browse the featured destinations or search directly for any city, island, landmark,
        or destination. The app finds matching photos with Pexels. Tap a photo for details,
        or pull search results down to refresh them.
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        Built with
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Expo Router (tabs + modal routes) · React Native Paper (Material Design 3) ·
        Axios · expo-image · TypeScript
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        Data sources
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Philippine Standard Geographic Code (PSGC) API · Pexels Image API
      </Text>

      <Divider style={styles.divider} />

      <View style={styles.cta}>
        <Link href="/" asChild>
          <Text variant="titleMedium" style={[styles.linkText, { color: theme.colors.primary }]}>
            Start exploring →
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    gap: 8,
  },
  heading: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  cta: {
    marginTop: 4,
    alignItems: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
});
