import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { List, Text, useTheme } from 'react-native-paper';
import { useSearchHistory } from '@/searchHistory';

export default function HistoryScreen() {
  const theme = useTheme();
  const { entries } = useSearchHistory();

  const handlePick = (city: string) => {
    // TODO 5.3 [Cross-Screen Handoff]
    router.navigate({ pathname: '/', params: { q: city } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
        Tap a city to jump back into that search.
      </Text>

      {/* TODO 5.2 [History List Mapping] — entries are already ordered most recent first */}
      {entries.map((entry, index) => (
        <List.Item
          key={`${entry}-${index}`}
          title={entry}
          titleStyle={{ color: theme.colors.onBackground }}
          left={(props) => <List.Icon {...props} icon="map-marker" />}
          onPress={() => handlePick(entry)}
          accessibilityLabel={`Search ${entry} again`}
        />
      ))}

      {entries.length === 0 && (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          No searches yet — run a search on the Search tab first.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    gap: 8,
  },
  intro: {
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});