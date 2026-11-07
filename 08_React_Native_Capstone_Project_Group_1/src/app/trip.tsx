import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useLanguage } from '@/i18n';
import { useTrip } from '@/tripPlanner';

// The My Trip screen: the places you saved, each with a note.
export default function TripScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { places, removePlace, setNote } = useTrip();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {t('tripHint')}
      </Text>

      {places.map((place) => (
        <Card key={place.name} mode="outlined">
          <Card.Title
            title={`📍 ${place.name.replace(/^(City of|Municipality of)\s+/i, '')}`}
            titleVariant="titleMedium"
            right={() => (
              <IconButton
                icon="delete-outline"
                onPress={() => removePlace(place.name)}
                accessibilityLabel={t('tripRemove')}
              />
            )}
          />
          <Card.Content>
            <TextInput
              mode="outlined"
              multiline
              label={t('tripNote')}
              value={place.note}
              onChangeText={(text) => setNote(place.name, text)}
            />
          </Card.Content>
          <Card.Actions>
            <Button
              icon="image-multiple"
              onPress={() =>
                // 'n' makes every tap count as a new search, even for the same place
                router.navigate({ pathname: '/', params: { q: place.name, n: String(Date.now()) } })
              }
            >
              {t('tripView')}
            </Button>
          </Card.Actions>
        </Card>
      ))}

      {places.length === 0 && (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          {t('tripEmpty')}
        </Text>
      )}
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
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});