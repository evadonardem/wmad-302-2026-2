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
import { GlassBackground, GlassCard, GlassIconButton } from '@/components/Glass';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { appColors } from '@/constants/theme';

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
  const { isFavorite, isLoaded, toggleFavorite } = useFavorites();
  const { settings } = useSettings();
  const colors = settings.darkModeEnabled ? appColors.dark : appColors.light;
  const styles = createRecipeStyles(colors);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  };

  const topBar = (
    <View style={[styles.topBar, { top: insets.top + 8 }]}>
      <GlassIconButton icon="arrow-left" onPress={goBack} label="Go back" />
      {recipe && isLoaded && (
        <GlassIconButton
          icon={isFavorite(recipe.id) ? 'heart' : 'heart-outline'}
          color={isFavorite(recipe.id) ? colors.error : colors.text}
          onPress={() => toggleFavorite(recipe.id)}
          label={isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <GlassBackground>
        {topBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
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
          <Stat emoji="⏱️" value={`${totalTime} min`} label="Total" colors={colors} />
          <Stat emoji="🔪" value={`${recipe.prepTimeMinutes} min`} label="Prep" colors={colors} />
          <Stat emoji="🍳" value={`${recipe.cookTimeMinutes} min`} label="Cook" colors={colors} />
          <Stat emoji="👥" value={String(recipe.servings)} label="Servings" colors={colors} />
          {recipe.caloriesPerServing != null && (
            <Stat emoji="🔥" value={String(recipe.caloriesPerServing)} label="Cal" colors={colors} />
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

function Stat({
  emoji,
  value,
  label,
  colors,
}: {
  emoji: string;
  value: string;
  label: string;
  colors: typeof appColors.light | typeof appColors.dark;
}) {
  return (
    <View style={{ alignItems: 'center', minWidth: 52 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
    </View>
  );
}

function createRecipeStyles(colors: typeof appColors.light | typeof appColors.dark) {
  return StyleSheet.create({
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
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
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
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
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
    backgroundColor: colors.accent,
    marginTop: 7,
    marginRight: 10,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
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
    backgroundColor: colors.accent,
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
    color: colors.text,
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
    color: colors.text,
  },
  messageText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
  },
  });
}
