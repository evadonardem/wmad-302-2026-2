import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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

  const performSearch = useCallback(
    async (locationName: string) => {
      const trimmed = locationName.trim();
      if (!trimmed) return;

      setLoading(true);

      try {
        const results = await searchPhotosByLocation(trimmed);
        setPhotos(results);
        setLastSearchedCity(trimmed);
        recordSearch(trimmed);
      } finally {
        setLoading(false);
      }
    },
    [recordSearch, setPhotos],
  );

  const handleSearchSubmit = useCallback(
    async (locationName: string) => {
      await performSearch(locationName);
    },
    [performSearch],
  );

  const handleRefresh = useCallback(async () => {
    const trimmed = lastSearchedCity.trim();
    if (!trimmed) return;

    setRefreshing(true);

    try {
      const results = await searchPhotosByLocation(trimmed);
      setPhotos(results);
    } finally {
      setRefreshing(false);
    }
  }, [lastSearchedCity, setPhotos]);

  useEffect(() => {
    const nextCity = Array.isArray(q) ? q[0] : q;
    if (!nextCity || !nextCity.trim()) {
      return;
    }

    queueMicrotask(() => {
      void performSearch(nextCity);
    });
  }, [performSearch, q]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <View>
          <Text variant="labelLarge" style={[styles.wordmark, { color: theme.colors.primary }]}>
            LAKBAY <Text style={{ color: theme.colors.onBackground }}>PH</Text>
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            A guide to the islands
          </Text>
        </View>
        <View style={styles.headerActions}>
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
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.intro}>
          <Svg
            aria-hidden
            pointerEvents="none"
            style={styles.travelArtwork}
            viewBox="0 0 900 280"
            preserveAspectRatio="xMidYMax slice"
            fill="none"
          >
            <Circle cx="700" cy="88" r="38" fill="#FFC857" />
            <Path d="M0 202 C118 176 174 229 296 206 S493 174 606 204 S790 228 900 188 V280 H0 Z" fill="#087C83" />
            <Path d="M0 230 C130 202 201 250 331 224 S531 202 650 231 S816 251 900 219 V280 H0 Z" fill="#075D68" />
            <Path d="M126 178 C141 163 159 165 166 177 C158 188 143 192 130 188 Z" fill="#FF966D" />
            <Path d="M367 177 C378 162 390 163 395 175 L389 189 L375 191 Z" fill="#FFC857" />
            <Path d="M411 153 C417 140 429 138 434 150 L430 165 L418 169 Z" fill="#FF966D" />
            <Path d="M491 127 C501 104 518 103 524 119 L518 142 L501 149 Z" fill="#FFC857" />
            <Path d="M617 166 C638 151 660 155 670 170 C659 185 638 190 620 181 Z" fill="#FF966D" />
            <Path
              d="M151 172 C237 125 285 191 382 165 S502 105 552 139 S646 169 704 124"
              stroke="#FFF3D1"
              strokeWidth="3"
              strokeDasharray="5 10"
              strokeLinecap="round"
            />
            <Circle cx="151" cy="172" r="6" fill="#FFF3D1" />
            <Circle cx="382" cy="165" r="6" fill="#FFF3D1" />
            <Circle cx="552" cy="139" r="6" fill="#FFF3D1" />
            <Circle cx="704" cy="124" r="6" fill="#FFF3D1" />
          </Svg>
          <Text variant="labelMedium" style={styles.eyebrow}>
            A FIELD GUIDE TO THE PHILIPPINES
          </Text>
          <Text variant="headlineLarge" style={styles.title}>
            Explore the Philippines
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Find places across regions, cities, and municipalities.
          </Text>
        </View>

        <View style={[styles.formSection, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Choose a destination
          </Text>
          <LocationForm onSearch={handleSearchSubmit} />
        </View>

        <View style={styles.gallerySection}>
          <Text variant="labelMedium" style={[styles.galleryLabel, { color: theme.colors.secondary }]}>
            {lastSearchedCity ? `PLACES AROUND ${lastSearchedCity.toUpperCase()}` : 'A LITTLE INSPIRATION'}
          </Text>
          <MediaGallery photos={photos} loading={loading} />
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
  header: {
    flexDirection: 'row',
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 48,
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: 0,
  },
  intro: {
    marginBottom: 30,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 158,
    minHeight: 390,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#064F59',
  },
  travelArtwork: {
    position: 'absolute',
    width: '100%',
    height: 210,
    bottom: 0,
    left: 0,
  },
  eyebrow: {
    fontWeight: '700',
    marginBottom: 10,
    color: '#FFD36B',
  },
  title: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '700',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  subtitle: {
    maxWidth: 520,
    lineHeight: 25,
    color: '#D5F1EC',
  },
  formSection: {
    paddingTop: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 14,
  },
  gallerySection: {
    marginTop: 34,
  },
  galleryLabel: {
    fontWeight: '700',
    marginBottom: 14,
  },
});
