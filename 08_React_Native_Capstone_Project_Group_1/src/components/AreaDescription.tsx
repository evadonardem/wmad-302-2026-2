import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { findFeaturedByCityName } from '@/data/featuredPlaces';
import { getProvinceName, type City } from '@/services/geoPhotoService';

// Shown once when an area is chosen in the form (not on every photo).
// The facts come from the Philippine Standard Geographic Code (PSGC). When the place is also one of
// our featured places, a short description from the Department of Tourism based list is added.
export default function AreaDescription({ city, regionName }: { city: City; regionName: string }) {
  const theme = useTheme();
  const [province, setProvince] = useState({ code: '', name: '' });

  useEffect(() => {
    let active = true;
    if (!city.provinceCode) return;
    getProvinceName(city.provinceCode).then((name) => {
      if (active) setProvince({ code: city.provinceCode, name });
    });
    return () => {
      active = false;
    };
  }, [city.provinceCode]);

  const shortName = city.name.replace(/^(City of|Municipality of)\s+/i, '');
  const kind = city.isCity ? 'city' : 'municipality';
  const islandGroup = city.islandGroupCode
    ? city.islandGroupCode.charAt(0).toUpperCase() + city.islandGroupCode.slice(1)
    : '';
  // Only use the province name that belongs to the current city
  const provinceName = province.code === city.provinceCode ? province.name : '';

  const where = [provinceName, regionName, islandGroup].filter(Boolean).join(', ');
  const featured = findFeaturedByCityName(city.name);

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          About {shortName}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {shortName} is a {kind} in {where}.
          {city.isCapital ? ' It is the provincial capital.' : ''}
        </Text>
        {featured && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {featured.name}: {featured.description}
          </Text>
        )}
        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
          Location facts: Philippine Standard Geographic Code (PSGC)
          {featured ? '. Highlights: Department of Tourism news and travel guides.' : ''}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    gap: 6,
  },
});