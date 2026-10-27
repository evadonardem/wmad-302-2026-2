import { useEffect, useRef, useState } from 'react';
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

  const loadRandomQuote = async () => {
    const activeTag = selectTagRef.current ?? null;
    const nextQuote = await getRandomQuote(activeTag);
    setQuote(nextQuote);
    setSelectedTag(activeTag);
  };

  const loadTags = async () => {
    const nextTags = await getTags();
    setTags(nextTags);
  };

  useEffect(() => {
    void (async () => {
      await loadRandomQuote();
      await loadTags();
    })();
  }, []);

  const theme = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isCurrentFavorite = quote.text ? isFavorite(quote) : false;

  const handleTagSelection = (tag: string | null) => {
    selectTagRef.current = tag;
    setSelectedTag(tag);
    void loadRandomQuote();
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.overline, { color: theme.colors.textSecondary }]}>Quote of the Day</Text>

      <View style={styles.tagRow}>
        {(quote.tags ?? []).map((t) => (
          <View
            key={`${quote.text}-${t}`}
            style={[styles.chip, selectedTag === t ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.quoteText, { color: theme.colors.text }]}>{`"${quote.text ?? ''}"`}</Text>

      <Text style={[styles.author, { color: theme.colors.textSecondary }]}>{`— ${quote.author ?? ''}`}</Text>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.controlsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            style={[styles.filterChip, selectedTag === null && styles.filterChipActive]}
            onPress={() => handleTagSelection(null)}
          >
            <Text style={[styles.filterChipText, selectedTag === null && styles.filterChipTextActive]}>any</Text>
          </Pressable>

          {tags.map((t) => (
            <Pressable
              key={t}
              style={[styles.filterChip, selectedTag === t && styles.filterChipActive]}
              onPress={() => handleTagSelection(t)}
            >
              <Text style={[styles.filterChipText, selectedTag === t && styles.filterChipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => void loadRandomQuote()}
        >
          <Ionicons name="refresh" size={18} color="#ffffff" />
          <Text style={styles.refreshButtonText}>Next Quote</Text>
        </Pressable>

        <Pressable
          style={styles.favoriteButton}
          onPress={() => {
            if (!quote.text) return;
            toggleFavorite(quote);
            router.navigate('/favorites');
          }}
        >
          <Ionicons
            name={isCurrentFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={theme.colors.primary}
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
  filterChipActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  filterChipText: {
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#ffffff',
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