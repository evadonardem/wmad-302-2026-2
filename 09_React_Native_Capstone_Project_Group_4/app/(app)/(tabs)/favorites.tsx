/**
 * Favorites Screen - Cookbook
 *
 * - Favorite IDs come from FavoritesContext (persisted in AsyncStorage)
 * - Recipes are fetched by ID (GET /recipes/{id}) and cached while the screen is mounted
 * - Remove with confirmation, pull-to-refresh, empty state and error/retry handling
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Chip, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';
import { styles } from './favoritesStyles';

export default function FavoritesScreen() {
  const router = useRouter();
  const { ids, isLoaded, removeFavorite } = useFavorites();

  const cacheRef = useRef(new Map<number, Recipe>());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep `recipes` in sync with the saved IDs, fetching only the ones we don't have yet
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    const sync = async () => {
      const missing = ids.filter((id) => !cacheRef.current.has(id));
      let failed = 0;

      if (missing.length > 0) {
        setLoading(true);
        const results = await Promise.allSettled(missing.map((id) => recipeApi.getRecipeById(id)));
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            cacheRef.current.set(missing[index], result.value);
          } else {
            failed += 1;
          }
        });
      }

      if (cancelled) return;
      setRecipes(
        ids
          .map((id) => cacheRef.current.get(id))
          .filter((recipe): recipe is Recipe => recipe !== undefined)
      );
      setFailedCount(failed);
      setLoading(false);
      setRefreshing(false);
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, [ids, isLoaded, reloadKey]);

  const retry = () => setReloadKey((key) => key + 1);

  const onRefresh = () => {
    setRefreshing(true);
    cacheRef.current.clear();
    retry();
  };

  const confirmRemove = (recipeId: number) => {
    // Alert buttons don't work on react-native-web, so use the browser's confirm there
    if (Platform.OS === 'web') {
      const web = globalThis as unknown as { confirm?: (message: string) => boolean };
      if (web.confirm?.('Remove this recipe from your favorites?')) {
        removeFavorite(recipeId);
      }
      return;
    }

    Alert.alert('Remove from Favorites', 'Are you sure you want to remove this recipe?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(recipeId) },
    ]);
  };

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => router.push(`/recipe/${item.id}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
          <View style={styles.info}>
            <Title style={styles.title} numberOfLines={1}>
              {item.name}
            </Title>
            <View style={styles.meta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.details}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐{' '}
              {item.rating.toFixed(1)}
            </Text>
          </View>
          <IconButton
            icon="heart"
            size={24}
            iconColor="#C62828"
            onPress={() => confirmRemove(item.id)}
            accessibilityLabel="Remove from favorites"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Initial load (saved IDs, then recipes)
  if (!isLoaded || (loading && !refreshing)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  // Nothing saved
  if (ids.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="heart-outline" size={80} color="#BCAAA4" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>Tap the heart on a recipe to save it here</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/search')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>Browse Recipes</Text>
          </Button>
        </View>
      </View>
    );
  }

  // Saved IDs, but nothing could be loaded (e.g. offline)
  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cloud-off-outline" size={80} color="#BCAAA4" />
          <Text style={styles.emptyTitle}>Couldn't Load Favorites</Text>
          <Text style={styles.emptyText}>Check your connection and try again</Text>
          <Button
            mode="contained"
            onPress={retry}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E85D04']} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Title style={styles.headerTitle}>Your Favorites ({ids.length})</Title>
            {failedCount > 0 && (
              <TouchableOpacity onPress={retry}>
                <Text style={styles.details}>
                  {failedCount} recipe{failedCount === 1 ? '' : 's'} couldn't be loaded. Tap to
                  retry.
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}