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
import { MAX_CONTENT_WIDTH, useBreakpoint } from '@/useBreakpoint';
import React from 'react';

export default function SearchScreen() {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();
  const { isPhone, isDesktop, pad } = useBreakpoint();

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
        {/* Hero: navy → teal with an amber glow, as in the redesign */}
        <View style={[styles.hero, { paddingHorizontal: pad, paddingBottom: isPhone ? 36 : 56 }]}>
          <View pointerEvents="none" style={styles.heroGlow} />
          <View style={styles.heroInner}>
            <View style={styles.toolbar}>
              <IconButton
                icon="history"
                size={20}
                iconColor="#ffffff"
                style={styles.toolbarButton}
                accessibilityLabel="Recent searches"
                onPress={() => router.push('/history')}
              />
              <IconButton
                icon={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
                size={20}
                iconColor="#ffffff"
                style={styles.toolbarButton}
                accessibilityLabel="Toggle dark mode"
                onPress={() => setIsDarkMode((prev) => !prev)}
              />
            </View>

            <View style={styles.pill}>
              <Text variant="labelMedium" style={styles.pillText}>
                Travel Guide 2026
              </Text>
            </View>

            <Text
              variant="headlineMedium"
              style={[
                styles.title,
                isPhone ? { fontSize: 30, lineHeight: 36 } : isDesktop ? { fontSize: 52, lineHeight: 58 } : { fontSize: 42, lineHeight: 48 },
              ]}
            >
              🇵🇭 Lakbay PH
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Explore tourist spots across regions, cities, and municipalities in the Philippines
            </Text>

            <LocationForm onSearch={runSearch} />
          </View>
        </View>

        <View style={[styles.main, { paddingHorizontal: pad }]}>
          <MediaGallery photos={photos} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0c4158', // midpoint of #0b2545 → #0e5a6b
    paddingTop: 12,
  },
  heroGlow: {
    position: 'absolute',
    top: -140,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
  },
  heroInner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  toolbarButton: {
    margin: 0,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    marginTop: 8,
    marginBottom: 16,
  },
  pillText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.8,
    fontSize: 36,
    lineHeight: 42,
  },
  subtitle: {
    color: '#cfe3ea',
    marginTop: 10,
    marginBottom: 26,
    maxWidth: 520,
  },
  main: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingTop: 32,
    paddingBottom: 56,
  },
}
);