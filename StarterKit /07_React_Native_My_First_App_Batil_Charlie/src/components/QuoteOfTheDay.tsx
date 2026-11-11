
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState({
    text: '',
    author: '',
    tags: [] as string[],
  });
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const selectTagRef = useRef<string | null>(null);

  const loadRandomQuote = async () => {
    const tag = selectTagRef.current ?? null;
    setIsLoading(true);
    try {
      const result = await getRandomQuote(tag, quote.text);
      setQuote(result);
      setSelectedTag(tag);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const [initialQuote, initialTags] = await Promise.all([
          getRandomQuote(),
          getTags(),
        ]);

        if (!cancelled) {
          setQuote(initialQuote);
          setTags(initialTags);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const theme = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();

  const favorite = isFavorite(quote);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.heading}>
        <View style={[styles.iconBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
        </View>
        <Text style={[styles.overline, { color: theme.colors.textSecondary }]}>
          A moment for you
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Quote of the Day</Text>
      </View>

      <View style={styles.tagRow}>
        {quote.tags.map((t, index) => (
          <View
            key={`${t}-${index}`}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedTag === t ? theme.colors.primary : `${theme.colors.primary}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedTag === t ? '#ffffff' : theme.colors.primary },
              ]}
            >
              {t}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.quoteArea}>
        <Text style={[styles.quoteMark, { color: theme.colors.primary }]}>&ldquo;</Text>
        <Text style={[styles.quoteText, { color: theme.colors.text }]}>
          {isLoading && !quote.text ? 'Finding a little inspiration...' : quote.text}
        </Text>
        <Text style={[styles.quoteMark, styles.closingQuote, { color: theme.colors.primary }]}>
          &rdquo;
        </Text>
      </View>

      <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
        {quote.author ? `— ${quote.author}` : ''}
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.controls}>
        <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
          EXPLORE BY MOOD
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedTag === null ? theme.colors.primary : 'transparent',
                borderColor: selectedTag === null ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => {
              selectTagRef.current = null;
              setSelectedTag(null);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedTag === null && { color: '#ffffff' },
              ]}
            >
              any
            </Text>
          </Pressable>

          {tags.map((t, index) => (
            <Pressable
              key={`${t}-${index}`}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedTag === t ? theme.colors.primary : 'transparent',
                  borderColor: selectedTag === t ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => {
                selectTagRef.current = t;
                setSelectedTag(t);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedTag === t ? '#ffffff' : theme.colors.textSecondary },
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show another quote"
          disabled={isLoading}
          style={({ pressed }) => [
            styles.refreshButton,
            { backgroundColor: theme.colors.primary },
            pressed && !isLoading && styles.refreshButtonPressed,
            isLoading && styles.refreshButtonDisabled,
          ]}
          onPress={() => void loadRandomQuote()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="refresh" size={18} color="#ffffff" />
          )}
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Loading...' : 'Next Quote'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove quote from favorites' : 'Save quote to favorites'}
          style={({ pressed }) => [
            styles.favoriteButton,
            { borderColor: theme.colors.border },
            pressed && styles.favoriteButtonPressed,
          ]}
          onPress={() => {
            toggleFavorite(quote);
            router.navigate('/favorites');
          }}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={26}
            color={favorite ? '#e53935' : theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 28,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  heading: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  overline: {
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chip: {
    marginHorizontal: 3,
    marginBottom: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  quoteArea: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  quoteMark: {
    fontSize: 52,
    lineHeight: 54,
    fontWeight: '700',
    height: 34,
  },
  closingQuote: {
    alignSelf: 'flex-end',
  },
  quoteText: {
    fontSize: 23,
    fontStyle: 'italic',
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  author: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: 18,
  },
  controls: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  filterRow: {
    gap: 8,
    alignItems: 'center',
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  refreshButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  favoriteButton: {
    alignSelf: 'center',
    padding: 11,
    borderRadius: 24,
    borderWidth: 1,
  },
  favoriteButtonPressed: {
    opacity: 0.65,
  },
});
