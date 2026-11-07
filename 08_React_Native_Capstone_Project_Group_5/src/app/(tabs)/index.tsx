import { useCallback, useEffect, useState } from 'react';
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

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  const { q } = useLocalSearchParams<{ q?: string }>();

  const handleSearchSubmit = useCallback(
    async (locationName: string) => {
      const cityName = locationName.trim();
      if (!cityName) return;

      setLoading(true);

      try {
        const results = await searchPhotosByLocation(cityName);
        setPhotos(results);
        setLastSearchedCity(cityName);
        recordSearch(cityName);
      } finally {
        setLoading(false);
      }
    },
    [recordSearch, setPhotos],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      if (!lastSearchedCity) return;
      const results = await searchPhotosByLocation(lastSearchedCity);
      setPhotos(results);
    } finally {
      setRefreshing(false);
    }
  }, [lastSearchedCity, setPhotos]);

  useEffect(() => {
    const cityFromRoute = Array.isArray(q) ? q[0] : q;
    if (!cityFromRoute || !cityFromRoute.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      void handleSearchSubmit(cityFromRoute);
    }, 0);

    return () => clearTimeout(timer);
  }, [q, handleSearchSubmit]);

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

        <LocationForm onSearch={handleSearchSubmit} />
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
