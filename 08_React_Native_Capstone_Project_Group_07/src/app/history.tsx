import { ScreenBackground } from '@/components/ui';
import { useSearchHistory } from '@/searchHistory';
import { fontFamily, glass, radius } from '@/theme';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export default function HistoryScreen() {
  const theme = useTheme();
  const { entries } = useSearchHistory();

  // TODO 5.3 [Cross-Screen Handoff]: navigate (not push) so this screen isn't left underneath
  const handlePick = (city: string) => {
    router.navigate({ pathname: '/', params: { q: city } });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Corner glows behind everything */}
      <ScreenBackground />

      <View style={styles.screen}>
        <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
          Tap a city to jump back into that search.
        </Text>

        {/* TODO 5.2 [History List Mapping] */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    borderRadius: radius.pill,
    backgroundColor: glass.fill,
    borderColor: glass.border,
  },
  historyButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  historyLabel: {
    fontFamily: fontFamily.semiBold,
  },
});
