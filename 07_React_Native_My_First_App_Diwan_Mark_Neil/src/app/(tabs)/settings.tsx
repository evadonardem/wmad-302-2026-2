import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GeneralSettings, { type SettingsAction } from '@/components/GeneralSettings';
import Backdrop from '@/components/Backdrop';
import Reveal from '@/components/Reveal';
import { PALETTES, PALETTE_KEYS, usePalette } from '@/palette';
import { useTheme, useThemeMode } from '@/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const { palette, paletteKey, setPaletteKey } = usePalette();

  const nextPalette = () => setPaletteKey(PALETTE_KEYS[(PALETTE_KEYS.indexOf(paletteKey) + 1) % PALETTE_KEYS.length]);

  // TODO 15: first action flips dark mode and swaps its icon/label
  const actions: SettingsAction[] = [
    {
      icon: <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={22} color={palette.main} />,
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onPress: () => setIsDarkMode((prev) => !prev),
    },
    { icon: <Ionicons name="color-palette" size={22} color={palette.main} />, name: `Theme: ${palette.label}`, onPress: nextPalette },
    {
      icon: <Ionicons name="print" size={22} color={palette.main} />,
      name: 'Print',
      onPress: () =>
        Platform.OS === 'web'
          ? (globalThis as { print?: () => void }).print?.()
          : Alert.alert('Print', 'Printing is available in the web version.'),
    },
    {
      icon: <Ionicons name="share-social" size={22} color={palette.main} />,
      name: 'Share',
      onPress: async () => {
        try {
          await Share.share({ message: 'Check out my Quote of the Day app!' });
        } catch {}
      },
    },
  ];

  return (
    <Backdrop>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

        <Reveal>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Color theme</Text>
            <View style={styles.swatches}>
              {PALETTE_KEYS.map((k) => {
                const p = PALETTES[k];
                const active = k === paletteKey;
                return (
                  <Pressable key={k} onPress={() => setPaletteKey(k)} style={styles.swatchItem} accessibilityLabel={`${p.label} theme`}>
                    <LinearGradient
                      colors={p.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.swatch, active && { borderColor: theme.colors.text, transform: [{ scale: 1.1 }] }]}
                    >
                      {active && <Ionicons name="checkmark" size={26} color="#fff" />}
                    </LinearGradient>
                    <Text style={[styles.swatchLabel, { color: active ? theme.colors.text : theme.colors.textSecondary }]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Reveal>

        <Reveal delay={120}>
          <Text style={[styles.heading, { color: theme.colors.textSecondary }]}>Preferences</Text>
          <GeneralSettings actions={actions} />
        </Reveal>
      </ScrollView>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 130, gap: 20 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  card: { borderRadius: 24, padding: 20, gap: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  swatches: { flexDirection: 'row', justifyContent: 'space-between' },
  swatchItem: { alignItems: 'center', gap: 8 },
  swatch: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  swatchLabel: { fontSize: 12, fontWeight: '700' },
  heading: { fontSize: 14, fontWeight: '700', marginBottom: 10, marginLeft: 6 },
});
