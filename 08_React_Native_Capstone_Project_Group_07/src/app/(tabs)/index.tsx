import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import { GradientTitle, ScreenBackground } from '@/components/ui';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { searchPhotosByLocation } from '@/services/geoPhotoService';
import { fontFamily, glass } from '@/theme';
import { useThemeMode } from '@/themeMode';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  const { q } = useLocalSearchParams<{ q?: string }>();

  const handleSearchSubmit = async (locationName: string) => {
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName);
      setPhotos(results);
      setLastSearchedCity(locationName);
      recordSearch(locationName);
    } catch (error) {
      console.error(`Search failed for "${locationName}":`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (lastSearchedCity) {
        const results = await searchPhotosByLocation(lastSearchedCity);
        setPhotos(results);
      }
    } catch (error) {
      console.error(`Refresh failed for "${lastSearchedCity}":`, error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof q === 'string' && q.trim()) {
      void handleSearchSubmit(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      {/* Corner glows behind everything */}
      <ScreenBackground />

      <View style={styles.header}>
        <IconButton
          icon="history"
          iconColor={theme.colors.onBackground}
          containerColor={glass.fill}
          size={22}
          style={styles.glassIcon}
          onPress={() => router.push('/history')}
          accessibilityLabel="Recent searches"
        />
        <IconButton
          icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
          iconColor={theme.colors.onBackground}
          containerColor={glass.fill}
          size={24}
          style={styles.glassIcon}
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
          
          <GradientTitle>Lakbay PH</GradientTitle>
        </View>

        {/* Friendly greeting styled with theme-adaptive soft surface color */}
        <Text variant="titleMedium" style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>
          Magandang araw! Let's find your next Philippine adventure. 🌴
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
  glassIcon: {
    borderWidth: 1,
    borderColor: glass.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 44,
  },
  greeting: {
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 24,
    marginTop: 6,
    marginBottom: 6,
    opacity: 0.85,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.75,
  },
});