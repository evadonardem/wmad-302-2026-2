import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import { searchPhotosByLocation } from '@/services/geoPhotoService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';

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
  const { q } = useLocalSearchParams<{ q?: string }>();

  const handleSearchSubmit = async (locationName: string) => {
    // TODO 3.8 [Operational Async Glue Engine]
    // a. Loading on
    setLoading(true);
    try {
      // b. Fire the async search
      const results = await searchPhotosByLocation(locationName);
      // c. Store the results in the shared photo store
      setPhotos(results);
      // d. Remember the keyword for pull-to-refresh
      setLastSearchedCity(locationName);

      // TODO 5.1 [History Recording]: the search above succeeded, so record the city
      recordSearch(locationName);
    } catch (error) {
      console.error(`Search failed for "${locationName}":`, error);
    } finally {
      // e. Loading off no matter what
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    // TODO 4.6 [Pull-to-Refresh Workflow]
    // a. Refreshing on
    setRefreshing(true);
    try {
      // b. Re-run the most recent search, if there is one
      if (lastSearchedCity) {
        const results = await searchPhotosByLocation(lastSearchedCity);
        setPhotos(results);
      }
    } catch (error) {
      console.error(`Refresh failed for "${lastSearchedCity}":`, error);
    } finally {
      // c. Refreshing off no matter what
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // TODO 5.4 [Param-Driven Re-Search]: run the same flow as TODO 3.8 when 'q' arrives or changes
    if (typeof q === 'string' && q.trim()) {
      void handleSearchSubmit(q.trim());
    }
    // handleSearchSubmit is recreated every render; the search must only re-run when 'q' changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
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
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          🇵🇭 Lakbay PH
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Explore tourist spots across regions, cities, and municipalities in the Philippines
        </Text>

        {/* Connect the location selection input modules */}
        <LocationForm onSearch={handleSearchSubmit} />

        {/* Connect presentation display layout nodes passing state parameters downstream */}
        <MediaGallery photos={photos} loading={loading} />
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
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
});
