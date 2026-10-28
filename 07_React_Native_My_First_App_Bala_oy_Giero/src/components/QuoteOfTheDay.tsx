import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

// Monospace font stack for the terminal / cyberpunk feel (no extra install needed).
const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: '"Courier New", Courier, monospace',
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

  // Text color that stays readable on top of the primary color (neon cyan in dark, teal in light).
  const onPrimary = theme.mode === 'dark' ? '#02121a' : '#ffffff';

  return (
    // Frame: thin neon border with a soft glow and bracket corners
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.primary,
        },
      ]}
    >
      {/* HUD brackets on the four corners */}
      <View style={[styles.bracket, styles.bracketTL, { borderColor: theme.colors.accent }]} />
      <View style={[styles.bracket, styles.bracketTR, { borderColor: theme.colors.accent }]} />
      <View style={[styles.bracket, styles.bracketBL, { borderColor: theme.colors.accent }]} />
      <View style={[styles.bracket, styles.bracketBR, { borderColor: theme.colors.accent }]} />

      <Text style={[styles.overline, { color: theme.colors.primary }]}>
        {'//'} Quote of the Day {'//'}
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
            <Text style={styles.chipText}>#{t}</Text>
          </View>
        ))}
      </View>

      {/* Divider above the quote */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.primary }]} />
        <Text style={[styles.dividerGlyph, { color: theme.colors.accent }]}>{'//'}</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
      </View>

      {/* TODO 7 [Text Content Mapping]: Bind 'quote.text' directly inside the quotation marks below */}
      <Text style={[styles.quoteText, { color: theme.colors.text }]}>
        {`"${quote.text ?? ''}"`}
      </Text>

      {/* TODO 8 [Author Content Mapping]: Bind 'quote.author' after the long dash separator symbol */}
      <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
        — {quote.author}
      </Text>

      {/* Divider below the author */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dividerGlyph, { color: theme.colors.accent }]}>{'//'}</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.primary }]} />
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
            color="#ff2a8f"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Neon frame with a glow (the glow shows on iOS and web; Android shows the border only)
  card: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 2,
    borderWidth: 1,
    padding: 22,
    elevation: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  // L-shaped HUD corner brackets
  bracket: {
    position: 'absolute',
    width: 18,
    height: 18,
  },
  bracketTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  bracketTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  bracketBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  bracketBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  overline: {
    fontFamily: MONO,
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
  // Tag chips: neon labels, dark text
  chip: {
    marginRight: 4,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  chipActive: {
    backgroundColor: '#00e5f0',
  },
  chipInactive: {
    backgroundColor: '#ff2a8f',
  },
  chipText: {
    color: '#07070f',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerGlyph: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
  },
  quoteText: {
    fontFamily: MONO,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    marginVertical: 8,
  },
  author: {
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'right',
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
    borderRadius: 2,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  favoriteButton: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 24,
  },
});