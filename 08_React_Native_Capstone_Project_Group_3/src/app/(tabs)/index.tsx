import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Chip, IconButton, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import AppBackground, { useBackgroundPhotos } from '@/components/AppBackground';
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

// The bottom tab bar emits "tabPress" on the screen's navigation object
type TabNavigation = {
  addListener: (event: 'tabPress', callback: () => void) => () => void;
  isFocused: () => boolean;
};
type SearchbarHandle = ComponentRef<typeof Searchbar> & { focus: () => void };
export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();
  const navigation = useNavigation();
  const backgroundPhotos = useBackgroundPhotos();

  // TODO 3.7 [Global Search Coordination]
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // Text typed into the search box
  const [query, setQuery] = useState('');

const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
const searchRef = useRef<SearchbarHandle>(null);
const contentY = useRef(0);
  const resultsY = useRef(0);
  const pendingScroll = useRef(false);

  // City handed back from the History screen as a route param (see TODO 5.4)
  const { q } = useLocalSearchParams<{ q?: string | string[] }>();

  const handleSearchSubmit = async (locationName: string) => {
    // TODO 3.8 [Operational Async Glue Engine]
    pendingScroll.current = true; // jump down to the results once they are loaded
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

  // Search box: Enter key or the magnifier icon
  const submitQuery = () => {
    const text = query.trim();
    if (text) handleSearchSubmit(text);
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

  // Tapping the Search tab while already on it: scroll to the top and focus the search box
  useEffect(() => {
    const tabs = navigation as unknown as TabNavigation;
    const unsubscribe = tabs.addListener('tabPress', () => {
      if (!tabs.isFocused()) return;
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => searchRef.current?.focus(), 350);
    });
    return unsubscribe;
  }, [navigation]);

  // After a search finishes, scroll so the results are in view
  useEffect(() => {
    if (loading || !pendingScroll.current) return;
    pendingScroll.current = false;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, contentY.current + resultsY.current - 16),
        animated: true,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [loading]);

  // Hero colours: bright teal in light mode, deep teal in dark mode
  const heroBg = isDarkMode ? theme.colors.primaryContainer : theme.colors.primary;
  const heroText = isDarkMode ? theme.colors.onPrimaryContainer : theme.colors.onPrimary;
  const heroOverlay = isDarkMode ? 'rgba(0,30,38,0.78)' : 'rgba(10,126,140,0.80)';
  const heroPhoto = backgroundPhotos.length > 0 ? backgroundPhotos[backgroundPhotos.length - 1] : undefined;

  const showPopular = !loading && photos.length === 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: heroBg }]} edges={['top', 'left', 'right']}>
      <AppBackground>
        <ScrollView
          ref={scrollRef}
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
        >
          {/* Hero banner with a Philippine photo underneath the tint */}
          <View style={[styles.hero, { backgroundColor: heroBg }]}>
            {heroPhoto ? (
              <>
                <Image source={{ uri: heroPhoto }} style={StyleSheet.absoluteFill} contentFit="cover" transition={600} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: heroOverlay }]} />
              </>
            ) : null}
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

          <View
            style={styles.content}
            onLayout={(event) => {
              contentY.current = event.nativeEvent.layout.y;
            }}
          >
            {/* Floating search card that overlaps the hero */}
            <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
              <Text variant="titleMedium" style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                Where to next?
              </Text>

              {/* Free-text search: type any place and press Enter */}
              <Searchbar
                ref={searchRef}
                placeholder="Search any place, e.g. Sagada, Boracay, Vigan…"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={submitQuery}
                onIconPress={submitQuery}
                loading={loading}
                elevation={0}
                style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
              />

              <View style={styles.orRow}>
                <View style={[styles.orLine, { backgroundColor: theme.colors.outlineVariant }]} />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  OR BROWSE BY LOCATION
                </Text>
                <View style={[styles.orLine, { backgroundColor: theme.colors.outlineVariant }]} />
              </View>

              {/* Connect the location selection input modules */}
              <LocationForm onSearch={handleSearchSubmit} />
            </Surface>

            {/* Popular destinations: one tap to search */}
            {showPopular && (
              <Surface
                style={[styles.popular, { backgroundColor: theme.colors.surface }]}
                elevation={2}
              >
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
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
              </Surface>
            )}

            <View
              onLayout={(event) => {
                resultsY.current = event.nativeEvent.layout.y;
              }}
            >
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
      </AppBackground>
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
  formTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  searchbar: {
    borderRadius: 16,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  popular: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
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