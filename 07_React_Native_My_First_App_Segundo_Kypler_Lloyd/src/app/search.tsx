import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getAuthorProfile,
  getAuthors,
  getQuotesByAuthor,
  type AuthorProfile,
  type Quote,
} from '@/services/quoteService';
import { getCultivationTitle, type Honor } from '@/services/cultivation';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

export default function SearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { toggleFavorite, isFavorite } = useFavorites();
  // Set when you tap the author name on the Home quote card.
  const { author } = useLocalSearchParams<{ author?: string }>();

  const [query, setQuery] = useState('');
  const [authors, setAuthors] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [honor, setHonor] = useState<Honor | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  // Load every author name once so we can suggest matches while typing.
  useEffect(() => {
    getAuthors().then(setAuthors);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const suggestions =
    trimmed.length > 0 && query !== selected
      ? authors.filter((a) => a.toLowerCase().includes(trimmed)).slice(0, 8)
      : [];

  const selectAuthor = async (name: string) => {
    setSelected(name);
    setQuery(name);
    setHonor(null);
    setLoading(true);
    const [authorProfile, authorQuotes] = await Promise.all([
      getAuthorProfile(name),
      getQuotesByAuthor(name),
    ]);
    setProfile(authorProfile);
    setQuotes(authorQuotes);
    setLoading(false);
    // The honorific loads after the card is shown, so it never delays the quotes.
    getCultivationTitle(name, authorProfile).then(setHonor);
  };

  // Open the profile straight away when we arrive from the Home quote card.
  useEffect(() => {
    if (author) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      selectAuthor(author);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author]);

  // No fame data exists in the quote API, so the first quote returned is shown as the featured one.
  const featured = quotes[0];
  const currentHonor = honor && honor.name === selected ? honor : null;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Seek a Sage</Text>
      </View>

      {/* Search box */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text !== selected) setSelected(null);
          }}
          placeholder="Search an author, e.g. Albert Einstein"
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.input, { color: theme.colors.text }]}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              setSelected(null);
              setProfile(null);
              setHonor(null);
              setQuotes([]);
            }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionBox,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {suggestions.map((name) => (
            <Pressable
              key={name}
              style={styles.suggestionRow}
              onPress={() => selectAuthor(name)}
            >
              <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {trimmed.length > 0 && suggestions.length === 0 && !selected && authors.length > 0 && (
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          No author found for that name.
        </Text>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primary} />}

      {/* Author profile card */}
      {!loading && selected && (
        <>
          <View
            style={[
              styles.profileCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
            ]}
          >
            <View style={styles.profileTop}>
              {profile?.image ? (
                <Image
                  source={{ uri: profile.image }}
                  style={[styles.avatar, { borderColor: theme.colors.accent }]}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarFallback,
                    { borderColor: theme.colors.accent, backgroundColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.avatarInitial, { color: theme.colors.text }]}>
                    {selected.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                {/* Murim title: rank from fame, prefix from age */}
                <Text style={[styles.authorName, { color: theme.colors.text }]}>
                  {currentHonor ? `${currentHonor.title} ` : ''}
                  {profile?.name ?? selected}
                </Text>
                {!!profile?.description && (
                  <Text style={[styles.authorRole, { color: theme.colors.accent }]}>
                    {profile.description}
                  </Text>
                )}
              </View>
            </View>

            {!!profile?.extract && (
              <Text
                numberOfLines={5}
                style={[styles.extract, { color: theme.colors.textSecondary }]}
              >
                {profile.extract}
              </Text>
            )}

            {featured && (
              <View style={[styles.featured, { borderColor: theme.colors.border }]}>
                <Text style={[styles.featuredLabel, { color: theme.colors.accent }]}>
                  ◆  Featured Quote  ◆
                </Text>
                <Text style={[styles.featuredText, { color: theme.colors.text }]}>
                  {`"${featured.text}"`}
                </Text>
              </View>
            )}
          </View>

          {/* All quotes by this author */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quotes by {currentHonor ? `${currentHonor.title} ` : ''}{profile?.name ?? selected} ({quotes.length})
          </Text>

          {quotes.length === 0 && (
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Could not load quotes for this author.
            </Text>
          )}

          {quotes.map((q) => (
            <View
              key={q.text}
              style={[
                styles.quoteRow,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.quoteText, { color: theme.colors.text }]}>
                {`"${q.text}"`}
              </Text>
              <Pressable onPress={() => toggleFavorite(q)} style={styles.heartButton}>
                <Ionicons
                  name={isFavorite(q) ? 'heart' : 'heart-outline'}
                  size={22}
                  color="#c0392b"
                />
              </Pressable>
            </View>
          ))}
        </>
      )}

      {!selected && !loading && (
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Type a name and pick an author to see their portrait, a short biography, and all of
          their quotes.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    padding: 6,
  },
  heading: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: SERIF,
    fontSize: 15,
  },
  suggestionBox: {
    borderWidth: 1,
    borderRadius: 4,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    fontFamily: SERIF,
    fontSize: 15,
  },
  hint: {
    fontFamily: SERIF,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    gap: 12,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: SERIF,
    fontSize: 34,
    fontWeight: '700',
  },
  authorName: {
    fontFamily: SERIF,
    fontSize: 20,
    fontWeight: '700',
  },
  authorRole: {
    fontFamily: SERIF,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  extract: {
    fontFamily: SERIF,
    fontSize: 14,
    lineHeight: 21,
  },
  featured: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  featuredLabel: {
    fontFamily: SERIF,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  featuredText: {
    fontFamily: SERIF,
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
  },
  quoteText: {
    flex: 1,
    fontFamily: SERIF,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 23,
  },
  heartButton: {
    padding: 6,
  },
});