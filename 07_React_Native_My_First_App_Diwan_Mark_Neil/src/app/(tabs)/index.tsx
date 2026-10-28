import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuoteOfTheDay from '@/components/QuoteOfTheDay';
import Backdrop from '@/components/Backdrop';
import Hoverable from '../../components/Hoverable';
import Reveal from '@/components/Reveal';
import { useFavorites } from '@/favorites';
import { usePalette } from '@/palette';
import { useTheme } from '@/theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function HomeScreen() {
  const theme = useTheme();
  const { palette } = usePalette();
  const { favorites } = useFavorites();
  const insets = useSafeAreaInsets();

  return (
    <Backdrop>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Reveal style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hello, { color: theme.colors.text }]}>{greeting()}</Text>
            <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>Here is a thought to carry today.</Text>
          </View>
          <Hoverable
            onPress={() => router.navigate('/favorites')}
            accessibilityLabel="Open favorites"
            style={{ borderRadius: 22 }}
            scale={1.12}
            lift={3}
            glow={palette.main + '88'}
          >
            {(h: any) => (
              <LinearGradient colors={palette.gradient} style={styles.avatar}>
                <Animated.View style={{ transform: [{ scale: h.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }] }}>
                  <Ionicons name="heart" size={16} color="#fff" />
                </Animated.View>
                <Text style={styles.avatarText}>{favorites.length}</Text>
              </LinearGradient>
            )}
          </Hoverable>
        </Reveal>

        <Reveal delay={150} style={{ width: '100%', alignItems: 'center' }}>
          <QuoteOfTheDay />
        </Reveal>
      </ScrollView>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 130 },
  header: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  hello: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  sub: { fontSize: 15, marginTop: 4 },
  avatar: { minWidth: 58, height: 44, borderRadius: 22, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});