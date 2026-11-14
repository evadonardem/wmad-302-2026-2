/**
 * Cooking mode screen - route: /cook/{id}
 * Loads the recipe and shows it step by step (see components/CookingMode).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CookingMode } from '@/components/CookingMode';
import { ErrorState, LoadingState } from '@/components/CommonComponents';
import { recipeApi } from '@/services/recipeApi';
import type { Recipe } from '@/types/recipe';

export default function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const recipeId = Number(id);
    if (!Number.isInteger(recipeId)) {
      setError('Recipe not found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRecipe(await recipeApi.getRecipeById(recipeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  };

  if (loading) return <LoadingState message="Getting your recipe ready..." />;
  if (error || !recipe) return <ErrorState message={error ?? 'Recipe not found'} onRetry={load} />;

  return <CookingMode recipe={recipe} onExit={exit} bottomInset={insets.bottom} />;
}
