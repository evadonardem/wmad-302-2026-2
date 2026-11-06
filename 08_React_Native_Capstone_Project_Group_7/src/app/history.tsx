import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { useSearchHistory } from '@/searchHistory';

export default function HistoryScreen() {
  const theme = useTheme();
  const { entries } = useSearchHistory();

  const handlePick = (city: string) => {
    router.navigate({ pathname: '/', params: { q: city } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
        Tap a city to jump back into that search.
      </Text>

      {entries.map((entry) => (
        <Button
          key={entry}
          mode="outlined"
          icon="history"
          onPress={() => handlePick(entry)}
          style={styles.historyItem}
          contentStyle={styles.historyButtonContent}
          labelStyle={styles.historyLabel}
        >
          {entry}
        </Button>
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
    gap: 10,
  },
  intro: {
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
  historyItem: {
    width: '100%',
    borderRadius: 999,
  },
  historyButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  historyLabel: {
    fontWeight: '600',
  },
});