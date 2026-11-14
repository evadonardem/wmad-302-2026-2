import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button, Card, Chip, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { appColors } from '@/constants/theme';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';

export default function MyRecipesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  const colors = settings.darkModeEnabled ? appColors.dark : appColors.light;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadRecipes = useCallback(async () => {
    if (!user) {
      setRecipes([]);
      setIsLoading(false);
      return;
    }
    const request = ++requestId.current;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await recipeApi.getRecipes({ limit: 0 });
      if (request === requestId.current) {
        setRecipes(response.recipes.filter((recipe) => recipe.userId === user.id));
      }
    } catch (error) {
      if (request === requestId.current) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load your recipes.');
      }
    } finally {
      if (request === requestId.current) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadRecipes();
    return () => {
      requestId.current += 1;
    };
  }, [loadRecipes]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Recipes" />
      </Appbar.Header>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : errorMessage ? (
        <View style={styles.center}>
          <Text style={[styles.message, { color: colors.error }]}>{errorMessage}</Text>
          <Button mode="contained" onPress={loadRecipes}>Try again</Button>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]}>No recipes yet</Text>
          <Text style={[styles.message, { color: colors.muted }]}>
            Recipes created by your account will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={recipes}
          keyExtractor={(recipe) => String(recipe.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/recipe/${item.id}`)}
              activeOpacity={0.85}
              style={styles.recipeRow}
            >
              <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.row}>
                  <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                  <View style={styles.info}>
                    <Title style={{ color: colors.text }} numberOfLines={1}>
                      {item.name}
                    </Title>
                    <View style={styles.meta}>
                      <Chip>{item.difficulty}</Chip>
                      <Text style={{ color: colors.muted }}>{item.cuisine}</Text>
                    </View>
                    <Text style={{ color: colors.muted }}>
                      {item.prepTimeMinutes + item.cookTimeMinutes} min · ⭐ {item.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  recipeRow: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
});
