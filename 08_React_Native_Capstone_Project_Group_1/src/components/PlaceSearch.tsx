import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, List, Text, TextInput, useTheme } from 'react-native-paper';
import { ALL_FEATURED_PLACES } from '@/data/featuredPlaces';
import { useLanguage } from '@/i18n';
import {
  getAllCitiesMunicipalities,
  getRegions,
  type City,
  type Region,
} from '@/services/geoPhotoService';

// Lowercase and without accents, so typing "nino" finds "Niño"
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

type Suggestion =
  | { kind: 'city'; key: string; title: string; subtitle: string; city: City; regionName: string }
  | { kind: 'place'; key: string; title: string; subtitle: string };

// Type a city, town or tourist spot and pick it from the suggestions.
// - A city or municipality behaves like choosing it in the Region and City menus (onPickCity).
// - A featured tourist spot such as Boracay is searched directly (onPickPlace).
export default function PlaceSearch({
  onPickCity,
  onPickPlace,
}: {
  onPickCity: (city: City, regionName: string) => void;
  onPickPlace: (name: string) => void;
}) {
  const theme = useTheme();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [requested, setRequested] = useState(false);
  const [picked, setPicked] = useState(false);

  // The long list of cities is only downloaded the first time the box is used.
  const loadLists = () => {
    if (requested) return;
    setRequested(true);
    Promise.all([getAllCitiesMunicipalities(), getRegions()]).then(([allCities, allRegions]) => {
      setCities(allCities);
      setRegions(allRegions);
    });
  };

  const suggestions = useMemo<Suggestion[]>(() => {
    const text = normalize(query);
    if (text.length < 2 || picked) return [];

    const matches: { score: number; suggestion: Suggestion }[] = [];

    for (const place of ALL_FEATURED_PLACES) {
      const name = normalize(place.name);
      if (name.includes(text)) {
        matches.push({
          score: name.startsWith(text) ? 0 : 1,
          suggestion: { kind: 'place', key: `place-${place.name}`, title: place.name, subtitle: place.location },
        });
      }
    }

    for (const city of cities) {
      const shortName = city.name.replace(/^(City of|Municipality of)\s+/i, '');
      const name = normalize(shortName);
      if (name.includes(text)) {
        const regionName = regions.find((r) => r.code === city.regionCode)?.regionName ?? '';
        matches.push({
          score: name.startsWith(text) ? 0 : 1,
          suggestion: {
            kind: 'city',
            key: `city-${city.code}`,
            title: shortName,
            subtitle: regionName,
            city,
            regionName,
          },
        });
      }
    }

    return matches
      .sort((a, b) => a.score - b.score)
      .slice(0, 8)
      .map((m) => m.suggestion);
  }, [query, cities, regions, picked]);

  const pick = (suggestion: Suggestion) => {
    setQuery(suggestion.title);
    setPicked(true);
    if (suggestion.kind === 'city') {
      onPickCity(suggestion.city, suggestion.regionName);
    } else {
      onPickPlace(suggestion.title);
    }
  };

  const showNone = !picked && normalize(query).length >= 2 && suggestions.length === 0 && cities.length > 0;

  return (
    <View style={styles.wrapper}>
      <TextInput
        mode="outlined"
        label={t('placeSearchLabel')}
        value={query}
        onFocus={loadLists}
        onChangeText={(text) => {
          setQuery(text);
          setPicked(false);
        }}
        left={<TextInput.Icon icon="magnify" />}
        right={
          query ? (
            <TextInput.Icon
              icon="close-circle"
              onPress={() => {
                setQuery('');
                setPicked(false);
              }}
            />
          ) : undefined
        }
        autoCorrect={false}
      />

      {suggestions.length > 0 && (
        <Card mode="outlined" style={styles.list}>
          {suggestions.map((s) => (
            <List.Item
              key={s.key}
              title={s.title}
              description={s.subtitle}
              left={(props) => (
                <List.Icon {...props} icon={s.kind === 'city' ? 'city-variant-outline' : 'map-marker-star'} />
              )}
              onPress={() => pick(s)}
            />
          ))}
        </Card>
      )}

      {showNone && (
        <Text variant="bodySmall" style={[styles.none, { color: theme.colors.onSurfaceVariant }]}>
          {t('placeSearchNone')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  list: {
    marginTop: 4,
  },
  none: {
    marginTop: 6,
    marginLeft: 4,
  },
});