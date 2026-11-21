import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Backdrop from '@/components/Backdrop';
import Hoverable from '../../components/Hoverable';
import Reveal from '@/components/Reveal';
import { useFavorites } from '@/favorites';
import { usePalette } from '@/palette';
import { useTheme } from '@/theme';

export default function FavoritesScreen() {
  const theme = useTheme();
  const { palette } = usePalette();
  const { favorites, removeFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(float, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter((f) => f.text.toLowerCase().includes(q) || f.author.toLowerCase().includes(q));
  }, [favorites, query]);

  const share = async (text: string, author: string) => {
    try {
      await Share.share({ message: `“${text}” — ${author}` });
    } catch {}
  };

  return (
    <Backdrop>
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
        <View style={styles.headingRow}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>Favorites</Text>
          {favorites.length > 0 && (
            <LinearGradient colors={palette.gradient} style={styles.badge}>
              <Text style={styles.badgeText}>{favorites.length}</Text>
            </LinearGradient>
          )}
        </View>

        {/* TODO 23: empty state OR mapped list */}
        {favorites.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Animated.View
              style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }] }}
            >
              <LinearGradient colors={palette.gradient} style={styles.emptyIcon}>
                <Ionicons name="heart" size={44} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Nothing saved yet</Text>
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
              Tap the heart on a quote and it will show up here.
            </Text>
            <Hoverable
              onPress={() => router.navigate('/')}
              style={{ borderRadius: 24, marginTop: 8 }}
              scale={1.1}
              lift={4}
              glow={palette.main + '88'}
            >
              {(h) => (
                <LinearGradient colors={palette.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                  <Animated.View style={{ transform: [{ rotate: h.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
                    <Ionicons name="sparkles" size={16} color="#fff" />
                  </Animated.View>
                  <Text style={styles.ctaText}>Find a quote</Text>
                </LinearGradient>
              )}
            </Hoverable>
          </View>
        ) : (
          <>
            <View style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search quotes or authors"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.text }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
              />
              {query.length > 0 && (
                <Hoverable onPress={() => setQuery('')} hitSlop={8} scale={1.25} lift={0} tilt={90} style={{ borderRadius: 12 }}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </Hoverable>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {visible.length === 0 && (
                <Text style={[styles.empty, { color: theme.colors.textSecondary, alignSelf: 'center', marginTop: 40 }]}>
                  No saved quote matches “{query}”.
                </Text>
              )}
              {visible.map((quote, i) => (
                <Reveal key={quote.text} delay={Math.min(i, 6) * 70}>
                  <Hoverable
                    style={[styles.row, { backgroundColor: theme.colors.surface }]}
                    scale={1.02}
                    lift={4}
                    pressScale={1}
                    glow={palette.main + '40'}
                  >
                    {(h) => (
                      <>
                        <Animated.View style={{ alignSelf: 'stretch', transform: [{ scaleX: h.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }] }}>
                          <LinearGradient colors={palette.gradient} style={styles.bar} />
                        </Animated.View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.rowText, { color: theme.colors.text }]}>“{quote.text}”</Text>
                          <Text style={[styles.rowAuthor, { color: palette.main }]}>— {quote.author}</Text>
                        </View>
                        <View style={styles.rowActions}>
                          <Hoverable
                            onPress={() => share(quote.text, quote.author)}
                            hitSlop={8}
                            accessibilityLabel="Share quote"
                            style={styles.iconBtn}
                            scale={1.25}
                            lift={3}
                            tilt={-12}
                            hoverBg={palette.main + '26'}
                          >
                            <Ionicons name="share-outline" size={20} color={theme.colors.textSecondary} />
                          </Hoverable>
                          <Hoverable
                            onPress={() => removeFavorite(quote)}
                            hitSlop={8}
                            accessibilityLabel="Remove from favorites"
                            style={styles.iconBtn}
                            scale={1.25}
                            lift={3}
                            tilt={14}
                            hoverBg="rgba(229,57,53,0.16)"
                          >
                            <Ionicons name="trash-outline" size={20} color="#e53935" />
                          </Hoverable>
                        </View>
                      </>
                    )}
                  </Hoverable>
                </Reveal>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, gap: 14 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  badge: { minWidth: 30, height: 30, paddingHorizontal: 9, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, height: 48, borderRadius: 24, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  list: { gap: 12, paddingBottom: 130, paddingHorizontal: 8, paddingTop: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 120 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  empty: { fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, height: 48, borderRadius: 24 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  bar: { width: 5, alignSelf: 'stretch', borderRadius: 3 },
  rowText: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  rowAuthor: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  rowActions: { gap: 6 },
  iconBtn: { padding: 6, borderRadius: 14 },
});