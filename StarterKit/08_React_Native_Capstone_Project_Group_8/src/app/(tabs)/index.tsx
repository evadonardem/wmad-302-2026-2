import AuroraBackground from '@/components/AuroraBackground';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { searchPhotosByLocation, type Photo } from '@/services/geoPhotoService';
import { useThemeMode } from '@/themeMode';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Walking emoji: bobs and sways like the web version
function WalkingEmoji() {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return (
    <Animated.Text
      style={{
        fontSize: 34,
        marginRight: 8,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 8, 0] }) },
          {
            translateY: t.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, -5, 0, -5, 0],
            }),
          },
          {
            rotate: t.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: ['0deg', '4deg', '0deg', '-4deg', '0deg'],
            }),
          },
        ],
      }}
    >
      🚶
    </Animated.Text>
  );
}

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();

  // TODO 3.7 [Global Search Coordination]
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // Favorites (in-memory) + filter toggle
  const [favorites, setFavorites] = useState<Photo[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // City handed back from the History screen as a route param (see TODO 5.4)
  const { q } = useLocalSearchParams<{ q?: string }>();

  const handleToggleFavorite = (photo: Photo) => {
    setFavorites((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [photo, ...prev]
    );
  };

  const handleSearchSubmit = async (locationName: string) => {
    // TODO 3.8 [Operational Async Glue Engine]
    setShowFavorites(false);
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName);
      setPhotos(results);
      setLastSearchedCity(locationName);

      // TODO 5.1 [History Recording]
      if (results.length > 0) {
        recordSearch(locationName);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setPhotos([]);
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
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // TODO 5.4 [Param-Driven Re-Search]
    if (typeof q === 'string' && q.trim()) {
      handleSearchSubmit(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const glassBg = isDarkMode ? 'rgba(25,28,45,0.6)' : 'rgba(255,255,255,0.65)';
  const glassBorder = isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)';
  const blue = isDarkMode ? '#7aa7ff' : '#0038A8';
  const red = '#CE1126';

  const visiblePhotos = showFavorites ? favorites : photos;
  const galleryTitle = showFavorites
    ? 'Your favorite spots'
    : lastSearchedCity
      ? `Tourist spots in ${lastSearchedCity}`
      : undefined;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <AuroraBackground isDark={isDarkMode} />

      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Glass header card */}
          <View style={[styles.glassCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
            <View style={styles.titleRow}>
              <WalkingEmoji />
              <Text variant="headlineMedium" style={styles.title}>
                <Text variant="headlineMedium" style={[styles.title, { color: blue }]}>
                  Lakbay{' '}
                </Text>
                <Text variant="headlineMedium" style={[styles.title, { color: red }]}>
                  PH
                </Text>
              </Text>
            </View>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Explore tourist spots across regions, cities, and municipalities in the Philippines
            </Text>

            {/* Connect the location selection input modules */}
            <LocationForm onSearch={handleSearchSubmit} />
          </View>

          <View style={styles.favRow}>
            <Chip
              icon={showFavorites ? 'heart' : 'heart-outline'}
              selected={showFavorites}
              showSelectedOverlay
              onPress={() => setShowFavorites((v) => !v)}
            >
              Favorites ({favorites.length})
            </Chip>
          </View>

          {/* Connect presentation display layout nodes passing state parameters downstream */}
          <MediaGallery
            photos={visiblePhotos}
            loading={loading && !showFavorites}
            title={galleryTitle}
            emptyMessage={
              showFavorites
                ? 'No favorites yet. Tap the heart on a photo to save it here.'
                : 'No tourist spots found for this area yet.'
            }
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
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
    paddingBottom: 32,
  },
  glassCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  favRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
});