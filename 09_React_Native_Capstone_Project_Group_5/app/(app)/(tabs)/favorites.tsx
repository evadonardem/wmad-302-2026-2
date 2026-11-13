/**
 * Favorites Screen - Cookbook
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Card, Title, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage } from '@/utils/storage';
import { styles } from './favoritesStyles';

interface Recipe {
  id: number;
  name: string;
  image: string;
  difficulty: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  rating: number;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const favoriteIds = (await favoritesStorage.getIds()) ?? [];
      if (favoriteIds.length === 0) {
        setFavorites([]);
        return;
      }

      const recipes = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            return await recipeApi.getRecipeById(id);
          } catch {
            return null;
          }
        })
      );

      setFavorites(recipes.filter(Boolean) as Recipe[]);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadFavorites();
  }, [loadFavorites]));

  const removeFavorite = async (recipeId: number) => {
    Alert.alert('Remove from Favorites', 'Are you sure you want to remove this recipe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await favoritesStorage.removeId(recipeId);
          setFavorites((prev) => prev.filter((recipe) => recipe.id !== recipeId));
        },
      },
    ]);
  };

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.favoriteCard} onPress={() => router.push(`/(app)/recipe/${item.id}`)}>
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
          <View style={styles.info}>
            <Title style={styles.title} numberOfLines={2}>{item.name}</Title>
            <View style={styles.meta}>
              <Chip style={styles.difficultyChip}>{item.difficulty}</Chip>
              <Chip style={styles.cuisineChip}>{item.cuisine}</Chip>
            </View>
            <Text style={styles.details} numberOfLines={2}>
              ⏱️ {item.prepTimeMinutes + item.cookTimeMinutes}min · 👥 {item.servings} · ⭐ {item.rating}
            </Text>
          </View>
          <TouchableOpacity onPress={() => void removeFavorite(item.id)} accessibilityLabel="Remove from favorites" style={styles.favoriteRemoveButton}>
            <MaterialCommunityIcons name="heart" size={24} color="#C62828" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="heart-outline" size={80} color="#BCAAA4" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>Recipes you love will appear here</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/search')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>Browse Recipes</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Title style={styles.headerTitle}>Your Favorites ({favorites.length})</Title>
            </View>
          }
        />
      )}
    </View>
  );
}
