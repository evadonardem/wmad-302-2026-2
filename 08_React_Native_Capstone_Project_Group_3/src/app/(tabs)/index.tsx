import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Chip, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import { searchPhotosByLocation } from '@/services/geoPhotoService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';

// One-tap searches so visitors can explore without using the dropdowns
const POPULAR_DESTINATIONS = [
  'Baguio City',
  'Vigan City',
  'Sagada',
  'Banaue',
  'Boracay',
  'Cebu City',
  'El Nido',
  'Siargao',
  'Davao City',
];

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();

  // TODO 3.7 [Global Search Coordination]
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // City handed back from the History screen as a route param (see TODO 5.4)
  const { q } = useLocalSearchParams<{ q?: string | string[] }>();

  const handleSearchSubmit = async (locationName: string) => {
    // TODO 3.8 [Operational Async Glue Engine]
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName);
      setPhotos(results);
      setLastSearchedCity(locationName);

      // TODO 5.1 [History Recording]: only reached when the search above succeeded
      recordSearch(locationName);
    } catch (error) {
      console.warn('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    // TODO 4.6 [Pull-to-Refresh Workflow]
    setRefreshing(true);
    try {
      if (lastSearchedCity) {
        const results = await searchPhotosByLocation(lastSearchedCity);
        setPhotos(results);
      }
    } catch (error) {
      console.warn('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // TODO 5.4 [Param-Driven Re-Search]
    const city = Array.isArray(q) ? q[0] : q;
    if (city && city.trim()) {
      handleSearchSubmit(city.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Hero colours: bright teal in light mode, deep teal in dark mode
  const heroBg = isDarkMode ? theme.colors.primaryContainer : theme.colors.primary;
  const heroText = isDarkMode ? theme.colors.onPrimaryContainer : theme.colors.onPrimary;

  const showPopular = !loading && photos.length === 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: heroBg }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Hero banner */}
        <View style={[styles.hero, { backgroundColor: heroBg }]}>
          <View style={[styles.circle, styles.circleLarge]} />
          <View style={[styles.circle, styles.circleSmall]} />
          <View style={[styles.circle, styles.circleAccent, { backgroundColor: theme.colors.secondary }]} />

          <View style={styles.heroInner}>
            <View style={styles.heroActions}>
              <IconButton
                icon="history"
                iconColor={heroText}
                containerColor="rgba(255,255,255,0.18)"
                size={22}
                onPress={() => router.push('/history')}
                accessibilityLabel="Recent searches"
              />
              <IconButton
                icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
                iconColor={heroText}
                containerColor="rgba(255,255,255,0.18)"
                size={22}
                onPress={() => setIsDarkMode(!isDarkMode)}
                accessibilityLabel="Toggle dark mode"
              />
            </View>

            <Text variant="labelLarge" style={[styles.kicker, { color: heroText }]}>
              🌴 DISCOVER THE PHILIPPINES
            </Text>
            <Text variant="displaySmall" style={[styles.title, { color: heroText }]}>
              Lakbay PH
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: heroText }]}>
              Explore tourist spots across regions, cities, and municipalities in the Philippines
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Floating search card that overlaps the hero */}
          <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
            {/* Connect the location selection input modules */}
            <LocationForm onSearch={handleSearchSubmit} />
          </Surface>

          {/* Popular destinations: one tap to search */}
          {showPopular && (
            <View style={styles.popular}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                🔥 Popular destinations
              </Text>
              <View style={styles.popularRow}>
                {POPULAR_DESTINATIONS.map((place) => (
                  <Chip
                    key={place}
                    icon="map-marker"
                    mode="outlined"
                    style={styles.popularChip}
                    onPress={() => handleSearchSubmit(place)}
                  >
                    {place}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {!loading && photos.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                {lastSearchedCity ? `Spots in ${lastSearchedCity}` : 'Tourist spots'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {photos.length} photos · tap a photo to view &amp; zoom
              </Text>
            </View>
          )}

          {/* Connect presentation display layout nodes passing state parameters downstream */}
          <MediaGallery photos={photos} loading={loading} />
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Photos provided by{' '}
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.primary, fontWeight: '700' }}
              onPress={() => WebBrowser.openBrowserAsync('https://www.pexels.com')}
            >
              Pexels
            </Text>
            {' · '}Geography from the Philippine Standard Geographic Code (PSGC)
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
            © 2026 Lakbay PH — Made with ❤️ for Filipino travelers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleLarge: {
    width: 240,
    height: 240,
    top: -70,
    right: -60,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  circleSmall: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleAccent: {
    width: 70,
    height: 70,
    bottom: 40,
    right: 70,
    opacity: 0.35,
  },
  heroInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 64,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  kicker: {
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  title: {
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.92,
    maxWidth: 560,
  },
  content: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: -40,
  },
  formCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  popular: {
    marginBottom: 8,
    gap: 12,
  },
  popularRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChip: {
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});