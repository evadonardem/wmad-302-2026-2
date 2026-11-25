import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  Card,
  Title,
  Chip,
  Searchbar,
  Menu,
  Button,
} from 'react-native-paper';

import { recipeApi } from '@/services/recipeApi';
import type { Recipe } from '@/types/recipe';

const categories = [
  'Beef',
  'Chicken',
  'Dessert',
  'Lamb',
  'Pasta',
  'Pork',
  'Seafood',
  'Vegetarian',
];

const PAGE_SIZE = 20;

export default function SearchScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    category?: string;
  }>();

  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const [category, setCategory] = useState<string | null>(
    params.category || null
  );

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [sort, setSort] = useState('rating');

  const [menu, setMenu] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    setCategory(params.category || null);
  }, [params.category]);

  const loadRecipes = useCallback(
    async (reset = true) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError('');

      const currentPage = reset ? 0 : pageRef.current;
      const skip = currentPage * PAGE_SIZE;

      try {
        let data;

        if (category) {
          data = await recipeApi.getRecipesByCategory(category, {
            limit: PAGE_SIZE,
            skip,
          });
        } else if (submittedQuery.trim()) {
          data = await recipeApi.searchRecipes(submittedQuery.trim(), {
            limit: PAGE_SIZE,
            skip,
          });
        } else {
          data = await recipeApi.getRecipes({
            limit: PAGE_SIZE,
            skip,
          });
        }

        let result = [...data.recipes];

        if (difficulty) {
          result = result.filter(
            recipe => recipe.difficulty === difficulty
          );
        }

        result.sort((a, b) => {
          if (sort === 'time') {
            return (
              a.prepTimeMinutes + a.cookTimeMinutes -
              (b.prepTimeMinutes + b.cookTimeMinutes)
            );
          }

          if (sort === 'calories') {
            return a.caloriesPerServing - b.caloriesPerServing;
          }

          return b.rating - a.rating;
        });

        setRecipes(previous => reset ? result : [...previous, ...result]);
        setTotal(data.total);
        pageRef.current = currentPage + 1;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load recipes'
        );

        if (reset) setRecipes([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingRef.current = false;
      }
    },
    [category, submittedQuery, difficulty, sort]
  );

  useEffect(() => {
    pageRef.current = 0;
    loadRecipes(true);
  }, [loadRecipes]);

  const submitSearch = () => {
    setCategory(null);
    setSubmittedQuery(query.trim());
  };

  const selectCategory = (selected: string) => {
    setCategory(previous => previous === selected ? null : selected);
    setSubmittedQuery('');
    setQuery('');
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <Card
      style={{ marginHorizontal: 16, marginVertical: 6 }}
      onPress={() =>
        router.push(`/(app)/(tabs)/recipe/${item.id}`)
      }
    >
      <Card.Cover source={{ uri: item.image }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Text>
          {item.cuisine} · {item.difficulty} · ⭐ {item.rating}
        </Text>
        <Text>
          {item.prepTimeMinutes + item.cookTimeMinutes} minutes
        </Text>
      </Card.Content>
    </Card>
  );

  const loadMore = () => {
    if (!loadingRef.current && recipes.length < total) {
      loadRecipes(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="Search recipes"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={submitSearch}
        style={{ margin: 16 }}
      />

      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <Chip
            selected={category === item}
            onPress={() => selectCategory(item)}
            style={{ marginHorizontal: 4 }}
          >
            {item}
          </Chip>
        )}
        style={{ maxHeight: 48 }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />

      {category && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text>Showing {category} recipes</Text>
          <Button onPress={() => selectCategory(category)}>Clear</Button>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <Text>Difficulty:</Text>

        {['Easy', 'Medium', 'Hard'].map(item => (
          <Chip
            key={item}
            selected={difficulty === item}
            onPress={() =>
              setDifficulty(previous => previous === item ? null : item)
            }
          >
            {item}
          </Chip>
        ))}

        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={
            <Button onPress={() => setMenu(true)}>
              Sort: {sort}
            </Button>
          }
        >
          <Menu.Item
            title="Top rated"
            onPress={() => {
              setSort('rating');
              setMenu(false);
            }}
          />
          <Menu.Item
            title="Quickest"
            onPress={() => {
              setSort('time');
              setMenu(false);
            }}
          />
          <Menu.Item
            title="Lowest calories"
            onPress={() => {
              setSort('calories');
              setMenu(false);
            }}
          />
        </Menu>
      </View>

      {error ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: 'red' }}>{error}</Text>
          <Button onPress={() => loadRecipes(true)}>Try Again</Button>
        </View>
      ) : null}

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={item => String(item.id)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRecipes(true);
            }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: 'center', padding: 30 }}>
              No recipes found. Try another category.
            </Text>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#E85D04"
              style={{ padding: 16 }}
            />
          ) : null
        }
      />
    </View>
  );
}
