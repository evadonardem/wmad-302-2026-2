import { GlassPanel, ScreenBackground } from '@/components/ui';
import { fontFamily, glass } from '@/theme';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Corner glows behind everything */}
      <ScreenBackground />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <GlassPanel accent>
          <View style={styles.panelContent}>
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
              Pick a Region, then a City/Municipality inside it, and Search. The app queries the
              PSGC registry for geography, then asks Pexels for matching tourist spot photos.
              Tap any photo card to open its detail view, or pull the list down to refresh it.
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

            {/* TODO 4.9 [Declarative Navigation]: JSX-based <Link> back to the Search tab,
                styled as a call-to-action */}
            <View style={styles.cta}>
              <Link
                href="/"
                style={[
                  styles.ctaLink,
                  { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary },
                ]}
              >
                Start exploring →
              </Link>
            </View>
          </View>
        </GlassPanel>
      </ScrollView>
    </View>
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
  },
  panelContent: {
    gap: 8,
  },
  heading: {
    fontFamily: fontFamily.extraBold,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: glass.border,
  },
  cta: {
    marginTop: 4,
    alignItems: 'center',
  },
  ctaLink: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 16,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
  },
});
