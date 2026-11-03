import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import { PHOTOS_PER_PAGE, searchPhotosByLocation } from '@/services/geoPhotoService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';

// Your own logo goes here later: save the image as assets/images/logo.png and replace null below with
//   require('../../../assets/images/logo.png')
// While it is null, only the "Lakbay PH" title shows.
const LOGO_SOURCE: ImageSource | null = null;

// Featured-spot tabs: each one searches the same city with a different theme.
const TOPICS = [
  { label: 'Featured', query: 'tourist spot' },
  { label: 'Beaches', query: 'beach' },
  { label: 'Mountains', query: 'mountain' },
  { label: 'Heritage', query: 'heritage church' },
  { label: 'Food', query: 'food' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();

  // TODO 3.7 [Global Search Coordination]: Replace the placeholder trackers below with real
  // React state hooks managed by this dashboard (the photo list itself lives in the shared
  // PhotosProvider — already wired above via usePhotos()):
  // - 'loading': Toggles the boolean workflow flag while operations are in flight (default: false)
  // - 'refreshing': Toggles while the pull-to-refresh gesture is running (default: false)
  // - 'lastSearchedCity': Remembers the most recent search keyword so pull-to-refresh can re-run it (default: empty string)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // Extra trackers for the featured-spot tabs and the "Load more" paging
  const [topic, setTopic] = useState(TOPICS[0].query);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // City handed back from the History screen as a route param (see TODO 5.4)
  const { q } = useLocalSearchParams<{ q?: string }>();

  // 'topicOverride' is only passed by the featured-spot tabs. A search from the form (or from
  // History) starts again on the Featured tab.
  const handleSearchSubmit = async (locationName: string, topicOverride?: string) => {
    // TODO 3.8 [Operational Async Glue Engine]:
    // a. Shift the local 'loading' state tracker to true.
    // b. Fire the async handler function 'searchPhotosByLocation(locationName)' inside an await statement.
    // c. Capture the resulting photo dataset array into the shared store via setPhotos(...)
    //    (from usePhotos()).
    // d. Remember 'locationName' inside 'lastSearchedCity' (feeds the pull-to-refresh in TODO 4.6).
    // e. Toggle the 'loading' tracker back to false inside a finally safety wrapper execution tier.
    const activeTopic = topicOverride ?? TOPICS[0].query;
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName, 1, activeTopic);
      setPhotos(results);
      setLastSearchedCity(locationName);
      setTopic(activeTopic);
      setPage(1);
      setHasMore(results.length >= PHOTOS_PER_PAGE);

      // TODO 5.1 [History Recording]: Once the search above succeeds, record the searched city
      // with recordSearch(locationName) from useSearchHistory() so the History screen can list it.
      // (Switching a featured-spot tab is the same city, so it is not recorded again.)
      if (topicOverride === undefined) {
        recordSearch(locationName);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    // TODO 4.6 [Pull-to-Refresh Workflow]: Implement the RefreshControl gesture handler below:
    // a. Flip the 'refreshing' tracker to true.
    // b. If 'lastSearchedCity' holds a value, re-run 'searchPhotosByLocation(lastSearchedCity)'
    //    and swap the shared photo store with the fresh results via setPhotos(...).
    // c. Flip 'refreshing' back to false inside a finally safety wrapper.
    setRefreshing(true);
    try {
      if (lastSearchedCity) {
        const results = await searchPhotosByLocation(lastSearchedCity, 1, topic);
        setPhotos(results);
        setPage(1);
        setHasMore(results.length >= PHOTOS_PER_PAGE);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Loads the next page of the current search and adds it under the photos already shown.
  const handleLoadMore = async () => {
    if (!lastSearchedCity || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const more = await searchPhotosByLocation(lastSearchedCity, nextPage, topic);
      const fresh = more.filter((m) => !photos.some((p) => p.id === m.id));
      setPhotos([...photos, ...fresh]);
      setPage(nextPage);
      setHasMore(more.length >= PHOTOS_PER_PAGE);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // TODO 5.4 [Param-Driven Re-Search]: When the 'q' search param arrives or changes (the
    // History screen navigates back here with it), and it holds a non-empty value, run the
    // same search flow as TODO 3.8 with that city (locationName = q).
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearchSubmit(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton
          icon="heart-outline"
          iconColor={theme.colors.onBackground}
          size={22}
          onPress={() => router.push('/favorites')}
          accessibilityLabel="Favorites"
        />
        <IconButton
          icon="history"
          iconColor={theme.colors.onBackground}
          size={22}
          onPress={() => router.push('/history')}
          accessibilityLabel="Recent searches"
        />
        <IconButton
          icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
          iconColor={theme.colors.onBackground}
          size={24}
          onPress={() => setIsDarkMode(!isDarkMode)}
          accessibilityLabel="Toggle dark mode"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.titleRow}>
          {/* Logo beside the title (appears once LOGO_SOURCE above is set) */}
          {LOGO_SOURCE && (
            <Image
              source={LOGO_SOURCE}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Lakbay PH logo"
            />
          )}
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Lakbay PH
          </Text>
        </View>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Explore tourist spots across regions, cities, and municipalities in the Philippines
        </Text>

        {/* Connect the location selection input modules */}
        <LocationForm onSearch={handleSearchSubmit} />

        {/* Featured-spot tabs: shown once a city has been searched */}
        {lastSearchedCity ? (
          <View style={styles.topicRow}>
            {TOPICS.map((t) => (
              <Chip
                key={t.query}
                selected={topic === t.query}
                showSelectedOverlay
                onPress={() => handleSearchSubmit(lastSearchedCity, t.query)}
              >
                {t.label}
              </Chip>
            ))}
          </View>
        ) : null}

        {/* Connect presentation display layout nodes passing state parameters downstream */}
        <MediaGallery photos={photos} loading={loading} />

        {/* Pagination: asks Pexels for the next page of the same search */}
        {hasMore && !loading && photos.length > 0 && (
          <Button
            mode="outlined"
            icon="plus"
            loading={loadingMore}
            disabled={loadingMore}
            onPress={handleLoadMore}
            style={styles.loadMore}
          >
            Load more photos
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadMore: {
    marginTop: 20,
    alignSelf: 'center',
  },
});