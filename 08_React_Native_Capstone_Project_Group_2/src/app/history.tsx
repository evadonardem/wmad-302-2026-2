import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { List, Text, useTheme } from 'react-native-paper';
import { useSearchHistory } from '@/searchHistory';

export default function HistoryScreen() {
  const theme = useTheme();
  const { entries } = useSearchHistory();

  const handlePick = (city: string) => {
    // TODO 5.3 [Cross-Screen Handoff]: navigate (not push) so this screen isn't left
    // sitting under the returned Search tab.
    router.navigate({ pathname: '/', params: { q: city } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
        Tap a city to jump back into that search.
      </Text>

      {/* TODO 5.2 [History List Mapping]: entries are already stored most-recent-first */}
      {entries.map((entry) => (
        <List.Item
          key={entry}
          title={entry}
          titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
          style={[
            styles.item,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}
          left={(props) => (
            <List.Icon {...props} icon="city-variant-outline" color={theme.colors.primary} />
          )}
          right={(props) => (
            <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />
          )}
          onPress={() => handlePick(entry)}
          accessibilityLabel={`Search ${entry} again`}
        />
      ))}

      {entries.length === 0 && (
        <View style={[styles.emptyBox, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
            No searches yet — run a search on the Search tab first.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: 20,
    gap: 10,
  },
  intro: {
    marginBottom: 8,
  },
  item: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 2,
  },
  itemTitle: {
    fontWeight: '600',
  },
  emptyBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 48,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  empty: {
    textAlign: 'center',
  },
});