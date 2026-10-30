import { ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Surface, Text, useTheme } from 'react-native-paper';

const SECTIONS = [
  {
    emoji: '🧭',
    title: 'How it works',
    body: 'Pick a Region, then a City/Municipality inside it, and Search. The app queries the PSGC registry for geography, then asks Pexels for matching tourist spot photos. Tap any photo card to open its detail view, or pull the list down to refresh it.',
  },
  {
    emoji: '🛠️',
    title: 'Built with',
    body: 'Expo Router (tabs + modal routes) · React Native Paper (Material Design 3) · Axios · expo-image · TypeScript',
  },
  {
    emoji: '🗂️',
    title: 'Data sources',
    body: 'Philippine Standard Geographic Code (PSGC) API · Pexels Image API',
  },
];

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={styles.bannerEmoji}>🌴</Text>
        <Text variant="headlineSmall" style={[styles.heading, { color: theme.colors.onPrimaryContainer }]}>
          Lakbay PH
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
          A React Native (Expo) capstone demo that maps Philippine geography and surfaces
          tourist spot photography — built for the web, Android, and iOS from one codebase.
        </Text>
      </View>

      {SECTIONS.map((section) => (
        <Surface key={section.title} style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {section.emoji} {section.title}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {section.body}
          </Text>
        </Surface>
      ))}

      {/* TODO 4.9 [Declarative Navigation] */}
      <View style={styles.cta}>
        <Link
          href="/"
          accessibilityRole="link"
          style={[
            styles.ctaLink,
            { color: theme.colors.onPrimary, backgroundColor: theme.colors.primary },
          ]}
        >
          Start exploring →
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
    gap: 16,
  },
  banner: {
    borderRadius: 24,
    padding: 22,
    gap: 6,
  },
  bannerEmoji: {
    fontSize: 40,
  },
  heading: {
    fontWeight: '800',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  cardTitle: {
    fontWeight: '700',
  },
  cta: {
    marginTop: 4,
    alignItems: 'center',
  },
  ctaLink: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 28,
    overflow: 'hidden',
    textAlign: 'center',
  },
});