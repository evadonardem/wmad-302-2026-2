/**
 * Home Screen - Cookbook Discover Tab
 * Recipes load 10 at a time and more load as you scroll (GET /recipes?limit&skip).
 * Pull down to refresh. Category chips open Search filtered by tag.
 *
 * Design: soft hero banner, a centered "Categories" row of photo tiles you swipe
 * sideways, then the recipe feed. Colors come from Paper's theme so light and
 * dark both work.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { useRecipeCatalog } from '@/hooks';
import { countBy } from '@/utils/recipeFilters';
import { Recipe } from '@/types/recipe';
import { RecipeCard, LoadingState, ErrorState } from '@/components/CommonComponents';
import { useThemeMode, useThemedStyles } from '@/context/ThemeContext';
import { styles as rawStyles } from './homeStyles';

// ---------------------------------------------------------------------------
// FoodBackground - slow floating food icons (theme-aware, ignores touches,
// stays still when the device has "reduce motion" on). Kept in this file so
// no separate module is needed.
// ---------------------------------------------------------------------------
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Item {
  icon: IconName;
  left: number; // % of width
  size: number;
  duration: number; // ms for one trip bottom -> top
  offset: number; // 0..1 starting point, so items are spread out on mount
  sway: number; // px left/right
  tilt: number; // degrees
}

// Fixed layout (no randomness) so it looks the same on every render
const ITEMS: Item[] = [
  { icon: 'pizza', left: 6, size: 34, duration: 17000, offset: 0.1, sway: 14, tilt: 18 },
  { icon: 'food-apple', left: 22, size: 28, duration: 21000, offset: 0.55, sway: 10, tilt: 14 },
  { icon: 'hamburger', left: 38, size: 38, duration: 19000, offset: 0.3, sway: 16, tilt: 16 },
  { icon: 'cupcake', left: 54, size: 30, duration: 23000, offset: 0.8, sway: 12, tilt: 20 },
  { icon: 'carrot', left: 70, size: 32, duration: 18000, offset: 0.45, sway: 14, tilt: 15 },
  { icon: 'fish', left: 84, size: 30, duration: 22000, offset: 0.05, sway: 10, tilt: 18 },
  { icon: 'egg-fried', left: 14, size: 26, duration: 25000, offset: 0.7, sway: 12, tilt: 12 },
  { icon: 'noodles', left: 46, size: 30, duration: 24000, offset: 0.95, sway: 14, tilt: 16 },
  { icon: 'ice-cream', left: 62, size: 28, duration: 20000, offset: 0.2, sway: 10, tilt: 20 },
  { icon: 'bread-slice', left: 90, size: 26, duration: 26000, offset: 0.6, sway: 12, tilt: 14 },
];

function FloatingItem({ item, height, color, opacity }: { item: Item; height: number; color: string; opacity: number }) {
  const progress = useMemo(() => new Animated.Value(item.offset), [item.offset]);

  useEffect(() => {
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: item.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => finished && loop());
    };
    // First trip starts part-way up, then every trip runs the full height
    Animated.timing(progress, {
      toValue: 1,
      duration: item.duration * (1 - item.offset),
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => finished && loop());
    return () => {
      stopped = true;
      progress.stopAnimation();
    };
  }, [progress, item.duration, item.offset]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height + item.size, -item.size * 2],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, item.sway, 0, -item.sway, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${item.tilt}deg`, `${item.tilt}deg`],
  });

  return (
    <Animated.View
      style={[
        bgStyles.item,
        { left: `${item.left}%`, opacity, transform: [{ translateY }, { translateX }, { rotate }] },
      ]}
    >
      <MaterialCommunityIcons name={item.icon} size={item.size} color={color} />
    </Animated.View>
  );
}

function FoodBackground({ count = ITEMS.length }: { count?: number }) {
  const { colors } = useTheme();
  const { isDark } = useThemeMode();
  const [height, setHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);

  // A little stronger in dark mode so the icons stay visible on a dark surface
  const opacity = isDark ? 0.16 : 0.12;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {height > 0 && !reduceMotion &&
        ITEMS.slice(0, count).map((item) => (
          <FloatingItem key={item.icon} item={item} height={height} color={colors.primary} opacity={opacity} />
        ))}
    </View>
  );
}

const bgStyles = StyleSheet.create({
  item: { position: 'absolute', top: 0 },
});

const PAGE_SIZE = 10;

type LoadMode = 'first' | 'more' | 'refresh';

export default function HomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(rawStyles);
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { width } = useWindowDimensions();
  const compact = width < 360; // small phones get slightly smaller headline text

  // Category tiles: the 8 most common tags, each shown with the photo of the
  // first recipe that has that tag
  const { recipes: catalog } = useRecipeCatalog();
  const topCategories = useMemo(
    () =>
      countBy(catalog, (r) => r.tags)
        .slice(0, 8)
        .map((item) => ({
          name: item.name,
          image: catalog.find((r) => r.tags.includes(item.name))?.image,
        })),
    [catalog]
  );

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false); // stops overlapping requests (e.g. fast scrolling)

  const fetchPage = useCallback(async (skip: number, mode: LoadMode) => {
    if (busy.current) return;
    busy.current = true;
    if (mode === 'first') setLoading(true);
    if (mode === 'more') setLoadingMore(true);
    setError(null);
    try {
      const data = await recipeApi.getRecipes({ limit: PAGE_SIZE, skip });
      setTotal(data.total);
      setRecipes((prev) => (mode === 'more' ? [...prev, ...data.recipes] : data.recipes));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPage(0, 'first');
  }, [fetchPage]);

  const hasMore = recipes.length < total;

  const loadMore = () => {
    if (hasMore && !error) fetchPage(recipes.length, 'more');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPage(0, 'refresh');
  };

  // First load
  if (loading && recipes.length === 0) {
    return <LoadingState message="Loading recipes..." />;
  }

  // First load failed
  if (error && recipes.length === 0) {
    return <ErrorState message={error} onRetry={() => fetchPage(0, 'first')} />;
  }

  const header = (
    <View>
      {/* Hero banner */}
      <View style={[styles.hero, { backgroundColor: colors.primaryContainer }]}>
        {/* Floating food inside the banner (clipped by the rounded corners) */}
        <FoodBackground count={6} />
        <Text style={[styles.heroGreeting, { color: colors.onSurfaceVariant }]}>
          {user ? `Welcome back, ${user.firstName}` : 'Welcome to Cookbook'}
        </Text>
        <Text
          style={[
            styles.heroTitle,
            { color: colors.onSurface },
            compact && { fontSize: 26, lineHeight: 32 },
          ]}
        >
          Explore{'\n'}
          <Text style={{ color: colors.primary }}>Culinary</Text> Insights
        </Text>
      </View>

      {/* Categories: photo tiles, swipe sideways */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.centerTitle, { color: colors.onSurface }]}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.tileRow}
        >
          {topCategories.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[styles.categoryTile, { backgroundColor: colors.primaryContainer }]}
              onPress={() => router.push(`/(app)/(tabs)/search?tag=${encodeURIComponent(category.name)}`)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${category.name} recipes`}
            >
              {category.image ? (
                <Image source={{ uri: category.image }} style={styles.categoryImage} />
              ) : (
                <View style={[styles.categoryImage, styles.categoryImageFallback]}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={colors.primary} />
                </View>
              )}
              <Text style={[styles.categoryName, { color: colors.onSurface }]} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed title */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Recipes</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/search')} style={styles.seeAll}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  let footer: React.ReactElement | null = null;
  if (loadingMore) {
    footer = (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  } else if (error) {
    footer = (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>{'Couldn’t load more recipes'}</Text>
        <Button onPress={() => fetchPage(recipes.length, 'more')}>Retry</Button>
      </View>
    );
  } else if (!hasMore && recipes.length > 0) {
    footer = (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{`You’ve seen all ${total} recipes`}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      data={recipes}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          style={styles.recipeCard}
          onPress={() => router.push(`/recipe/${item.id}`)}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}