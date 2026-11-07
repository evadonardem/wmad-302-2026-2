import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Chip, IconButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AreaDescription from '@/components/AreaDescription';
import FeaturedSection from '@/components/FeaturedSection';
import LocationForm from '@/components/LocationForm';
import MediaGallery from '@/components/MediaGallery';
import PlaceSearch from '@/components/PlaceSearch';
import WeatherCard from '@/components/WeatherCard';
import { ALL_FEATURED_PLACES } from '@/data/featuredPlaces';
import { useLanguage, type StringKey } from '@/i18n';
import {
  clearSearchCache,
  didLastSearchFail,
  searchPhotosByLocation,
  searchPhotosPage,
  type City,
} from '@/services/geoPhotoService';
import { findMyCity } from '@/services/locationService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';
import { useTrip } from '@/tripPlanner';

// Your own logo goes here later: save the image as assets/images/logo.png and replace null below with
//   require('../../../assets/images/logo.png')
// While it is null, a dashed LOGO box shows in its place.
const LOGO_SOURCE: ImageSource | null = require('../../../assets/images/logocrocodille.png');

// Speed: only this many photos are drawn at first; "Load more" shows more of them.
const SHOWN_AT_FIRST = 12;

// Tags: each one searches the same area with a different theme. They stay visible after a search.
// When an area has no photos for a tag (for example Beaches in Baguio) the gallery stays empty.
const TOPICS: { labelKey: StringKey; query: string }[] = [
  { labelKey: 'topic_featured', query: 'tourist spot' },
  { labelKey: 'topic_beaches', query: 'beach' },
  { labelKey: 'topic_mountains', query: 'mountain' },
  { labelKey: 'topic_heritage', query: 'heritage church' },
  { labelKey: 'topic_food', query: 'food' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { t, toggleLanguage } = useLanguage();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch, entries } = useSearchHistory();
  const { isInTrip, addPlace } = useTrip();

  // TODO 3.7 [Global Search Coordination]: Replace the placeholder trackers below with real
  // React state hooks managed by this dashboard (the photo list itself lives in the shared
  // PhotosProvider — already wired above via usePhotos()):
  // - 'loading': Toggles the boolean workflow flag while operations are in flight (default: false)
  // - 'refreshing': Toggles while the pull-to-refresh gesture is running (default: false)
  // - 'lastSearchedCity': Remembers the most recent search keyword so pull-to-refresh can re-run it (default: empty string)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // Extra trackers for the tags, the "Load more" paging, the area description, failed searches and "Near me"
  const [topic, setTopic] = useState(TOPICS[0].query);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(SHOWN_AT_FIRST);
  const [searchFailed, setSearchFailed] = useState(false);
  const [area, setArea] = useState<{ city: City; regionName: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState('');
  const [surpriseName, setSurpriseName] = useState(''); // the place picked by "Surprise me"

  // City handed back from another screen as a route param (History, My Trip, Festivals, Folklore).
  // 'n' is a changing number so the same place can be searched again (see TODO 5.4)
  const { q, n } = useLocalSearchParams<{ q?: string; n?: string }>();

  // 'topicOverride' is only passed by the tag chips (and the Try again button). A search from the
  // form, the search box, the featured cards, the randomizer or History starts again on the Featured tag.
  const handleSearchSubmit = async (locationName: string, topicOverride?: string) => {
    // TODO 3.8 [Operational Async Glue Engine]:
    // a. Shift the local 'loading' state tracker to true.
    // b. Fire the async handler function 'searchPhotosByLocation(locationName)' inside an await statement.
    // c. Capture the resulting photo dataset array into the shared store via setPhotos(...)
    //    (from usePhotos()).
    // d. Remember 'locationName' inside 'lastSearchedCity' (feeds the pull-to-refresh in TODO 4.6).
    // e. Toggle the 'loading' tracker back to false inside a finally safety wrapper execution tier.
    const activeTopic = topicOverride ?? TOPICS[0].query;
    if (topicOverride === undefined) setSurpriseName(''); // a normal search is not a surprise
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName, 1, activeTopic);
      setPhotos(results);
      setLastSearchedCity(locationName);
      setTopic(activeTopic);
      setPage(1);
      setVisibleCount(SHOWN_AT_FIRST);
      setHasMore(results.length > 0);
      setSearchFailed(results.length === 0 && didLastSearchFail());

      // TODO 5.1 [History Recording]: Once the search above succeeds, record the searched city
      // with recordSearch(locationName) from useSearchHistory() so the History screen can list it.
      // (Switching a tag is the same area, so it is not recorded again.)
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
        clearSearchCache(); // pull-to-refresh should ask Pexels again, not use the remembered answer
        const results = await searchPhotosByLocation(lastSearchedCity, 1, topic);
        setPhotos(results);
        setPage(1);
        setVisibleCount(SHOWN_AT_FIRST);
        setHasMore(results.length > 0);
        setSearchFailed(results.length === 0 && didLastSearchFail());
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Loads the next page of the current search and adds it under the photos already shown.
  const handleLoadMore = async () => {
    if (!lastSearchedCity || loadingMore) return;
    // Photos already downloaded but not drawn yet are shown first, with no waiting.
    if (photos.length > visibleCount) {
      setVisibleCount(visibleCount + SHOWN_AT_FIRST);
      return;
    }
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await searchPhotosPage(lastSearchedCity, nextPage, topic);
      const fresh = result.photos.filter((m) => !photos.some((p) => p.id === m.id));
      setPhotos([...photos, ...fresh]);
      setVisibleCount(visibleCount + SHOWN_AT_FIRST);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  // Randomizer: picks a random featured place (these are known to have photos) and searches it.
  const handleSurprise = () => {
    const pool = ALL_FEATURED_PLACES.filter((p) => p.name !== lastSearchedCity);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      handleSearchSubmit(pick.name);
      setSurpriseName(pick.name); // remember it so the place name can be shown
    }
  };

  // A city picked in the search box (or found by "Near me") works like choosing it in the menus.
  const handlePickCity = (city: City, regionName: string) => {
    setArea({ city, regionName });
    handleSearchSubmit(city.name);
  };

  // Near me: finds the city or municipality of the phone's location and searches it.
  const handleNearMe = async () => {
    setLocating(true);
    try {
      const result = await findMyCity();
      if (result.status === 'ok') {
        handlePickCity(result.city, result.regionName);
      } else if (result.status === 'denied') {
        setNotice(t('locDenied'));
      } else if (result.status === 'nomatch') {
        setNotice(t('locNoMatch'));
      } else {
        setNotice(t('locUnavailable'));
      }
    } finally {
      setLocating(false);
    }
  };

  // Goes back to the start screen with the featured places.
  const handleBackToFeatured = () => {
    setLastSearchedCity('');
    setPhotos([]);
    setHasMore(false);
    setSearchFailed(false);
    setTopic(TOPICS[0].query);
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
  }, [q, n]);

  // The start screen shows the featured places until a search has been made.
  const showResults = loading || !!lastSearchedCity;
  const topicKey = TOPICS.find((x) => x.query === topic)?.labelKey ?? TOPICS[0].labelKey;
  const placeLabel = lastSearchedCity.replace(/^(City of|Municipality of)\s+/i, '');
  const emptyMessage =
    topic === TOPICS[0].query
      ? t('emptyArea', { place: placeLabel })
      : t('emptyTopic', { topic: t(topicKey).toLowerCase(), place: placeLabel });
  const recent = entries.slice(0, 6);
  // Extra details when the searched place is one of the featured places
  const featuredInfo = ALL_FEATURED_PLACES.find((p) => p.name === lastSearchedCity);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton
          icon="translate"
          iconColor={theme.colors.onBackground}
          size={22}
          onPress={toggleLanguage}
          accessibilityLabel={t('switchLanguage')}
        />
        <IconButton
          icon="bag-suitcase-outline"
          iconColor={theme.colors.onBackground}
          size={22}
          onPress={() => router.push('/trip')}
          accessibilityLabel={t('tripTitle')}
        />
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Halloween banner: logo slot + title + tagline */}
        <View style={[styles.banner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
          <View style={styles.titleRow}>
            {/* Logo beside the title: shows your image once LOGO_SOURCE above is set */}
            {LOGO_SOURCE ? (
              <Image
                source={LOGO_SOURCE}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel="Lakbay PH logo"
              />
            ) : (
              <View style={[styles.logoSlot, { borderColor: theme.colors.secondary }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                  LOGO
                </Text>
              </View>
            )}
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
              Lakbay PH
            </Text>
          </View>
          <Text variant="labelLarge" style={[styles.tagline, { color: theme.colors.secondary }]}>
            🎃 {t('tagline')} 🕯️
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('subtitle')}
          </Text>
          <Text style={styles.decor}>🦇  🕸️  🎃  💀  🕯️  🌙  🦇</Text>
        </View>

        {/* Type a city, town or tourist spot and pick it from the suggestions */}
        <PlaceSearch onPickCity={handlePickCity} onPickPlace={(name) => handleSearchSubmit(name)} />

        {/* Connect the location selection input modules */}
        <LocationForm
          onSearch={handleSearchSubmit}
          onCityChange={(city, regionName) => setArea(city ? { city, regionName } : null)}
        />

        {/* Description of the chosen area, shown once when it is picked */}
        {area && <AreaDescription city={area.city} regionName={area.regionName} />}

        {/* Weather of the chosen area (while the start screen is showing) */}
        {!showResults && area && <WeatherCard placeName={area.city.name} />}

        {/* Quick buttons: near me, randomizer, festivals, folklore */}
        <View style={styles.quickRow}>
          <Button mode="text" icon="crosshairs-gps" loading={locating} disabled={locating} onPress={handleNearMe}>
            {t('nearMe')}
          </Button>
          <Button mode="text" icon="dice-5" onPress={handleSurprise}>
            {t('surprise')}
          </Button>
          <Button mode="text" icon="party-popper" onPress={() => router.push('/festivals')}>
            {t('festivalsButton')}
          </Button>
          <Button mode="text" icon="ghost-outline" onPress={() => router.push('/folklore')}>
            {t('folkloreButton')}
          </Button>
        </View>

        {showResults ? (
          <>
            {/* Which place these photos are of (also tells what "Surprise me" picked) */}
            {!!lastSearchedCity && (
              <View
                style={[
                  styles.placeHeader,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
                ]}
              >
                {surpriseName === lastSearchedCity && (
                  <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
                    🎲 {t('surpriseResult')}
                  </Text>
                )}
                <Text variant="headlineSmall" style={[styles.placeName, { color: theme.colors.primary }]}>
                  📍 {placeLabel}
                </Text>
                {featuredInfo && (
                  <>
                    <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
                      {featuredInfo.location}
                    </Text>
                    <Text variant="bodySmall" style={[styles.placeText, { color: theme.colors.onSurfaceVariant }]}>
                      {featuredInfo.description}
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* Weather of the searched place */}
            {!!lastSearchedCity && <WeatherCard placeName={lastSearchedCity} />}

            {/* Save the searched place to My Trip */}
            {!!lastSearchedCity && (
              <Button
                mode="outlined"
                icon={isInTrip(lastSearchedCity) ? 'check' : 'bag-suitcase-outline'}
                disabled={isInTrip(lastSearchedCity)}
                onPress={() => addPlace(lastSearchedCity)}
                style={styles.tripButton}
              >
                {isInTrip(lastSearchedCity) ? t('tripIn') : t('tripAdd')}
              </Button>
            )}

            {/* Tags: they stay here after a search and re-run it for the same area */}
            <View style={styles.topicRow}>
              {TOPICS.map((tag) => (
                <Chip
                  key={tag.query}
                  selected={topic === tag.query}
                  showSelectedOverlay
                  disabled={loading || !lastSearchedCity}
                  onPress={() => handleSearchSubmit(lastSearchedCity, tag.query)}
                >
                  {t(tag.labelKey)}
                </Chip>
              ))}
            </View>

            {/* Connect presentation display layout nodes passing state parameters downstream */}
            <MediaGallery
              photos={photos.slice(0, visibleCount)}
              loading={loading}
              emptyMessage={emptyMessage}
              failed={searchFailed}
              onRetry={() => handleSearchSubmit(lastSearchedCity, topic)}
            />

            {/* Pagination: shows more photos, asking Pexels for the next page when needed */}
            {(hasMore || photos.length > visibleCount) && !loading && photos.length > 0 && (
              <Button
                mode="outlined"
                icon="plus"
                loading={loadingMore}
                disabled={loadingMore}
                onPress={handleLoadMore}
                style={styles.loadMore}
              >
                {t('loadMore')}
              </Button>
            )}

            <Button mode="text" icon="arrow-left" onPress={handleBackToFeatured} style={styles.loadMore}>
              {t('backToFeatured')}
            </Button>
          </>
        ) : (
          <>
            <FeaturedSection onPick={handleSearchSubmit} />

            {/* Recently viewed places (the latest searches) */}
            {recent.length > 0 && (
              <View style={styles.recent}>
                <Text variant="titleSmall" style={[styles.recentHeading, { color: theme.colors.secondary }]}>
                  🕯️ {t('recentHeading')}
                </Text>
                <View style={styles.topicRow}>
                  {recent.map((entry, index) => (
                    <Chip key={`${entry}-${index}`} icon="history" onPress={() => handleSearchSubmit(entry)}>
                      {entry.replace(/^(City of|Municipality of)\s+/i, '')}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={4000}>
        {notice}
      </Snackbar>
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
  banner: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
  },
  logoSlot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  decor: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeHeader: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    gap: 4,
  },
  placeName: {
    fontWeight: '700',
    textAlign: 'center',
  },
  placeText: {
    textAlign: 'center',
  },
  tripButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  recent: {
    marginTop: 24,
  },
  recentHeading: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 10,
  },
  loadMore: {
    marginTop: 20,
    alignSelf: 'center',
  },
});