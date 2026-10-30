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

  // TODO 3.7
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // City handed back from the History screen as a route param (see TODO 5.4)
  const { q } = useLocalSearchParams<{ q?: string }>();

  const handleSearchSubmit = async (locationName: string) => {
    // TODO 3.8
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName);
      setPhotos(results);
      setLastSearchedCity(locationName);

      // TODO 5.1
      if (results.length > 0) {
        recordSearch(locationName);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    // TODO 4.6
    setRefreshing(true);
    try {
      if (lastSearchedCity) {
        const results = await searchPhotosByLocation(lastSearchedCity);
        setPhotos(results);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // TODO 5.4
    if (q) {
      handleSearchSubmit(q);
    }
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