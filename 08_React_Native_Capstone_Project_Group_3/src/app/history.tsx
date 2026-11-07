import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { List, Surface, Text, useTheme } from 'react-native-paper';
import AppBackground from '@/components/AppBackground';
import { useSearchHistory } from '@/searchHistory';

export default function HistoryScreen() {
  const theme = useTheme();
  const { entries } = useSearchHistory();

  const handlePick = (city: string) => {
    // TODO 5.3 [Cross-Screen Handoff]
    router.navigate({ pathname: '/', params: { q: city } });
  };

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.screen}>
          <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
            Tap a city to jump back into that search.
          </Text>

          {/* TODO 5.2 [History List Mapping] — entries are already ordered most recent first */}
          {entries.map((entry, index) => (
            <Surface
              key={`${entry}-${index}`}
              style={[styles.item, { backgroundColor: theme.colors.surface }]}
              elevation={2}
            >
              <List.Item
                title={entry}
                titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => handlePick(entry)}
                accessibilityLabel={`Search ${entry} again`}
              />
            </Surface>
          ))}

          {entries.length === 0 && (
            <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
              No searches yet — run a search on the Search tab first.
            </Text>
          )}
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  screen: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    gap: 10,
  },
  intro: {
    marginBottom: 8,
  },
  item: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});