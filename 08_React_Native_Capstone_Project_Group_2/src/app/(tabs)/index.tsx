import { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import { searchPhotosByLocation } from '@/services/geoPhotoService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';
import React from 'react';

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();

  // Handoff from the History screen arrives as ?q=<city>
  const { q } = useLocalSearchParams<{ q?: string }>();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Most recent searched city (used by pull-to-refresh) and a counter so an older,
  // slower response can never overwrite the results of a newer search.
  const lastCity = useRef('');
  const latestRequest = useRef(0);

  // TODO 3.7 [Search Orchestration]
  const runSearch = async (cityName: string) => {
    const requestId = ++latestRequest.current;
    lastCity.current = cityName;
    setLoading(true);

    const results = await searchPhotosByLocation(cityName);
    if (requestId !== latestRequest.current) return;

    // TODO 3.8 [Share Results]: put the photos in the shared store for the detail viewer
    setPhotos(results);
    setLoading(false);

    // TODO 5.1 [Record History]: only successful searches are recorded
    if (results.length > 0) recordSearch(cityName);
  };

  // TODO 4.6 [Pull-to-Refresh]: re-run the most recent search
  const handleRefresh = async () => {
    if (!lastCity.current) return;
    setRefreshing(true);
    const requestId = ++latestRequest.current;

    const results = await searchPhotosByLocation(lastCity.current);
    if (requestId === latestRequest.current) setPhotos(results);

    setRefreshing(false);
  };

  // TODO 5.4 [Param Handoff]: a city chosen on the History screen re-runs the search
  useEffect(() => {
    if (!q) return;
    runSearch(q);
    // Clear the param so picking the same city again still triggers this effect
    router.setParams({ q: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.toolbar}>
          <IconButton
            icon="history"
            accessibilityLabel="Recent searches"
            onPress={() => router.push('/history')}
          />
          <IconButton
            icon={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
            accessibilityLabel="Toggle dark mode"
            onPress={() => setIsDarkMode((prev) => !prev)}
          />
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          🇵🇭 Lakbay PH
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Explore tourist spots across regions, cities, and municipalities in the Philippines
        </Text>

        <LocationForm onSearch={runSearch} />
        <MediaGallery photos={photos} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    padding: 20,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
});
