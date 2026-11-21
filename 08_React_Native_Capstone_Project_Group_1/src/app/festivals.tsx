import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { FESTIVALS, FESTIVALS_SOURCE, type Festival } from '@/data/festivalData';
import { useLanguage } from '@/i18n';
import { useTrip } from '@/tripPlanner';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fil: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
};

// How many months from now until the festival starts (0 = this month)
const monthsAway = (festival: Festival, currentMonth: number) =>
  Math.min(...festival.months.map((m) => (m - currentMonth + 12) % 12));

// Festivals and events, sorted so the ones coming up soonest are first.
export default function FestivalsScreen() {
  const theme = useTheme();
  const { t, lang } = useLanguage();
  const { isInTrip, addPlace } = useTrip();

  const currentMonth = new Date().getMonth() + 1;
  const sorted = [...FESTIVALS].sort((a, b) => monthsAway(a, currentMonth) - monthsAway(b, currentMonth));

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {t('festivalsIntro')}
      </Text>

      {sorted.map((festival) => {
        const thisMonth = festival.months.includes(currentMonth);
        return (
          <Card key={festival.name} mode="outlined">
            <Card.Content style={styles.card}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={[styles.title, { color: theme.colors.primary }]}>
                  🎭 {festival.name}
                </Text>
                {thisMonth && (
                  <Chip compact icon="calendar-star">
                    {t('thisMonth')}
                  </Chip>
                )}
              </View>
              <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
                📍 {festival.location}
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                🗓️ {festival.when} ({festival.months.map((m) => MONTH_NAMES[lang][m - 1]).join(' / ')})
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {festival.description}
              </Text>
            </Card.Content>
            {!!festival.place && (
              <Card.Actions>
                <Button
                  icon="image-multiple"
                  onPress={() =>
                    router.navigate({ pathname: '/', params: { q: festival.place, n: String(Date.now()) } })
                  }
                >
                  {t('seePhotos')}
                </Button>
                <Button
                  icon={isInTrip(festival.place) ? 'check' : 'bag-suitcase-outline'}
                  disabled={isInTrip(festival.place)}
                  onPress={() => addPlace(festival.place)}
                >
                  {isInTrip(festival.place) ? t('tripIn') : t('tripAdd')}
                </Button>
              </Card.Actions>
            )}
          </Card>
        );
      })}

      <Text variant="labelSmall" style={[styles.source, { color: theme.colors.outline }]}>
        {t('sourceLabel')} {FESTIVALS_SOURCE}
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