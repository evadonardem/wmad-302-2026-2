import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags, type Quote } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote>({ text: '', author: '', tags: [] });
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const selectTagRef = useRef<string | null>(null);

  const loadRandomQuote = useCallback(async () => {
    const nextQuote = await getRandomQuote(selectTagRef.current ?? null);
    setQuote(nextQuote);
    setSelectedTag(selectTagRef.current ?? null);
  }, []);

  useEffect(() => {
    void Promise.all([getRandomQuote(selectTagRef.current), getTags()])
      .then(([initialQuote, availableTags]) => {
        setQuote(initialQuote);
        setTags(availableTags);
        setSelectedTag(selectTagRef.current ?? null);
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize quote data:', error);
      });
  }, []);

  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(quote);
  const accentTextColor = theme.mode === 'dark' ? theme.colors.background : '#ffffff';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.overline, { color: theme.colors.textSecondary }]}>
        Quote of the Day
      </Text>

      {quote.isOffline && (
        <Text
          accessibilityRole="alert"
          style={[
            styles.offlineNotice,
            {
              backgroundColor: theme.mode === 'dark' ? '#3b3020' : '#fff3cd',
              color: theme.mode === 'dark' ? '#ffda8a' : '#664d03',
            },
          ]}
        >
          Hey! The quote API is offline, so we&apos;re using the offline generator for now.
        </Text>
      )}

      <View style={styles.tagRow}>
        {quote.tags.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <View
              key={tag}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.colors.accent : theme.colors.primary,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: accentTextColor }]}>{tag}</Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.quoteText, { color: theme.colors.text }]}>
        {quote.text ? `“${quote.text}”` : ''}
      </Text>

      <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
        {quote.author ? `— ${quote.author}` : ''}
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.controlsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selectedTag === null }}
            onPress={() => {
              selectTagRef.current = null;
              setSelectedTag(null);
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedTag === null ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: selectedTag === null ? accentTextColor : theme.colors.text,
                },
              ]}
            >
              any
            </Text>
          </Pressable>
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <Pressable
                key={tag}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  selectTagRef.current = tag;
                  setSelectedTag(tag);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                      styles.filterChipText,
                      {
                        color: isSelected ? accentTextColor : theme.colors.text,
                      },
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => void loadRandomQuote()}
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons
            name="refresh"
            size={18}
            color={accentTextColor}
          />
          <Text
            style={[
              styles.refreshButtonText,
              { color: accentTextColor },
            ]}
          >
            Next Quote
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove quote from favorites' : 'Add quote to favorites'}
          accessibilityState={{ selected: favorite, disabled: !quote.text }}
          disabled={!quote.text}
          onPress={() => {
            toggleFavorite(quote);
            router.navigate('/favorites');
          }}
          style={[
            styles.favoriteButton,
            { backgroundColor: theme.colors.surface, opacity: quote.text ? 1 : 0.5 },
          ]}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
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
  offlineNotice: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
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
