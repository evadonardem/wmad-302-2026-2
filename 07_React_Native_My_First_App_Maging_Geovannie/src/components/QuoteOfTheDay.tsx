import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRandomQuote, getTags, type Quote } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote>({ text: '', author: '', tags: [] });
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const selectTagRef = useRef<string | null>(null);

  const loadRandomQuote = async (tagValue = selectTagRef.current) => {
    setIsLoading(true);
    try {
      const nextQuote = await getRandomQuote(tagValue ?? null);
      setQuote(nextQuote);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const activeTag = selectTagRef.current ?? null;
      const [quoteResult, tagsResult] = await Promise.allSettled([
        getRandomQuote(activeTag),
        getTags(),
      ]);

      if (!isMounted) {
        return;
      }

      if (quoteResult.status === 'fulfilled') {
        setQuote(quoteResult.value);
        setSelectedTag(activeTag);
      }

      if (tagsResult.status === 'fulfilled') {
        setTags(tagsResult.value);
      } else {
        setCategoryError(
          tagsResult.reason instanceof Error
            ? tagsResult.reason.message
            : String(tagsResult.reason),
        );
      }

      setIsLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const theme = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFavorited = isFavorite(quote);
  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(categorySearch.trim().toLowerCase()),
  );

  const handleTagSelection = (tag: string | null) => {
    selectTagRef.current = tag;
    setSelectedTag(tag);
    setIsCategoriesVisible(false);
    setCategorySearch('');
    void loadRandomQuote(tag);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.heading, { color: theme.colors.textSecondary }]}>
          Quote of the Day
        </Text>

        <View style={styles.tagRow}>
          {quote.tags.map((tag, index) => (
            <View
              key={`${tag}-${index}`}
              style={[
                styles.quoteTag,
                selectedTag === tag ? styles.quoteTagActive : styles.quoteTagInactive,
              ]}
            >
              <Text style={styles.quoteTagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <Text style={[styles.quoteText, { color: theme.colors.text }]}>
              {`"${quote.text}"`}
            </Text>
            <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
              — {quote.author}
            </Text>
          </>
        )}

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.categoriesButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              setIsCategoriesVisible((visible) => !visible);
              setCategorySearch('');
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: isCategoriesVisible }}
          >
            <Text style={[styles.categoriesButtonText, { color: theme.colors.text }]}>
              Categories
            </Text>
            <Ionicons
              name={isCategoriesVisible ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => void loadRandomQuote()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="play-skip-forward" size={18} color="#ffffff" />
            )}
            <Text style={styles.refreshButtonText}>
              {isLoading ? 'Loading...' : 'Next Quote'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.favoriteButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              toggleFavorite(quote);
              router.navigate('/favorites');
            }}
            disabled={isLoading || !quote.text}
            accessibilityRole="button"
            accessibilityLabel={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorited ? '#e53935' : theme.colors.text}
            />
          </Pressable>
        </View>

        {isCategoriesVisible && (
          <View
            style={[
              styles.categoriesPanel,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.searchInputContainer, { borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholder="Search categories"
                placeholderTextColor={theme.colors.textSecondary}
                accessibilityLabel="Search categories"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {categorySearch.length > 0 && (
                <Pressable
                  onPress={() => setCategorySearch('')}
                  accessibilityLabel="Clear category search"
                >
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {categoryError ? (
              <Text style={[styles.messageText, { color: theme.colors.textSecondary }]}>
                {categoryError}
              </Text>
            ) : (
              <ScrollView
                style={styles.categoriesList}
                contentContainerStyle={styles.categoryOptions}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                <Pressable
                  style={[
                    styles.filterChip,
                    {
                      borderColor:
                        selectedTag === null ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleTagSelection(null)}
                  disabled={isLoading}
                >
                  <Text style={[styles.filterChipText, { color: theme.colors.text }]}>any</Text>
                </Pressable>

                {filteredTags.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[
                      styles.filterChip,
                      {
                        borderColor:
                          selectedTag === tag ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleTagSelection(tag)}
                    disabled={isLoading}
                  >
                    <Text style={[styles.filterChipText, { color: theme.colors.text }]}>
                      {tag}
                    </Text>
                  </Pressable>
                ))}

                {filteredTags.length === 0 && (
                  <Text style={[styles.messageText, { color: theme.colors.textSecondary }]}>
                    No matching categories
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: 500,
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quoteTag: {
    marginHorizontal: 2,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  quoteTagActive: {
    backgroundColor: '#2e7d32',
  },
  quoteTagInactive: {
    backgroundColor: '#7b1fa2',
  },
  quoteTagText: {
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
  loadingContainer: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  categoriesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 10,
  },
  categoriesButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  favoriteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoriesPanel: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  categoriesList: {
    maxHeight: 160,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  messageText: {
    fontSize: 13,
    paddingVertical: 6,
  },
});
