import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags } from '@/services/quoteService';
import { getCultivationTitle, type Honor } from '@/services/cultivation';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

// Serif font stack for the scroll / calligraphy feel (no extra install needed).
const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]: Define local state variables for:
  // - 'quote': Stores the current quote object (default: empty object)
  // - 'tags': Stores an array of all available category tags (default: empty array)
  // - 'selectedTag': Tracks the string name of the active filter tag (default: null)
  const [quote, setQuote] = useState<any>({});
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // TODO 2 [Reference Hook]: Create a React mutable reference named 'selectTagRef' that tracks
  // the currently selected filter tag value without triggering a re-render when it changes.
  // Initialize it to null (meaning "any" tag). Hint: useRef<string | null>(null)
  const selectTagRef = useRef<string | null>(null);

  const loadRandomQuote = async () => {
    // TODO 3 [Async Request Handler]:
    // a. Read the current tag value from 'selectTagRef' (fallback to null if undefined)
    // b. Call 'getRandomQuote(tag)' asynchronously with that value
    // c. Update both your 'quote' state and 'selectedTag' state with the returned values
    const tag = selectTagRef.current ?? null;
    const result = await getRandomQuote(tag);
    setQuote(result);
    setSelectedTag(tag);
  };

  const loadTags = async () => {
    // TODO 4 [Async List Population]: Fetch tags asynchronously using 'getTags()' and store them into your tags state array
    const result = await getTags();
    setTags(result);
  };

  useEffect(() => {
    // TODO 5 [Component Lifecycle]: Execute both 'loadRandomQuote' and 'loadTags' when the component mounts
    loadRandomQuote();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTags();
  }, []);

  const theme = useTheme();
  // Used by TODO 24 below.
  const { toggleFavorite, isFavorite } = useFavorites();

  // Murim honorific of the current quote's author (rank from fame, prefix from age).
  const [honor, setHonor] = useState<Honor | null>(null);
  useEffect(() => {
    let active = true;
    if (!quote.author || quote.author === 'Quote Generator') return;
    getCultivationTitle(quote.author).then((result) => {
      if (active) setHonor(result);
    });
    return () => {
      active = false;
    };
  }, [quote.author]);

  // Text color that stays readable on top of the primary color (jade in light, gold in dark).
  const onPrimary = theme.mode === 'dark' ? '#1a1305' : '#f8f1e0';

  return (
    // Outer frame: the scroll border
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {/* Inner frame: thin gold/jade line with ornaments on the corners */}
      <View style={[styles.innerFrame, { borderColor: theme.colors.primary }]}>
        <Text
          style={[styles.corner, styles.cornerTL, { color: theme.colors.accent, backgroundColor: theme.colors.surface }]}
        >
          ◆
        </Text>
        <Text
          style={[styles.corner, styles.cornerTR, { color: theme.colors.accent, backgroundColor: theme.colors.surface }]}
        >
          ◆
        </Text>
        <Text
          style={[styles.corner, styles.cornerBL, { color: theme.colors.accent, backgroundColor: theme.colors.surface }]}
        >
          ◆
        </Text>
        <Text
          style={[styles.corner, styles.cornerBR, { color: theme.colors.accent, backgroundColor: theme.colors.surface }]}
        >
          ◆
        </Text>

        <Text style={[styles.overline, { color: theme.colors.accent }]}>
          ❖  Quote of the Day  ❖
        </Text>

        <View style={styles.tagRow}>
          {/* TODO 6 [Conditional Chip List]: Map through 'quote.tags'. For each tag 't':
              - Render a tag chip <View> with a unique key containing a <Text> label={t}
              - Apply styles.chipActive if 'selectedTag' matches 't', otherwise styles.chipInactive
              - Give the chip styles.chip for spacing */}
          {(quote.tags ?? []).map((t: string) => (
            <View
              key={t}
              style={[
                styles.chip,
                selectedTag === t ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text style={styles.chipText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Ornament divider above the quote */}
        <View style={styles.ornamentRow}>
          <View style={[styles.ornamentLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.ornamentGlyph, { color: theme.colors.accent }]}>◆</Text>
          <View style={[styles.ornamentLine, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* TODO 7 [Text Content Mapping]: Bind 'quote.text' directly inside the quotation marks below */}
        <Text style={[styles.quoteText, { color: theme.colors.text }]}>
          {`"${quote.text ?? ''}"`}
        </Text>

        {/* TODO 8 [Author Content Mapping]: Bind 'quote.author' after the long dash separator symbol */}
        {/* Tapping the author opens their profile on the search screen */}
        <Pressable
          disabled={!quote.author || quote.author === 'Quote Generator'}
          onPress={() => router.push({ pathname: '/search', params: { author: quote.author } })}
        >
          <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
            — {quote.author}
          </Text>

          {/* Murim honorific under the author name */}
          {honor && honor.name === quote.author && (
            <Text style={[styles.honor, { color: theme.colors.accent }]}>
              {honor.title}
            </Text>
          )}
        </Pressable>

        {/* Ornament divider below the author */}
        <View style={styles.ornamentRow}>
          <View style={[styles.ornamentLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.ornamentGlyph, { color: theme.colors.accent }]}>◆</Text>
          <View style={[styles.ornamentLine, { backgroundColor: theme.colors.border }]} />
        </View>

        <View style={styles.controlsRow}>
          {/* TODO 9 [Reference-Fed Options]: No dropdown exists in React Native — instead, every
              filter chip you render below must write the tapped tag into 'selectTagRef.current'
              (and into your 'selectedTag' state so the colors update) inside its onPress handler.
              The "any" chip resets both to null. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {/* Base option: filtering by any tag. Wire its onPress so it clears the selection. */}
            <Pressable
              style={[
                styles.filterChip,
                { borderColor: theme.colors.border },
                selectedTag === null && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
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
                  { color: selectedTag === null ? onPrimary : theme.colors.text },
                ]}
              >
                any
              </Text>
            </Pressable>
            {/* TODO 10 [Select Option Generation]: Map through your 'tags' state array to render a
                filter chip <Pressable> for each tag 't', with label={t} and an onPress handler
                that updates both 'selectTagRef' and 'selectedTag' (see TODO 9). */}
            {tags.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.filterChip,
                  { borderColor: theme.colors.border },
                  selectedTag === t && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
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
                    { color: selectedTag === t ? onPrimary : theme.colors.text },
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* TODO 11 [Action Trigger Binding]: Attach an 'onPress' listener to trigger 'loadRandomQuote' */}
          <Pressable
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.primary, borderColor: theme.colors.accent },
            ]}
            onPress={loadRandomQuote}
          >
            <Ionicons name="refresh" size={18} color={onPrimary} />
            <Text style={[styles.refreshButtonText, { color: onPrimary }]}>Next Quote</Text>
          </Pressable>

          {/* Opens the author search screen (src/app/search.tsx) */}
          <Pressable
            style={[styles.searchButton, { borderColor: theme.colors.border }]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={16} color={theme.colors.text} />
            <Text style={[styles.searchButtonText, { color: theme.colors.text }]}>Search by Author</Text>
          </Pressable>

          {/* TODO 24 [Favorite Action]: Render a heart <Pressable style={styles.favoriteButton}> below
              the Next Quote button that:
              - shows Ionicons "heart-outline" (or "heart" when the current quote is already favorited —
                useFavorites() also exposes isFavorite(quote))
              - onPress calls toggleFavorite(quote) to save/remove the current quote
              - then jumps to the Favorites tab with router.navigate('/favorites') */}
          <Pressable
            style={styles.favoriteButton}
            onPress={() => {
              toggleFavorite(quote);
              router.navigate('/favorites');
            }}
          >
            <Ionicons
              name={isFavorite(quote) ? 'heart' : 'heart-outline'}
              size={28}
              color="#c0392b"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outer scroll border
  card: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 6,
    borderWidth: 2,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  // Inner thin frame
  innerFrame: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  corner: {
    position: 'absolute',
    fontSize: 12,
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  cornerTL: { top: -8, left: -7 },
  cornerTR: { top: -8, right: -7 },
  cornerBL: { bottom: -8, left: -7 },
  cornerBR: { bottom: -8, right: -7 },
  overline: {
    fontFamily: SERIF,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  // Tag chips look like small seal stamps
  chip: {
    marginRight: 4,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },
  chipActive: {
    backgroundColor: '#2e6b4f',
  },
  chipInactive: {
    backgroundColor: '#8f2a2a',
  },
  chipText: {
    color: '#f8f1e0',
    fontFamily: SERIF,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
  },
  ornamentGlyph: {
    fontSize: 10,
  },
  quoteText: {
    fontFamily: SERIF,
    fontSize: 21,
    fontStyle: 'italic',
    lineHeight: 33,
    textAlign: 'center',
    marginVertical: 8,
  },
  author: {
    fontFamily: SERIF,
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'right',
    marginBottom: 2,
  },
  honor: {
    fontFamily: SERIF,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'right',
    textTransform: 'uppercase',
    marginBottom: 4,
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
    borderRadius: 3,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: SERIF,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontFamily: SERIF,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  searchButtonText: {
    fontFamily: SERIF,
    fontSize: 13,
    letterSpacing: 1,
  },
  favoriteButton: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 24,
  },
});