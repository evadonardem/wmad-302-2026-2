/**
 * Recipe Detail Screen - Cookbook (glassmorphism)
 *
 * Route: /recipe/{id}  (file: app/(app)/recipe/[id].tsx)
 * Data:  GET https://dummyjson.com/recipes/{id}
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBackground, GlassCard, GlassIconButton, GLASS } from '@/components/Glass';
import { favoritesStorage } from '@/utils/storage';

interface Recipe {
  id: number;
  name: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing?: number;
  tags?: string[];
  rating: number;
  reviewCount: number;
  mealType?: string[];
}

const BASE_URL = 'https://dummyjson.com';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/recipes/${id}`);
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Recipe not found' : `Request failed (${res.status})`);
        }
        const data = (await res.json()) as Recipe;
        if (!cancelled) setRecipe(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  useEffect(() => {
    favoritesStorage
      .getIds()
      .then((ids) => setIsFavorite(ids.includes(Number(id))))
      .catch(() => {});
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const nowFavorite = await favoritesStorage.toggleId(Number(id));
      setIsFavorite(nowFavorite);
    } catch {
      // Ignore storage errors; the heart just won't change
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  };

  const topBar = (
    <View style={[styles.topBar, { top: insets.top + 8 }]}>
      <GlassIconButton icon="arrow-left" onPress={goBack} label="Go back" />
      {recipe && (
        <GlassIconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          color={isFavorite ? '#C62828' : GLASS.text}
          onPress={toggleFavorite}
          label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <GlassBackground>
        {topBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GLASS.accent} />
        </View>
      </GlassBackground>
    );
  }

  if (error || !recipe) {
    return (
      <GlassBackground>
        {topBar}
        <View style={styles.center}>
          <GlassCard style={styles.messageCard} contentStyle={styles.messageContent}>
            <Text style={styles.messageTitle}>Couldn't load this recipe</Text>
            <Text style={styles.messageText}>{error ?? 'Unknown error'}</Text>
            <Button
              mode="contained"
              onPress={() => setRetryCount((c) => c + 1)}
              style={styles.retry}
            >
              Try again
            </Button>
          </GlassCard>
        </View>
      </GlassBackground>
    );
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <GlassBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'transparent']}
            style={styles.heroShade}
          />
        </View>

        {/* Title card overlaps the hero */}
        <GlassCard style={styles.titleCard} intensity={45}>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.subtitle}>
            ⭐ {recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews) · {recipe.cuisine} ·{' '}
            {recipe.difficulty}
          </Text>
          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tagRow}>
              {recipe.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        {/* Quick stats */}
        <GlassCard style={styles.section} contentStyle={styles.statsRow}>
          <Stat emoji="⏱️" value={`${totalTime} min`} label="Total" />
          <Stat emoji="🔪" value={`${recipe.prepTimeMinutes} min`} label="Prep" />
          <Stat emoji="🍳" value={`${recipe.cookTimeMinutes} min`} label="Cook" />
          <Stat emoji="👥" value={String(recipe.servings)} label="Servings" />
          {recipe.caloriesPerServing != null && (
            <Stat emoji="🔥" value={String(recipe.caloriesPerServing)} label="Cal" />
          )}
        </GlassCard>

        {/* Ingredients */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.ingredientRow}>
              <View style={styles.bullet} />
              <Text style={styles.ingredientText}>{item}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Instructions */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((step, index) => (
            <View key={`${index}`} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>

      {topBar}
    </GlassBackground>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hero: {
    height: 320,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    height: 120,
  },
  titleCard: {
    marginHorizontal: 16,
    marginTop: -56,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: GLASS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: GLASS.textMuted,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  tagText: {
    fontSize: 12,
    color: GLASS.text,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
  },
  stat: {
    alignItems: 'center',
    minWidth: 52,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: GLASS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: GLASS.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GLASS.text,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GLASS.accent,
    marginTop: 7,
    marginRight: 10,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: GLASS.text,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GLASS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: GLASS.text,
  },
  messageCard: {
    width: '100%',
    maxWidth: 420,
  },
  messageContent: {
    alignItems: 'center',
    padding: 24,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GLASS.text,
  },
  messageText: {
    fontSize: 14,
    color: GLASS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
  },
});
