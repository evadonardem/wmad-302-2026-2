import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import {
  isPexelsConfigured,
  searchPhotosByLocation,
  type Photo,
} from '@/services/geoPhotoService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';

type IslandGroup = 'Luzon' | 'Visayas' | 'Mindanao';
type FeaturedDestination = {
  name: string;
  region: string;
  islandGroup: IslandGroup;
  accent: string;
  photoKeywords?: string[];
  photo?: Photo | null;
};

const featuredDestinations: Omit<FeaturedDestination, 'photo'>[] = [
  { name: 'El Nido', region: 'Palawan', islandGroup: 'Luzon', accent: '#176B78' },
  { name: 'Banaue Rice Terraces', region: 'Ifugao', islandGroup: 'Luzon', accent: '#4B7256' },
  { name: 'Mayon Volcano', region: 'Albay', islandGroup: 'Luzon', accent: '#8A5546' },
  { name: 'Intramuros', region: 'Manila', islandGroup: 'Luzon', accent: '#75634B' },
  { name: 'Boracay', region: 'Aklan', islandGroup: 'Visayas', accent: '#A75B3D' },
  { name: 'Chocolate Hills', region: 'Bohol', islandGroup: 'Visayas', accent: '#657444' },
  { name: 'Kawasan Falls', region: 'Cebu', islandGroup: 'Visayas', accent: '#287A78' },
  { name: 'Cambugahay Falls', region: 'Siquijor', islandGroup: 'Visayas', accent: '#4F8068' },
  {
    name: 'Siargao Island',
    region: 'Surigao del Norte',
    islandGroup: 'Mindanao',
    photoKeywords: ['Siargao', 'General Luna', 'Cloud 9'],
    accent: '#38736E',
  },
  {
    name: 'Camiguin Island',
    region: 'Camiguin',
    islandGroup: 'Mindanao',
    photoKeywords: ['Camiguin'],
    accent: '#52704F',
  },
  {
    name: 'Mount Apo',
    region: 'Davao Region',
    islandGroup: 'Mindanao',
    photoKeywords: ['Mount Apo', 'Mt. Apo'],
    accent: '#5A6546',
  },
  {
    name: 'Tinago Falls',
    region: 'Lanao del Norte',
    islandGroup: 'Mindanao',
    photoKeywords: ['Tinago Falls', 'Tinago', 'Iligan'],
    accent: '#286A7A',
  },
];

const islandGroups: IslandGroup[] = ['Luzon', 'Visayas', 'Mindanao'];

export default function SearchScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isPhoneLayout = width < 600;
  const contentWidth = Math.min(width, 960) - (isCompact ? 24 : 32);
  const featuredColumns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const featuredCardWidth =
    (contentWidth - 12 * (featuredColumns - 1)) / featuredColumns;
  const featuredCardHeight = isPhoneLayout ? (isCompact ? 180 : 200) : 220;
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();
  const hasSearchedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSummary, setSearchSummary] = useState('');
  const [lastSearchedCity, setLastSearchedCity] = useState('');
  const [lastSearchedContext, setLastSearchedContext] = useState('');
  const [featuredItems, setFeaturedItems] = useState<FeaturedDestination[]>(featuredDestinations);
  const [featuredError, setFeaturedError] = useState('');
  const [failedFeaturedImageUrls, setFailedFeaturedImageUrls] = useState<string[]>([]);
  const [loadingFeaturedNames, setLoadingFeaturedNames] = useState<string[]>(
    featuredDestinations.map((destination) => destination.name),
  );
  const featuredMessage =
    featuredError ||
    (!isPexelsConfigured ? 'Add EXPO_PUBLIC_PEXELS_API_KEY to load destination photos.' : '');

  const { q } = useLocalSearchParams<{ q?: string }>();

  useEffect(() => {
    if (!isPexelsConfigured) return undefined;

    let isCurrent = true;
    const loadFeaturedPhotos = async () => {
      let failedRequests = false;
      const photosByDestination = new Map<string, Photo>();
      const updateFeaturedPhotoList = () => {
        if (hasSearchedRef.current) return;
        const orderedPhotos = featuredDestinations
          .map((destination) => photosByDestination.get(destination.name))
          .filter((photo): photo is Photo => Boolean(photo));
        setPhotos(orderedPhotos);
      };

      for (let index = 0; index < featuredDestinations.length; index += 3) {
        if (!isCurrent) return;

        await Promise.all(
          featuredDestinations.slice(index, index + 3).map(async (destination) => {
            try {
              const results = await searchPhotosByLocation(destination.name, destination.region);
              const photoKeywords = destination.photoKeywords ?? [destination.name];
              const matchingPhoto = results.find((result) =>
                photoKeywords.some((keyword) =>
                  result.altText.toLowerCase().includes(keyword.toLowerCase()),
                ),
              );
              const photo = matchingPhoto ?? results[0] ?? null;
              if (isCurrent) {
                if (photo) photosByDestination.set(destination.name, photo);
                setFeaturedItems((items) =>
                  items.map((item) =>
                    item.name === destination.name ? { ...item, photo } : item,
                  ),
                );
                updateFeaturedPhotoList();
              }
            } catch (error) {
              console.error(`Unable to load a featured photo for ${destination.name}:`, error);
              failedRequests = true;
            } finally {
              if (isCurrent) {
                setLoadingFeaturedNames((names) =>
                  names.filter((name) => name !== destination.name),
                );
              }
            }
          }),
        );
      }

      if (isCurrent) {
        if (failedRequests) setFeaturedError('Some featured photos could not be loaded.');
      }
    };

    void loadFeaturedPhotos();
    return () => {
      isCurrent = false;
    };
  }, [setPhotos]);

  const handleSearchSubmit = useCallback(
    async (locationName: string, locationContext?: string) => {
      const cityName = locationName.trim();
      if (!cityName) return;

      hasSearchedRef.current = true;
      setHasSearched(true);
      setLoading(true);
      setSearchError('');
      setSearchSummary(
        locationContext ? `${cityName}, ${locationContext}` : cityName || 'Selected location',
      );
      setLastSearchedCity(cityName);
      setLastSearchedContext(locationContext ?? '');

      try {
        const results = await searchPhotosByLocation(cityName, locationContext);
        setPhotos(results);
        recordSearch(cityName);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : 'Unable to complete photo search.');
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    },
    [recordSearch, setPhotos],
  );

  const handleRefresh = useCallback(async () => {
    if (!lastSearchedCity) return;
    setRefreshing(true);
    setSearchError('');

    try {
      const results = await searchPhotosByLocation(lastSearchedCity, lastSearchedContext);
      setPhotos(results);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Unable to refresh photo search.');
    } finally {
      setRefreshing(false);
    }
  }, [lastSearchedCity, lastSearchedContext, setPhotos]);

  useEffect(() => {
    const cityFromRoute = Array.isArray(q) ? q[0] : q;
    if (!cityFromRoute?.trim()) return undefined;

    const timer = setTimeout(() => {
      void handleSearchSubmit(cityFromRoute);
    }, 0);

    return () => clearTimeout(timer);
  }, [q, handleSearchSubmit]);

  const handleResetSearch = () => {
    hasSearchedRef.current = false;
    setHasSearched(false);
    setSearchError('');
    setSearchSummary('');
    setLastSearchedCity('');
    setLastSearchedContext('');
    setPhotos([]);
  };

  const openPhoto = (photo: Photo, title: string, subtitle: string) => {
    router.push({
      pathname: '/photo/[id]',
      params: {
        id: String(photo.id),
        imageUrl: photo.imageUrl,
        photographer: photo.photographer,
        photographerUrl: photo.photographerUrl,
        altText: photo.altText,
        title,
        subtitle,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.scrollContent,
          width < 360 && styles.compactScrollContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              source={require('../../../assets/images/Logo.png')}
              style={styles.brandLogo}
              contentFit="contain"
              accessibilityLabel="Lakbay PH logo"
            />
            <View>
              <Text variant="titleMedium" style={[styles.brandTitle, { color: theme.colors.onBackground }]}>
                Lakbay <Text style={{ color: theme.colors.primary }}>PH</Text>
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Philippines travel finder
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="history"
              iconColor={theme.colors.onBackground}
              onPress={() => router.push('/history')}
              accessibilityLabel="Recent searches"
            />
            <IconButton
              icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
              iconColor={theme.colors.onBackground}
              onPress={() => setIsDarkMode(!isDarkMode)}
              accessibilityLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
          </View>
        </View>

        <View style={[styles.hero, isCompact && styles.compactHero]}>
          <Text variant="labelLarge" style={[styles.eyebrow, { color: theme.colors.primary }]}>
            EXPLORE THE PHILIPPINES
          </Text>
          <Text
            variant="displaySmall"
            style={[
              styles.heroTitle,
              isCompact && styles.compactHeroTitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Find a place to remember.
          </Text>
          <Text variant="bodyLarge" style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Search any city, island, landmark, or destination in one step.
          </Text>
        </View>

        <Card style={[styles.searchPanel, { backgroundColor: theme.colors.surface }]} mode="contained">
          <Card.Content>
            <Text variant="labelLarge" style={[styles.panelHeading, { color: theme.colors.onSurface }]}>
              Search any destination
            </Text>
            <LocationForm
              onSearch={handleSearchSubmit}
              suggestions={featuredDestinations.map((destination) => destination.name)}
            />
          </Card.Content>
        </Card>

        {hasSearched ? (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsTitleContainer}>
                <Text variant="labelLarge" style={[styles.eyebrow, { color: theme.colors.primary }]}>
                  SEARCH RESULTS
                </Text>
                <Text variant="headlineSmall" style={[styles.resultsTitle, { color: theme.colors.onBackground }]}>
                  {searchSummary || 'Your selected location'}
                </Text>
              </View>
              <Button mode="text" onPress={handleResetSearch} compact>
                Featured places
              </Button>
            </View>
            <MediaGallery
              photos={photos}
              loading={loading}
              locationName={searchSummary}
              error={searchError}
            />
          </View>
        ) : (
          <View style={styles.featuredSection}>
            <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Featured places
            </Text>
            {featuredMessage ? (
              <Text
                accessibilityRole="alert"
                variant="bodySmall"
                style={[styles.featuredError, { color: theme.colors.onSurfaceVariant }]}
              >
                {featuredMessage}
              </Text>
            ) : null}
            {islandGroups.map((group) => (
              <View key={group} style={styles.groupSection}>
                <Text variant="titleMedium" style={[styles.groupTitle, { color: theme.colors.onBackground }]}>
                  {group}
                </Text>
                <View style={styles.featuredGrid}>
                  {featuredItems
                    .filter((destination) => destination.islandGroup === group)
                    .map((destination) => {
                      const photo = destination.photo;
                      const photoUrl = photo?.imageUrl;
                      const hasPhoto = Boolean(
                        photoUrl && !failedFeaturedImageUrls.includes(photoUrl),
                      );
                      const isLoadingPhoto =
                        isPexelsConfigured && loadingFeaturedNames.includes(destination.name);

                      return (
                        <Card
                          key={destination.name}
                          style={[
                            styles.featuredCard,
                            {
                              width: featuredCardWidth,
                              height: featuredCardHeight,
                              backgroundColor: destination.accent,
                            },
                          ]}
                          mode="contained"
                        >
                          <Pressable
                            style={styles.featuredPressable}
                            accessibilityRole={hasPhoto ? 'button' : undefined}
                            accessibilityLabel={`View photo details for ${destination.name}`}
                            disabled={!hasPhoto}
                            onPress={() => {
                              if (hasPhoto && photo) {
                                openPhoto(
                                  photo,
                                  destination.name,
                                  `${destination.region}, ${destination.islandGroup}`,
                                );
                              }
                            }}
                          >
                            {hasPhoto && photo ? (
                              <Card.Cover
                                source={{ uri: photo.imageUrl }}
                                style={{
                                  width: featuredCardWidth,
                                  height: featuredCardHeight,
                                }}
                                accessibilityLabel={photo.altText}
                                onError={() => {
                                  if (!photoUrl) return;
                                  setFailedFeaturedImageUrls((failedUrls) =>
                                    failedUrls.includes(photoUrl)
                                      ? failedUrls
                                      : [...failedUrls, photoUrl],
                                  );
                                }}
                              />
                            ) : (
                              <View
                                style={[
                                  styles.unavailableImage,
                                  { width: featuredCardWidth, height: featuredCardHeight },
                                ]}
                              >
                                <Text variant="titleMedium" style={styles.unavailableText}>
                                  {isLoadingPhoto ? 'Loading photo...' : 'Photo unavailable'}
                                </Text>
                              </View>
                            )}
                            <View style={styles.featuredDetails}>
                              <Text variant="labelSmall" style={styles.featuredRegion}>
                                {destination.region}
                              </Text>
                              <Text variant="titleMedium" style={styles.featuredName}>
                                {destination.name}
                              </Text>
                              {hasPhoto && photo?.photographer ? (
                                <Pressable
                                  accessibilityRole="link"
                                  onPress={(event) => {
                                    event.stopPropagation();
                                    const photographerUrl = photo.photographerUrl;
                                    if (photographerUrl) {
                                      void WebBrowser.openBrowserAsync(photographerUrl);
                                    }
                                  }}
                                >
                                  <Text variant="labelSmall" style={styles.featuredCredit}>
                                    Photo by {photo.photographer}
                                  </Text>
                                </Pressable>
                              ) : null}
                            </View>
                          </Pressable>
                        </Card>
                      );
                    })}
                </View>
              </View>
            ))}
          </View>
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
  scrollContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  compactScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 26,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(110, 75, 53, 0.3)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 48,
    height: 48,
  },
  brandTitle: {
    fontWeight: '700',
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hero: {
    marginBottom: 22,
  },
  compactHero: {
    marginBottom: 18,
  },
  eyebrow: {
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 8,
  },
  compactHeroTitle: {
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    maxWidth: 620,
  },
  searchPanel: {
    marginBottom: 28,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(110, 75, 53, 0.3)',
  },
  panelHeading: {
    marginBottom: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  resultsTitleContainer: {
    flex: 1,
    minWidth: 200,
  },
  resultsTitle: {
    fontWeight: '700',
  },
  featuredSection: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 14,
  },
  featuredError: {
    marginTop: -8,
    marginBottom: 14,
  },
  groupSection: {
    marginBottom: 24,
  },
  groupTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featuredCard: {
    overflow: 'hidden',
    borderRadius: 14,
  },
  featuredPressable: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  unavailableImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  unavailableText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  featuredDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    gap: 3,
  },
  featuredRegion: {
    color: '#e8c99c',
    fontWeight: '600',
  },
  featuredName: {
    color: '#fff',
    fontWeight: '700',
  },
  featuredCredit: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
