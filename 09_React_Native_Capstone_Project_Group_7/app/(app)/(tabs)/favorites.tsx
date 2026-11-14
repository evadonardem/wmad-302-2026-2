/**
 * Favorites Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card, Title, Chip, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { favoritesStorage } from '@/utils/storage';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';
import { APP_COLORS } from '@/constants/theme';
import { styles } from './favoritesStyles';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const ids = await favoritesStorage.getIds();
      if (ids && ids.length > 0) {
        const recipePromises = ids.map(async (id) => {
          try {
            return await recipeApi.getRecipeById(id);
          } catch {
            return null;
          }
        });
        const results = await Promise.all(recipePromises);
        setFavorites(results.filter((r): r is Recipe => r !== null));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const removeFavorite = (recipeId: number) => {
    Alert.alert(
      'Remove from Favorites',
      'Remove this dish from your saved favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await favoritesStorage.removeId(recipeId);
            setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
          },
        },
      ]
    );
  };

  const renderFavorite = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => router.push(`/(app)/(tabs)/recipe/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
          <View style={styles.info}>
            <Title style={styles.title} numberOfLines={1}>{item.name}</Title>
            <View style={styles.meta}>
              <Chip style={styles.difficultyChip} textStyle={{ color: APP_COLORS.primary, fontSize: 11, fontWeight: '700' }}>
                {item.difficulty}
              </Chip>
              <Chip style={styles.cuisineChip} textStyle={{ color: APP_COLORS.textSecondary, fontSize: 11, fontWeight: '600' }}>
                {item.cuisine}
              </Chip>
            </View>
            <Text style={styles.details}>
              ⏱ {item.prepTimeMinutes + item.cookTimeMinutes}m · 👥 {item.servings} · ★ {item.rating.toFixed(1)}
            </Text>
          </View>
          <IconButton
            icon="heart"
            size={24}
            iconColor={APP_COLORS.accent}
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
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Loading saved dishes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="heart-outline" size={76} color={APP_COLORS.border} />
          <Text style={styles.emptyTitle}>No Saved Dishes Yet</Text>
          <Text style={styles.emptyText}>Tap the heart icon on any recipe to keep it in your personal archive</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/search' as any)}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>Explore Recipes</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Title style={styles.headerTitle}>Saved Favorites ({favorites.length})</Title>
            </View>
          }
        />
      )}
    </View>
  );
}