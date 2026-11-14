
/**
 * Favorites Screen - Cookbook
 * Loads and manages favorite recipes using AsyncStorage.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Card,
  Title,
  Chip,
  Button,
  IconButton,
} from 'react-native-paper';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/recipe';
import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage } from '@/utils/storage';
import { styles } from './favoritesStyles';

export default function FavoritesScreen() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);

    try {
      const favoriteIds = await favoritesStorage.getIds();

      if (favoriteIds.length === 0) {
        setFavorites([]);
        return;
      }

      const recipes = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            return await recipeApi.getRecipeById(id);
          } catch (error) {
            console.error(`Failed to load recipe ${id}:`, error);
            return null;
          }
        }),
      );

      const validRecipes = recipes.filter(
        (recipe): recipe is Recipe => recipe !== null,
      );

      setFavorites(validRecipes);

      // Remove IDs for recipes that are no longer available
      const validIds = validRecipes.map((recipe) => recipe.id);
      const invalidIds = favoriteIds.filter((id) => !validIds.includes(id));

      if (invalidIds.length > 0) {
        await favoritesStorage.setIds(validIds);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      Alert.alert(
        'Error',
        'Unable to load your favorite recipes. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh favorites whenever this screen becomes active
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const removeFavorite = (recipeId: number) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this recipe?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(recipeId);

            try {
              await favoritesStorage.removeId(recipeId);

              setFavorites((previous) =>
                previous.filter((recipe) => recipe.id !== recipeId),
              );
            } catch (error) {
              console.error('Failed to remove favorite:', error);
              Alert.alert(
                'Error',
                'Unable to remove this recipe from favorites.',
              );
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push(`/(app)/(tabs)/recipe/${item.id}`)
      }
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
            resizeMode="cover"
          />

          <View style={styles.info}>
            <Title style={styles.title} numberOfLines={2}>
              {item.name}
            </Title>

            <View style={styles.meta}>
              <Chip style={styles.difficultyChip} compact>
                {item.difficulty}
              </Chip>

              <Chip style={styles.cuisineChip} compact>
                {item.cuisine}
              </Chip>
            </View>

            <Text style={styles.details}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes} min
              {' · '}👥 {item.servings}
              {' · '}⭐ {item.rating.toFixed(1)}
            </Text>
          </View>

          <IconButton
            icon="heart"
            size={24}
            iconColor="#C62828"
            disabled={removingId === item.id}
            onPress={() => removeFavorite(item.id)}
            accessibilityLabel="Remove from favorites"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>
          Loading favorites...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={80}
            color="#BCAAA4"
          />

          <Text style={styles.emptyTitle}>
            No Favorites Yet
          </Text>

          <Text style={styles.emptyText}>
            Recipes you love will appear here.
          </Text>

          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/search')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>
              Browse Recipes
            </Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <Title style={styles.headerTitle}>
                Your Favorites ({favorites.length})
              </Title>
            </View>
          }
        />
      )}
    </View>
  );
}
