/**
 * Categories Screen - Cookbook
 * Browse recipes by category
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { styles } from './categoriesStyles';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Category {
  name: string;
  count?: number;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setError(null);
      // One request for all recipes, then count how many recipes carry each tag
      // (DummyJSON recipe "categories" are its tags)
      const { recipes } = await recipeApi.getRecipes({ limit: 0 });
      const counts: Record<string, number> = {};
      recipes.forEach((recipe) => {
        recipe.tags.forEach((tag) => {
          counts[tag] = (counts[tag] ?? 0) + 1;
        });
      });

      // Biggest categories first
      const sorted = Object.keys(counts)
        .map((name) => ({ name, count: counts[name] }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      setCategories(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item.name)}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name)}
              size={32}
              color="#E85D04"
            />
          </View>
          <Title style={styles.categoryName}>{item.name}</Title>
          {item.count !== undefined && (
            <Text style={styles.categoryCount}>
              {item.count} {item.count === 1 ? 'recipe' : 'recipes'}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => {
            setLoading(true);
            loadCategories();
          }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.pageTitle}>Categories</Title>
      <Text style={styles.pageSubtitle}>Browse recipes by category</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E85D04']} />
        }
        ListEmptyComponent={<Text style={styles.pageSubtitle}>No categories found</Text>}
      />

      {/* Student Guide */}
      <View style={styles.guideContainer}>
        <Text style={styles.guideTitle}>📝 Student Implementation Guide</Text>
        <Text style={styles.guideText}>
          Enhance the categories screen:{'\n'}
          1. Add category images from assets{'\n'}
          2. Show recipe count per category{'\n'}
          3. Add sub-categories (e.g., Beef → Steaks, Roasts){'\n'}
          4. Add "Popular" and "Trending" sections{'\n'}
          5. Implement pull-to-refresh
        </Text>
      </View>
    </View>
  );
}

function getCategoryIcon(category: string): IconName {
  const icons: Record<string, IconName> = {
    beef: 'cow',
    chicken: 'food-drumstick',
    dessert: 'cake',
    lamb: 'sheep',
    pasta: 'noodles',
    pork: 'pig',
    seafood: 'fish',
    shrimp: 'fish',
    vegetarian: 'leaf',
    breakfast: 'egg',
    appetizer: 'silverware-fork-knife',
    'side dish': 'bowl',
    'main course': 'silverware',
    soup: 'bowl-outline',
    salad: 'leaf-circle',
    drink: 'glass-mug',
    pizza: 'pizza',
    italian: 'pasta',
    asian: 'noodles',
    cookies: 'cookie',
    baking: 'baguette',
    bruschetta: 'bread-slice',
    'stir-fry': 'pot-steam',
    biryani: 'rice',
    indian: 'rice',
    pakistani: 'rice',
    quinoa: 'barley',
    karahi: 'pot-mix',
    keema: 'food-steak',
    salsa: 'taco',
  };
  // Tags are matched ignoring upper/lower case ("Main course" vs "Main Course")
  return icons[category.toLowerCase()] || 'food';
}
