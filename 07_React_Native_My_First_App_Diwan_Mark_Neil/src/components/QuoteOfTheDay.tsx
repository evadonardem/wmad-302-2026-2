import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getRandomQuote, getTags, type Quote } from '@/services/quoteService';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';
import { usePalette } from '@/palette';
import Hoverable from './Hoverable';
import Skeleton from '@/components/Skeleton';

const native = Platform.OS !== 'web';
const BURST = [0, 60, 120, 180, 240, 300];

// Mouse wheel + click-and-drag horizontal scrolling for web (touch is unaffected)
function useDesktopHScroll() {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = (ref.current as any)?.getScrollableNode?.() as HTMLElement | undefined;
    if (!node) return;

    // mouse wheel -> horizontal scroll
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const max = node.scrollWidth - node.clientWidth;
      const next = Math.max(0, Math.min(max, node.scrollLeft + delta));
      if (next !== node.scrollLeft) {
        e.preventDefault();
        node.scrollLeft = next;
      }
    };

    // click and drag to scroll
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e: MouseEvent) => {
      down = true;
      moved = false;
      startX = e.pageX;
      startLeft = node.scrollLeft;
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      if (moved) node.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
    };
    // don't fire a chip press when the user was dragging
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('mousedown', onDown);
    node.addEventListener('click', onClickCapture, true);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    node.style.cursor = 'grab';
    node.style.userSelect = 'none';

    return () => {
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('mousedown', onDown);
      node.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return ref;
}

export default function QuoteOfTheDay() {
  // TODO 1: state
  const [quote, setQuote] = useState<Partial<Quote>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(0);
  const [shown, setShown] = useState('');

  // TODO 2: mutable ref tracking the active filter
  const selectTagRef = useRef<string | null>(null);

  const pop = useRef(new Animated.Value(1)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const chipScrollRef = useDesktopHScroll();

  const loadRandomQuote = async () => {
    // TODO 3
    setLoading(true);
    try {
      const tag = selectTagRef.current ?? null;
      const result = await getRandomQuote(tag);
      setQuote(result);
      setSelectedTag(tag);
      setSeen((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    // TODO 4
    const result = await getTags();
    setTags(result);
  };

  useEffect(() => {
    // TODO 5
    loadRandomQuote();
    loadTags();
  }, []);

  const full = quote.text ?? '';

  // typewriter reveal each time a new quote arrives
  useEffect(() => {
    setShown('');
    if (loading || !full) return;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [full, loading]);

  const theme = useTheme();
  const { palette } = usePalette();
  const { toggleFavorite, isFavorite } = useFavorites();

  const hasQuote = Boolean(quote.text);
  const favorited = hasQuote ? isFavorite(quote as Quote) : false;
  const done = shown.length >= full.length;
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  // TODO 9
  const selectTag = (tag: string | null) => {
    selectTagRef.current = tag;
    setSelectedTag(tag);
    loadRandomQuote();
  };

  // TODO 24: save/remove current quote, then jump to Favorites
  const onFavorite = () => {
    if (!hasQuote || loading) return;
    const adding = !favorited;
    toggleFavorite(quote as Quote);
    if (adding) {
      burst.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pop, { toValue: 1.45, duration: 140, useNativeDriver: native }),
          Animated.spring(pop, { toValue: 1, friction: 3, useNativeDriver: native }),
        ]),
        Animated.timing(burst, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      ]).start();
    }
    setTimeout(() => router.navigate('/favorites'), adding ? 750 : 150);
  };

  const onShare = async () => {
    if (!hasQuote) return;
    try {
      await Share.share({ message: `“${quote.text}” — ${quote.author}` });
    } catch {}
  };

  return (
    <View style={styles.wrap}>
      {/* Hero card */}
      <View style={[styles.heroShadow, { shadowColor: palette.main }]}>
        <LinearGradient colors={palette.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.badgeText}>Quote of the day</Text>
            </View>
            <Text style={styles.date}>{today}</Text>
          </View>

          <Text style={styles.mark}>“</Text>

          <View style={styles.textArea}>
            {loading ? (
              <View style={{ gap: 12 }}>
                <Skeleton tone="glass" height={22} />
                <Skeleton tone="glass" height={22} />
                <Skeleton tone="glass" height={22} width="62%" />
                <Skeleton tone="glass" height={14} width="34%" style={{ alignSelf: 'flex-end', marginTop: 8 }} />
              </View>
            ) : (
              <>
                {/* TODO 7: quote text */}
                <Text style={styles.quoteText}>{shown}</Text>
                {/* TODO 8: author */}
                <Text style={[styles.author, { opacity: done ? 1 : 0 }]}>— {quote.author ?? ''}</Text>
              </>
            )}
          </View>

          {/* TODO 6: tag chips */}
          <View style={styles.tagRow}>
            {!loading &&
              quote.tags?.map((t) => (
                <View key={t} style={[styles.glassChip, selectedTag === t && styles.glassChipActive]}>
                  <Text style={[styles.glassChipText, selectedTag === t && { color: palette.main }]}>#{t}</Text>
                </View>
              ))}
          </View>

          <View style={styles.actions}>
            <View style={styles.heartWrap}>
              {BURST.map((a) => {
                const r = (a * Math.PI) / 180;
                return (
                  <Animated.View
                    key={a}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      marginLeft: -7,
                      marginTop: -7,
                      opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                      transform: [
                        { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(r) * 50] }) },
                        { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(r) * 50] }) },
                      ],
                    }}
                  >
                    <Ionicons name="heart" size={14} color="#fff" />
                  </Animated.View>
                );
              })}
              {/* TODO 24: favorite heart */}
              <Hoverable
                onPress={onFavorite}
                accessibilityLabel={favorited ? 'Remove from favorites' : 'Save to favorites'}
                style={styles.roundBtn}
                scale={1.18}
                lift={3}
                hoverBg="rgba(255,255,255,0.38)"
                glow="rgba(255,90,122,0.55)"
              >
                {(h: any) => (
                  <Animated.View
                    style={{
                      transform: [
                        { scale: Animated.multiply(pop, h.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] })) },
                      ],
                    }}
                  >
                    <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={24} color={favorited ? '#ff5a7a' : '#fff'} />
                  </Animated.View>
                )}
              </Hoverable>
            </View>

            <Hoverable
              onPress={onShare}
              accessibilityLabel="Share quote"
              style={styles.roundBtn}
              scale={1.18}
              lift={3}
              hoverBg="rgba(255,255,255,0.38)"
              glow="rgba(255,255,255,0.45)"
            >
              {(h: any) => (
                <Animated.View style={{ transform: [{ translateY: h.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}>
                  <Ionicons name="share-outline" size={22} color="#fff" />
                </Animated.View>
              )}
            </Hoverable>

            {/* TODO 11: next quote */}
            <Hoverable
              onPress={loadRandomQuote}
              disabled={loading}
              style={[styles.nextBtn, { opacity: loading ? 0.7 : 1 }]}
              scale={1.04}
              lift={3}
              hoverBg="#fff4ec"
              glow="rgba(255,255,255,0.6)"
            >
              {(h: any) => (
                <>
                  <Animated.View style={{ transform: [{ rotate: h.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                    <Ionicons name="refresh" size={18} color={palette.main} />
                  </Animated.View>
                  <Text style={[styles.nextText, { color: palette.main }]}>{loading ? 'Loading…' : 'Next quote'}</Text>
                </>
              )}
            </Hoverable>
          </View>
        </LinearGradient>
      </View>

      {/* Topic filter */}
      <View style={[styles.topics, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.topicsHeader}>
          <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>Pick a topic</Text>
          <View style={[styles.counter, { backgroundColor: palette.main + '22' }]}>
            <Ionicons name="flame" size={14} color={palette.main} />
            <Text style={[styles.counterText, { color: palette.main }]}>{seen} explored</Text>
          </View>
        </View>

        <ScrollView
          ref={chipScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Hoverable
            onPress={() => selectTag(null)}
            style={[
              styles.filterChip,
              selectedTag === null ? { backgroundColor: palette.main, borderColor: palette.main } : { borderColor: theme.colors.border },
            ]}
            scale={1.1}
            lift={3}
            hoverBg={selectedTag === null ? undefined : palette.main + '26'}
          >
            <Text style={[styles.filterChipText, { color: selectedTag === null ? '#fff' : theme.colors.text }]}>any</Text>
          </Hoverable>

          {/* TODO 10: one filter chip per tag */}
          {tags.length === 0
            ? [64, 82, 58, 90].map((w, i) => <Skeleton key={i} width={w} height={34} radius={18} />)
            : tags.map((t) => {
                const active = selectedTag === t;
                return (
                  <Hoverable
                    key={t}
                    onPress={() => selectTag(t)}
                    style={[styles.filterChip, active ? { backgroundColor: palette.main, borderColor: palette.main } : { borderColor: theme.colors.border }]}
                    scale={1.1}
                    lift={3}
                    hoverBg={active ? undefined : palette.main + '26'}
                  >
                    <Text style={[styles.filterChipText, { color: active ? '#fff' : theme.colors.text }]}>{t}</Text>
                  </Hoverable>
                );
              })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 520, gap: 18 },
  heroShadow: {
    borderRadius: 32,
    elevation: 12,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  hero: { borderRadius: 32, padding: 24, overflow: 'hidden' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  date: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  mark: { color: 'rgba(255,255,255,0.35)', fontSize: 110, lineHeight: 110, height: 70, marginTop: 14, fontWeight: '800' },
  textArea: { minHeight: 170, justifyContent: 'center' },
  quoteText: { color: '#fff', fontSize: 25, lineHeight: 36, fontWeight: '700', letterSpacing: -0.2 },
  author: { color: 'rgba(255,255,255,0.88)', fontSize: 16, fontWeight: '600', textAlign: 'right', marginTop: 14 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', minHeight: 40, marginTop: 14, marginBottom: 6 },
  glassChip: {
    marginRight: 6,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  glassChipActive: { backgroundColor: '#fff' },
  glassChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  heartWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  roundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  nextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  nextText: { fontSize: 16, fontWeight: '800' },
  topics: { borderRadius: 24, padding: 18, gap: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  topicsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topicsTitle: { fontSize: 17, fontWeight: '800' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  counterText: { fontSize: 12, fontWeight: '700' },
  filterRow: { gap: 8, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 13, fontWeight: '600' },
});