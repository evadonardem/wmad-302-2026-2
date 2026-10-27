import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags, Quote } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

// Serif font for the quote text (built-in fonts, no package needed)
const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]
  const [quote, setQuote] = useState<Quote>({ text: '', author: '', tags: [] });
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // TODO 2 [Reference Hook]
  const selectTagRef = useRef<string | null>(null);

  const loadRandomQuote = async () => {
    // TODO 3 [Async Request Handler]
    const tag = selectTagRef.current ?? null;
    const result = await getRandomQuote(tag);
    setQuote(result);
    setSelectedTag(tag);
  };

  const loadTags = async () => {
    // TODO 4 [Async List Population]
    const result = await getTags();
    setTags(result);
  };

  useEffect(() => {
    // TODO 5 [Component Lifecycle]
    Promise.all([loadRandomQuote(), loadTags()]);
  }, []);

  const theme = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Label color that stays readable on top of the accent color in both modes
  const onAccent = theme.mode === 'dark' ? '#1b2735' : '#ffffff';

  // Used by TODOs 9 and 10 (the "any" chip and every tag chip)
  const selectTag = (tag: string | null) => {
    selectTagRef.current = tag; // drives the next fetch
    setSelectedTag(tag);        // updates chip colors
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {/* Decorative quotation mark behind the content */}
      <Text style={[styles.bigQuoteMark, { color: theme.colors.accent }]}>{'\u201C'}</Text>

      <Text style={[styles.overline, { color: theme.colors.textSecondary }]}>
        Quote of the Day
      </Text>
      <View style={[styles.accentBar, { backgroundColor: theme.colors.accent }]} />

      <View style={styles.tagRow}>
        {/* TODO 6 [Conditional Chip List] */}
        {quote.tags?.map((t) => (
          <View
            key={t}
            style={[
              styles.chip,
              selectedTag === t ? styles.chipActive : styles.chipInactive,
              { backgroundColor: selectedTag === t ? theme.colors.accent : theme.colors.border },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedTag === t ? onAccent : theme.colors.text },
              ]}
            >
              {t}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.quoteArea}>
        <ScrollView contentContainerStyle={styles.quoteAreaContent}>
          {/* TODO 7 [Text Content Mapping] */}
          <Text style={[styles.quoteText, { color: theme.colors.text, fontFamily: SERIF }]}>
            {`"${quote.text ?? ''}"`}
          </Text>

          {/* TODO 8 [Author Content Mapping] */}
          <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
            — {quote.author}
          </Text>
        </ScrollView>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.controlsRow}>
        {/* TODO 9 [Reference-Fed Options] */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            style={[
              styles.filterChip,
              { borderColor: theme.colors.border },
              selectedTag === null && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={() => selectTag(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: selectedTag === null ? '#ffffff' : theme.colors.text },
              ]}
            >
              any
            </Text>
          </Pressable>

          {/* TODO 10 [Select Option Generation] */}
          {tags.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.filterChip,
                { borderColor: theme.colors.border },
                selectedTag === t && styles.chipActive,
                selectedTag === t && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              ]}
              onPress={() => selectTag(t)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedTag === t ? '#ffffff' : theme.colors.text },
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* TODO 11 [Action Trigger Binding] */}
        <Pressable
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => loadRandomQuote()}
        >
          <Ionicons name="refresh" size={18} color="#ffffff" />
          <Text style={styles.refreshButtonText}>Next Quote</Text>
        </Pressable>

        {/* TODO 24 [Favorite Action] */}
        <Pressable
          style={styles.favoriteButton}
          onPress={() => {
            toggleFavorite(quote);
            router.navigate('/favorites');
          }}
        >
          <Ionicons
            name={isFavorite(quote) ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite(quote) ? '#e11d48' : theme.colors.primary}
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  bigQuoteMark: {
    position: 'absolute',
    top: -8,
    left: 12,
    fontSize: 120,
    lineHeight: 120,
    opacity: 0.15,
    fontFamily: SERIF,
    pointerEvents: 'none',
  },
  overline: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  accentBar: {
    alignSelf: 'center',
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    height: 64,
    overflow: 'hidden',
    marginBottom: 16,
  },
  chip: {
    marginHorizontal: 3,
    marginBottom: 4,
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
  quoteText: {
    fontSize: 22,
    fontStyle: 'italic',
    lineHeight: 33,
    textAlign: 'center',
    marginBottom: 12,
  },
  author: {
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'right',
    marginBottom: 16,
  },
  quoteArea: {
    height: 200,
    marginBottom: 12,
  },
  quoteAreaContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
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