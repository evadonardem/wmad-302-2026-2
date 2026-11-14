import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Button, Card, Checkbox, IconButton, List, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { appColors } from '@/constants/theme';
import { recipeApi } from '@/services/recipeApi';
import { Recipe } from '@/types/recipe';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type Weekday = typeof WEEKDAYS[number];

interface CookbookCollection {
  id: string;
  name: string;
  recipeIds: number[];
}

interface CookbookData {
  collections: CookbookCollection[];
  weeklyPlan: Record<Weekday, number[]>;
}

function createEmptyCookbook(): CookbookData {
  return {
    collections: [],
    weeklyPlan: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  };
}

function parseCookbook(raw: string | null): CookbookData {
  if (raw === null) return createEmptyCookbook();
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Saved cookbook data has an invalid format');
  }

  const values = parsed as Record<string, unknown>;
  const collections = Array.isArray(values.collections)
    ? values.collections.filter(
        (item): item is CookbookCollection =>
          typeof item === 'object' &&
          item !== null &&
          !Array.isArray(item) &&
          typeof (item as Record<string, unknown>).id === 'string' &&
          typeof (item as Record<string, unknown>).name === 'string' &&
          Array.isArray((item as Record<string, unknown>).recipeIds) &&
          ((item as Record<string, unknown>).recipeIds as unknown[]).every(
            (id) => typeof id === 'number'
          )
      )
    : [];
  const storedPlan =
    typeof values.weeklyPlan === 'object' && values.weeklyPlan !== null
      ? (values.weeklyPlan as Record<string, unknown>)
      : {};
  const weeklyPlan = Object.fromEntries(
    WEEKDAYS.map((day) => [
      day,
      Array.isArray(storedPlan[day])
        ? (storedPlan[day] as unknown[]).filter((id): id is number => typeof id === 'number')
        : [],
    ])
  ) as Record<Weekday, number[]>;

  return { collections, weeklyPlan };
}

type WebDialogs = { confirm?: (message: string) => boolean };

export default function MyCookbookScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { ids: favoriteIds, isLoaded: favoritesLoaded } = useFavorites();
  const { settings } = useSettings();
  const colors = settings.darkModeEnabled ? appColors.dark : appColors.light;
  const storageKey = user ? `user_cookbook:${user.id}` : null;
  const [data, setData] = useState<CookbookData>(createEmptyCookbook);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeRetry, setRecipeRetry] = useState(0);
  const dataRef = useRef(data);
  const savingRef = useRef(false);
  const recipeCache = useRef(new Map<number, Recipe>());

  const selectableRecipeIds = useMemo(() => {
    const allIds = new Set(favoriteIds);
    data.collections.forEach((collection) => collection.recipeIds.forEach((id) => allIds.add(id)));
    Object.values(data.weeklyPlan).forEach((dayIds) => dayIds.forEach((id) => allIds.add(id)));
    return Array.from(allIds);
  }, [data, favoriteIds]);

  useEffect(() => {
    let cancelled = false;
    const empty = createEmptyCookbook();
    setIsLoaded(false);
    dataRef.current = empty;
    setData(empty);
    setErrorMessage(null);

    const loadCookbook = async () => {
      try {
        const raw = storageKey ? await AsyncStorage.getItem(storageKey) : null;
        const loaded = parseCookbook(raw);
        if (!cancelled) {
          dataRef.current = loaded;
          setData(loaded);
        }
      } catch (error) {
        console.error('Failed to load cookbook:', error);
        if (!cancelled) setErrorMessage('Could not load your saved cookbook.');
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    loadCookbook();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!favoritesLoaded) return;
    let cancelled = false;
    setRecipeError(null);
    setRecipes(
      selectableRecipeIds
        .map((id) => recipeCache.current.get(id))
        .filter((recipe): recipe is Recipe => recipe !== undefined)
    );

    const loadFavoriteRecipes = async () => {
      const missingIds = selectableRecipeIds.filter((id) => !recipeCache.current.has(id));
      const results = await Promise.allSettled(
        missingIds.map((id) => recipeApi.getRecipeById(id))
      );
      if (cancelled) return;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          recipeCache.current.set(missingIds[index], result.value);
        }
      });
      setRecipes(
        selectableRecipeIds
          .map((id) => recipeCache.current.get(id))
          .filter((recipe): recipe is Recipe => recipe !== undefined)
      );
      if (results.some((result) => result.status === 'rejected')) {
        setRecipeError('Some saved recipes could not be loaded. Check your connection and retry.');
      }
    };

    loadFavoriteRecipes();
    return () => {
      cancelled = true;
    };
  }, [selectableRecipeIds, favoritesLoaded, recipeRetry]);

  const saveData = async (updated: CookbookData): Promise<boolean> => {
    if (!storageKey || !isLoaded || savingRef.current) return false;
    const previous = dataRef.current;
    savingRef.current = true;
    dataRef.current = updated;
    setData(updated);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to save cookbook:', error);
      dataRef.current = previous;
      setData(previous);
      setErrorMessage('Could not save your cookbook. Please try again.');
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const createCollection = () => {
    const name = collectionName.trim();
    if (!name) {
      setErrorMessage('Enter a name for your collection.');
      return;
    }
    if (dataRef.current.collections.some((collection) => collection.name.toLowerCase() === name.toLowerCase())) {
      setErrorMessage('A collection with that name already exists.');
      return;
    }

    void saveData({
      ...dataRef.current,
      collections: [
        ...dataRef.current.collections,
        { id: `${Date.now()}`, name, recipeIds: [] },
      ],
    }).then((saved) => {
      if (saved) setCollectionName('');
    });
  };

  const toggleCollectionRecipe = (collectionId: string, recipeId: number) => {
    const collections = dataRef.current.collections.map((collection) => {
      if (collection.id !== collectionId) return collection;
      const hasRecipe = collection.recipeIds.includes(recipeId);
      return {
        ...collection,
        recipeIds: hasRecipe
          ? collection.recipeIds.filter((id) => id !== recipeId)
          : [...collection.recipeIds, recipeId],
      };
    });
    void saveData({ ...dataRef.current, collections });
  };

  const togglePlanRecipe = (day: Weekday, recipeId: number) => {
    const currentIds = dataRef.current.weeklyPlan[day];
    const hasRecipe = currentIds.includes(recipeId);
    void saveData({
      ...dataRef.current,
      weeklyPlan: {
        ...dataRef.current.weeklyPlan,
        [day]: hasRecipe
          ? currentIds.filter((id) => id !== recipeId)
          : [...currentIds, recipeId],
      },
    });
  };

  const deleteCollection = (collectionId: string) => {
    const confirm = () => {
      void saveData({
        ...dataRef.current,
        collections: dataRef.current.collections.filter(
          (collection) => collection.id !== collectionId
        ),
      });
    };
    if (Platform.OS === 'web') {
      const web = globalThis as unknown as WebDialogs;
      if (web.confirm?.('Delete this collection?')) confirm();
      return;
    }
    Alert.alert('Delete collection', 'Remove this collection from your cookbook?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: confirm },
    ]);
  };

  const recipeSelector = (
    selectedIds: number[],
    onToggle: (recipeId: number) => void
  ) => {
    if (recipes.length === 0) return null;
    return recipes.map((recipe) => (
      <List.Item
        key={recipe.id}
        title={recipe.name}
        titleStyle={{ color: colors.text }}
        onPress={() => onToggle(recipe.id)}
        right={() => (
          <Checkbox
            status={selectedIds.includes(recipe.id) ? 'checked' : 'unchecked'}
            onPress={() => onToggle(recipe.id)}
            disabled={!isLoaded || isSaving}
          />
        )}
      />
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Cookbook" />
      </Appbar.Header>
      {!isLoaded || !favoritesLoaded ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Collections</Text>
          {favoriteIds.length === 0 && recipes.length === 0 && (
            <Text style={[styles.helper, { color: colors.muted }]}>
              Save recipes to Favorites to add them to collections and meal plans.
            </Text>
          )}
          {recipeError && (
            <View style={styles.recipeError}>
              <Text style={[styles.error, { color: colors.error }]}>{recipeError}</Text>
              <Button mode="outlined" onPress={() => setRecipeRetry((key) => key + 1)}>
                Retry
              </Button>
            </View>
          )}
          <View style={styles.createRow}>
            <TextInput
              mode="outlined"
              label="Collection name"
              value={collectionName}
              onChangeText={setCollectionName}
              style={styles.collectionInput}
              disabled={isSaving}
            />
            <Button mode="contained" onPress={createCollection} disabled={isSaving}>
              Add
            </Button>
          </View>
          {data.collections.length === 0 ? (
            <Text style={[styles.helper, { color: colors.muted }]}>
              Create a collection to organize your favorite recipes.
            </Text>
          ) : (
            data.collections.map((collection) => (
              <Card
                key={collection.id}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <List.Item
                  title={collection.name}
                  titleStyle={{ color: colors.text, fontWeight: '700' }}
                  description={`${collection.recipeIds.length} recipe${collection.recipeIds.length === 1 ? '' : 's'}`}
                  right={() => (
                    <IconButton
                      icon="delete-outline"
                      accessibilityLabel={`Delete ${collection.name}`}
                      onPress={() => deleteCollection(collection.id)}
                      disabled={isSaving}
                    />
                  )}
                />
                {recipeSelector(collection.recipeIds, (recipeId) =>
                  toggleCollectionRecipe(collection.id, recipeId)
                )}
              </Card>
            ))
          )}

          <Text style={[styles.sectionTitle, styles.planTitle, { color: colors.text }]}>
            Weekly Meal Plan
          </Text>
          {WEEKDAYS.map((day) => (
            <Card key={day} style={[styles.card, { backgroundColor: colors.surface }]}>
              <List.Subheader style={{ color: colors.accent }}>{day}</List.Subheader>
              {recipeSelector(data.weeklyPlan[day], (recipeId) =>
                togglePlanRecipe(day, recipeId)
              )}
            </Card>
          ))}
          {errorMessage && <Text style={[styles.error, { color: colors.error }]}>{errorMessage}</Text>}
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  collectionInput: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  helper: {
    marginVertical: 8,
  },
  planTitle: {
    marginTop: 16,
  },
  error: {
    marginVertical: 8,
  },
  recipeError: {
    alignItems: 'flex-start',
    marginVertical: 8,
  },
});
