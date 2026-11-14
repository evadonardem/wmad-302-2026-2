
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Title,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Recipe } from '@/types/recipe';
import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage } from '@/utils/storage';

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const loadRecipe = useCallback(async () => {
    try {
      setLoading(true);

      const recipeId = Number(id);

      if (!Number.isInteger(recipeId) || recipeId <= 0) {
        throw new Error('Invalid recipe ID');
      }

      const [recipeData, favoriteIds] = await Promise.all([
        recipeApi.getRecipeById(recipeId),
        favoritesStorage.getIds(),
      ]);

      setRecipe(recipeData);
      setIsFavorite(favoriteIds.includes(recipeId));
    } catch (error) {
      console.error('Failed to load recipe:', error);
      Alert.alert(
        'Error',
        'Unable to load this recipe. Please try again.',
        [{ text: 'Go Back', onPress: () => router.back() }],
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const toggleFavorite = async () => {
    if (!recipe || savingFavorite) {
      return;
    }

    try {
      setSavingFavorite(true);

      const added = await favoritesStorage.toggleId(recipe.id);
      setIsFavorite(added);

      Alert.alert(
        added ? 'Added to Favorites' : 'Removed from Favorites',
        added
          ? 'This recipe has been saved to your favorites.'
          : 'This recipe has been removed from your favorites.',
      );
    } catch (error) {
      console.error('Failed to update favorite:', error);
      Alert.alert('Error', 'Unable to update your favorites.');
    } finally {
      setSavingFavorite(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="food-off"
          size={64}
          color="#BCAAA4"
        />
        <Text style={styles.errorText}>Recipe not found.</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: recipe.image }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{recipe.name}</Title>
            <Text style={styles.subtitle}>{recipe.cuisine}</Text>
          </View>

          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            iconColor={isFavorite ? '#C62828' : '#8D6E63'}
            size={32}
            disabled={savingFavorite}
            onPress={toggleFavorite}
            accessibilityLabel={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          />
        </View>

        <View style={styles.chips}>
          <Chip icon="star" style={styles.chip}>
            {recipe.rating.toFixed(1)}
          </Chip>
          <Chip style={styles.chip}>{recipe.difficulty}</Chip>
          {recipe.tags.map((tag) => (
            <Chip key={tag} style={styles.chip}>
              {tag}
            </Chip>
          ))}
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#E85D04" />
              <Text style={styles.statValue}>
                {recipe.prepTimeMinutes} min
              </Text>
              <Text style={styles.statLabel}>Prep</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="stove" size={24} color="#E85D04" />
              <Text style={styles.statValue}>
                {recipe.cookTimeMinutes} min
              </Text>
              <Text style={styles.statLabel}>Cook</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#E85D04" />
              <Text style={styles.statValue}>
                {recipe.servings}
              </Text>
              <Text style={styles.statLabel}>Servings</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={24} color="#E85D04" />
              <Text style={styles.statValue}>
                {recipe.caloriesPerServing}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Ingredients</Title>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={`${index}-${ingredient}`} style={styles.listItem}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle"
                size={9}
                color="#E85D04"
              />
              <Text style={styles.listText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Instructions</Title>
          {recipe.instructions.map((instruction, index) => (
            <View key={`${index}-${instruction}`} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Recipe Information</Title>
          <Text style={styles.infoText}>
            Meal Types: {recipe.mealType.join(', ')}
          </Text>
          <Text style={styles.infoText}>
            Reviews: {recipe.reviewCount}
          </Text>
          <Text style={styles.infoText}>
            Recipe ID: {recipe.id}
          </Text>
        </View>

        <Button
          mode="outlined"
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8F0',
  },
  loadingText: {
    marginTop: 12,
    color: '#8D6E63',
  },
  errorText: {
    marginVertical: 16,
    color: '#8D6E63',
    fontSize: 16,
  },
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#EADFD5',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  subtitle: {
    marginTop: 5,
    color: '#8D6E63',
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 14,
  },
  chip: {
    backgroundColor: '#FBE3D0',
  },
  statsCard: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '25%',
    paddingVertical: 8,
  },
  statValue: {
    marginTop: 6,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: '#8D6E63',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 21,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  listText: {
    flex: 1,
    color: '#4E342E',
    fontSize: 15,
  },
  divider: {
    marginTop: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E85D04',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: '#4E342E',
  },
  infoText: {
    color: '#6D4C41',
    fontSize: 14,
    marginBottom: 10,
  },
  backButton: {
    marginTop: 28,
    borderColor: '#E85D04',
  },
});
