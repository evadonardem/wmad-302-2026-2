import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags } from '@/services/quoteService';
import type { Quote } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]: Define local state variables for:
  // - 'quote': Stores the current quote object (default: empty object)
  // - 'tags': Stores an array of all available category tags (default: empty array)
  // - 'selectedTag': Tracks the string name of the active filter tag (default: null)
  // [Your code here]
  const [quote, setQuote] = useState<Quote>({
    text: '',
    author: '',
    tags: [],
  });
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // TODO 2 [Reference Hook]: Create a React mutable reference named 'selectTagRef' that tracks
  // the currently selected filter tag value without triggering a re-render when it changes.
  // Initialize it to null (meaning "any" tag). Hint: useRef<string | null>(null)
  // [Your code here]
  const selectTagRef = useRef<string | null>(null);

  const loadRandomQuote = useCallback(async () => {
    // TODO 3 [Async Request Handler]:
    // a. Read the current tag value from 'selectTagRef' (fallback to null if undefined)
    // b. Call 'getRandomQuote(tag)' asynchronously with that value
    // c. Update both your 'quote' state and 'selectedTag' state with the returned values
    // [Your code here]
    const isQuote = (value: unknown): value is Quote =>
      typeof value === 'object' &&
      value !== null &&
      'text' in value &&
      typeof value.text === 'string' &&
      'author' in value &&
      typeof value.author === 'string' &&
      'tags' in value &&
      Array.isArray(value.tags) &&
      value.tags.every((item) => typeof item === 'string');

    const tag = selectTagRef.current ?? null;
    const randomQuote = await getRandomQuote(tag);
    setQuote(isQuote(randomQuote) ? randomQuote : { text: '', author: '', tags: [] });
    setSelectedTag(tag);
  }, []);

  const loadTags = useCallback(async () => {
    // TODO 4 [Async List Population]: Fetch tags asynchronously using 'getTags()' and store them into your tags state array
    // [Your code here]
    const availableTags = await getTags();
    setTags(availableTags ?? []);
  }, []);

  useEffect(() => {
    // TODO 5 [Component Lifecycle]: Execute both 'loadRandomQuote' and 'loadTags' when the component mounts
    // [Your code here]
    void Promise.resolve().then(() => Promise.all([loadRandomQuote(), loadTags()]));
  }, [loadRandomQuote, loadTags]);

  const theme = useTheme();
  // Used by TODO 24 below.
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.overline, { color: theme.colors.textSecondary }]}>
        Quote of the Day
      </Text>

      <View style={styles.tagRow}>
        {/* TODO 6 [Conditional Chip List]: Map through 'quote.tags'. For each tag 't':
            - Render a tag chip <View> with a unique key containing a <Text> label={t}
            - Apply styles.chipActive if 'selectedTag' matches 't', otherwise styles.chipInactive
            - Give the chip styles.chip for spacing */}
        {/* [Your code here] */}
        {quote.tags.map((tag) => (
          <View
            key={tag}
            style={[
              styles.chip,
              selectedTag === tag ? styles.chipActive : styles.chipInactive,
            ]}
          >
            <Text style={styles.chipText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* TODO 7 [Text Content Mapping]: Bind 'quote.text' directly inside the quotation marks below */}
      <Text style={[styles.quoteText, { color: theme.colors.text }]}>
        {/* [Your code here] */}
        {`“${quote.text}”`}
      </Text>

      {/* TODO 8 [Author Content Mapping]: Bind 'quote.author' after the long dash separator symbol */}
      <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
        {/* [Your code here] */}
        — {quote.author}
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.controlsRow}>
        {/* TODO 9 [Reference-Fed Dropdown]: The dropdown selection writes its tag into
            'selectTagRef.current' and 'selectedTag'. The "any" option resets both to null. */}
        {/* [Your code here] */}
        <View style={styles.filterDropdown}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filter quotes by ${selectedTag ?? 'any'}`}
            accessibilityState={{ expanded: isTagDropdownOpen }}
            onPress={() => setIsTagDropdownOpen((open) => !open)}
            style={[
              styles.dropdownTrigger,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.dropdownTriggerText, { color: theme.colors.text }]}>
              {selectedTag ?? 'any'}
            </Text>
            <Ionicons
              name={isTagDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>
          {isTagDropdownOpen && (
            <View
              style={[
                styles.dropdownMenu,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
              ]}
            >
              <ScrollView
                style={styles.dropdownOptions}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {/* TODO 10 [Select Option Generation]: Map through your 'tags' state array to render a
                    dropdown option for each tag, updating both 'selectTagRef' and 'selectedTag'. */}
                {/* [Your code here] */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    selectTagRef.current = null;
                    setSelectedTag(null);
                    setIsTagDropdownOpen(false);
                  }}
                  style={[
                    styles.dropdownOption,
                    selectedTag === null && { backgroundColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.dropdownOptionText, { color: theme.colors.text }]}>any</Text>
                </Pressable>
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    accessibilityRole="button"
                    onPress={() => {
                      selectTagRef.current = tag;
                      setSelectedTag(tag);
                      setIsTagDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      selectedTag === tag && { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <Text style={[styles.dropdownOptionText, { color: theme.colors.text }]}>
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* TODO 11 [Action Trigger Binding]: Attach an 'onPress' listener to trigger 'loadRandomQuote' */}
        {/* [Your code here] */}
        <Pressable
          onPress={() => void loadRandomQuote()}
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="refresh" size={18} color="#ffffff" />
          <Text style={styles.refreshButtonText}>Next Quote</Text>
        </Pressable>

        {/* TODO 24 [Favorite Action]: Render a heart <Pressable style={styles.favoriteButton}> below
            the Next Quote button that:
            - shows Ionicons "heart-outline" (or "heart" when the current quote is already favorited —
              useFavorites() also exposes isFavorite(quote))
            - onPress calls toggleFavorite(quote) to save/remove the current quote
            - then jumps to the Favorites tab with router.navigate('/favorites') */}
        {/* [Your code here] */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            quote.text && isFavorite(quote) ? 'Remove favorite' : 'Add favorite'
          }
          disabled={!quote.text}
          onPress={() => {
            if (!quote.text) return;
            toggleFavorite(quote);
            router.navigate('/favorites');
          }}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={quote.text && isFavorite(quote) ? 'heart' : 'heart-outline'}
            size={22}
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
  filterDropdown: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownTrigger: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  dropdownTriggerText: {
    fontSize: 14,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 2,
    borderWidth: 1,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  dropdownOptions: {
    maxHeight: 220,
  },
  dropdownOption: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  dropdownOptionText: {
    fontSize: 14,
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
