import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { FOLKLORE, FOLKLORE_SOURCE } from '@/data/folkloreData';
import { useLanguage } from '@/i18n';
import { useTrip } from '@/tripPlanner';

// Folklore and haunted places for the Halloween theme.
export default function FolkloreScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { isInTrip, addPlace } = useTrip();

  const typeLabel = {
    creature: t('typeCreature'),
    legend: t('typeLegend'),
    haunted: t('typeHaunted'),
  } as const;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {t('folkloreIntro')}
      </Text>

      {FOLKLORE.map((item) => (
        <Card key={item.name} mode="outlined">
          <Card.Content style={styles.card}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.primary }]}>
                {item.emoji} {item.name}
              </Text>
              <Chip compact>{typeLabel[item.type]}</Chip>
            </View>
            <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
              📍 {t('whereLabel')} {item.where}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.story}
            </Text>
          </Card.Content>
          {!!item.place && (
            <Card.Actions>
              <Button
                icon="image-multiple"
                onPress={() =>
                  router.navigate({ pathname: '/', params: { q: item.place, n: String(Date.now()) } })
                }
              >
                {t('seePhotos')}
              </Button>
              <Button
                icon={isInTrip(item.place) ? 'check' : 'bag-suitcase-outline'}
                disabled={isInTrip(item.place)}
                onPress={() => addPlace(item.place)}
              >
                {isInTrip(item.place) ? t('tripIn') : t('tripAdd')}
              </Button>
            </Card.Actions>
          )}
        </Card>
      ))}

      <Text variant="labelSmall" style={[styles.source, { color: theme.colors.outline }]}>
        {t('sourceLabel')} {FOLKLORE_SOURCE}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    gap: 12,
  },
  card: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  source: {
    textAlign: 'center',
    marginTop: 8,
  },
});