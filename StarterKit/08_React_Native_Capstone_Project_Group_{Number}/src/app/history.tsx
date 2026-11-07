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

      {entries.map((entry, index) => (
        <Button
          key={`${entry}-${index}`}
          mode="outlined"
          onPress={() => handlePick(entry)}
          style={styles.rowButton}
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
    gap: 8,
  },
  intro: {
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
  rowButton: {
    justifyContent: 'flex-start',
  },
});
