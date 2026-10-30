import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { IconButton, Text } from 'react-native-paper';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const STEP = 0.5;

type Props = {
  uri: string;
  altText?: string;
  height: number;
};

// Photo viewer with zoom: tap the photo to toggle 2x, use +/- for fine control,
// then drag/scroll to pan around while zoomed in.
export default function ZoomableImage({ uri, altText, height }: Props) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [width, setWidth] = useState(0);
  const horizontalRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const verticalRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // Keep the view centred whenever the zoom level changes
  useEffect(() => {
    if (!width) return;
    const timer = setTimeout(() => {
      horizontalRef.current?.scrollTo({ x: (width * zoom - width) / 2, animated: false });
      verticalRef.current?.scrollTo({ y: (height * zoom - height) / 2, animated: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [zoom, width, height]);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + STEP));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - STEP));
  const reset = () => setZoom(MIN_ZOOM);
  const toggle = () => setZoom((z) => (z > MIN_ZOOM ? MIN_ZOOM : 2));

  const zoomed = zoom > MIN_ZOOM;

  return (
    <View
      style={[styles.frame, { height }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={horizontalRef}
        horizontal
        scrollEnabled={zoomed}
        showsHorizontalScrollIndicator={zoomed}
        bounces={false}
        contentContainerStyle={{ width: width * zoom }}
      >
        <ScrollView
          ref={verticalRef}
          nestedScrollEnabled
          scrollEnabled={zoomed}
          showsVerticalScrollIndicator={zoomed}
          bounces={false}
          contentContainerStyle={{ width: width * zoom, height: height * zoom }}
        >
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={zoomed ? 'Zoom out' : 'Zoom in'}
            style={{ width: width * zoom, height: height * zoom }}
          >
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
              transition={200}
              accessibilityLabel={altText}
            />
          </Pressable>
        </ScrollView>
      </ScrollView>

      {/* Zoom level badge */}
      {zoomed && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>{zoom}×</Text>
        </View>
      )}

      {/* First-time hint */}
      {!zoomed && (
        <View style={styles.hint} pointerEvents="none">
          <Text style={styles.hintText}>🔍 Tap photo to zoom</Text>
        </View>
      )}

      {/* Zoom controls */}
      <View style={styles.controls}>
        <IconButton
          icon="magnify-minus-outline"
          iconColor="#FFFFFF"
          size={22}
          disabled={zoom <= MIN_ZOOM}
          onPress={zoomOut}
          accessibilityLabel="Zoom out"
        />
        <IconButton
          icon="fit-to-screen-outline"
          iconColor="#FFFFFF"
          size={22}
          disabled={!zoomed}
          onPress={reset}
          accessibilityLabel="Reset zoom"
        />
        <IconButton
          icon="magnify-plus-outline"
          iconColor="#FFFFFF"
          size={22}
          disabled={zoom >= MAX_ZOOM}
          onPress={zoomIn}
          accessibilityLabel="Zoom in"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    backgroundColor: '#0B1416',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 28,
  },
});