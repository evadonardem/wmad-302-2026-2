import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags, type Quote } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]
  const [quote, setQuote] = useState<Partial<Quote>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // TODO 2 [Reference Hook]
  const selectTagRef = useRef<string | null>(null);

  const theme = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();

  const loadRandomQuote = async () => {
    // TODO 3 [Async Request Handler]
    const currentTag = selectTagRef.current ?? null;
    const data = await getRandomQuote(currentTag);
    if (data) {
      setQuote(data);
      // Fallback logic if the service doesn't return the matching tag context explicitly
      setSelectedTag(currentTag);
    }
  };

  const loadTags = async () => {
    // TODO 4 [Async List Population]
    const data = await getTags();
    if (data) {
      setTags(data);
    }
  };

  useEffect(() => {
    // TODO 5 [Component Lifecycle]
    loadRandomQuote();
    loadTags();
  }, []);

  // Check if current quote is actively inside favorites global context
  const favorited = quote.text ? isFavorite(quote as Quote) : false;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.overline, { color: theme.colors.textSecondary }]}>
        Quote of the Day
      </Text>

      <View style={styles.tagRow}>
        {/* TODO 6 [Conditional Chip List] */}
        {quote.tags?.map((t) => {
          const isActive = selectedTag === t;
          return (
            <View
              key={t}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text style={styles.chipText}>{t}</Text>
            </View>
          );
        })}
      </View>

      {/* TODO 7 [Text Content Mapping] */}
      <Text style={[styles.quoteText, { color: theme.colors.text }]}>
        {quote.text ? `"${quote.text}"` : '""'}
      </Text>

      {/* TODO 8 [Author Content Mapping] */}
      <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
        — {quote.author || 'Unknown'}
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.controlsRow}>
        {/* TODO 9 [Reference-Fed Options] */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {/* Base option: filtering by any tag. Wire its onPress so it clears the selection. */}
          <Pressable
            style={[
              styles.filterChip,
              selectedTag === null && { backgroundColor: theme.colors.border },
            ]}
            onPress={() => {
              selectTagRef.current = null;
              setSelectedTag(null);
            }}
          >
            <Text style={[styles.filterChipText, { color: theme.colors.text }]}>any</Text>
          </Pressable>

          {/* TODO 10 [Select Option Generation] */}
          {tags.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.filterChip,
                selectedTag === t && { backgroundColor: theme.colors.border },
              ]}
              onPress={() => {
                selectTagRef.current = t;
                setSelectedTag(t);
              }}
            >
              <Text style={[styles.filterChipText, { color: theme.colors.text }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* TODO 11 [Action Trigger Binding] */}
        <Pressable
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadRandomQuote}
        >
          <Ionicons name="refresh" size={18} color="#ffffff" />
          <Text style={styles.refreshButtonText}>Next Quote</Text>
        </Pressable>

        {/* TODO 24 [Favorite Action] */}
        {quote.text && (
          <Pressable
            style={styles.favoriteButton}
            onPress={() => {
              toggleFavorite(quote as Quote);
              router.navigate('/favorites');
            }}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={28}
              color={favorited ? '#e91e63' : theme.colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  overline: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: '#2e7d32',
  },
  chipInactive: {
    backgroundColor: '#7b1fa2',
  },
  chipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  quoteText: {
    fontSize: 20,
    fontStyle: 'italic',
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 12,
  },
  author: {
    fontSize: 15,
    textAlign: 'right',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  controlsRow: {
    gap: 12,
  },
  filterRow: {
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  filterChipText: {
    fontSize: 13,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  favoriteButton: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 24,
  },
});

