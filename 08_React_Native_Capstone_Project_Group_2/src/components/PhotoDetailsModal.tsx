import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, useTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';
import PlaceMap from './PlaceMap';
import { useBreakpoint } from '@/useBreakpoint';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function PhotoDetailsModal({
  photo,
  onDismiss,
}: {
  photo: Photo | null;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const { width } = useBreakpoint();
  const wide = width >= 900; // photo on the left, details on the right
  if (!photo) return null;

  const hasPin = photo.latitude != null && photo.longitude != null;

  return (
    <Portal>
      <Modal
        visible
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          wide && styles.modalWide,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ScrollView>
          <View style={wide ? styles.wideRow : undefined}>
          <Image
            source={{ uri: photo.imageUrl }}
            style={[styles.image, wide && styles.imageWide]}
            accessibilityLabel={photo.altText}
          />

          <View style={[styles.body, wide && styles.bodyWide]}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {photo.altText}
            </Text>

            <Row label="📍 Place">
              <Text style={{ color: theme.colors.onSurface }}>{photo.placeName}</Text>
            </Row>
            <Row label="📸 Photographer">
              <Text
                style={[styles.link, { color: theme.colors.primary }]}
                onPress={() => photo.photographerUrl && WebBrowser.openBrowserAsync(photo.photographerUrl)}
              >
                {photo.photographer}
              </Text>
            </Row>
            {photo.width && photo.height ? (
              <Row label="🖼 Size">
                <Text style={{ color: theme.colors.onSurface }}>
                  {photo.width} × {photo.height} px
                </Text>
              </Row>
            ) : null}
            {hasPin && (
              <Row label="🧭 Coordinates">
                <Text style={{ color: theme.colors.onSurface }}>
                  {photo.latitude!.toFixed(4)}, {photo.longitude!.toFixed(4)}
                </Text>
              </Row>
            )}

            {hasPin ? (
              <View style={styles.mapBox}>
                <PlaceMap
                  latitude={photo.latitude!}
                  longitude={photo.longitude!}
                  title={photo.placeName ?? photo.altText}
                />
                <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
                  The pin marks the searched place. Pexels doesn’t record the exact spot a photo was taken.
                </Text>
              </View>
            ) : (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Map location isn’t available for this place.
              </Text>
            )}

            <View style={styles.actions}>
              {hasPin && (
                <Button
                  mode="contained"
                  icon="map-marker"
                  buttonColor={theme.colors.primary}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${photo.latitude},${photo.longitude}`,
                    )
                  }
                >
                  Open in Maps
                </Button>
              )}
              {photo.pexelsUrl ? (
                <Button mode="outlined" onPress={() => WebBrowser.openBrowserAsync(photo.pexelsUrl!)}>
                  View on Pexels
                </Button>
              ) : null}
              <Button onPress={onDismiss}>Close</Button>
            </View>
          </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    width: '92%',
    maxWidth: 560,
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalWide: { maxWidth: 940 },
  wideRow: { flexDirection: 'row' },
  image: { width: '100%', height: 220 },
  imageWide: { width: '42%', height: undefined, minHeight: 420 },
  bodyWide: { flex: 1 },
  body: { padding: 16, gap: 10 },
  title: { fontWeight: '700' },
  row: { gap: 2 },
  link: { fontWeight: '600', textDecorationLine: 'underline' },
  mapBox: { gap: 6, marginTop: 4 },
  note: { fontStyle: 'italic' },
  actions: { gap: 8, marginTop: 8 },
});