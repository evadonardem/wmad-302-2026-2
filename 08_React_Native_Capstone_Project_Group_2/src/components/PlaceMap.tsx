import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PlaceMap({
  latitude,
  longitude,
  title,
}: {
  latitude: number;
  longitude: number;
  title: string;
}) {
  // Phones and tablets: a tappable pin card that opens the location in the Maps app.
  if (Platform.OS !== 'web') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${title} in Maps`}
        style={styles.card}
        onPress={() =>
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)
        }
      >
        <Text style={styles.pin}>📍</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.coords}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <Text style={styles.hint}>Tap to open the map</Text>
      </Pressable>
    );
  }

  // Web: live OpenStreetMap with a pin.
  const dLon = 0.04;
  const dLat = 0.03;
  const bbox = [longitude - dLon, latitude - dLat, longitude + dLon, latitude + dLat].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <View style={{ width: '100%', height: 220, borderRadius: 12, overflow: 'hidden' }}>
      {React.createElement('iframe', {
        src,
        style: { border: 0, width: '100%', height: '100%' },
        title: 'Map',
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 150,
    borderRadius: 12,
    backgroundColor: '#e8efe3',
    borderWidth: 1,
    borderColor: '#c9d2dc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 16,
  },
  pin: { fontSize: 32 },
  title: { fontWeight: '700', color: '#0b2545', textAlign: 'center' },
  coords: { color: '#5b6b7f', fontSize: 13 },
  hint: { color: '#0e7c86', fontWeight: '600', fontSize: 13, marginTop: 4 },
});