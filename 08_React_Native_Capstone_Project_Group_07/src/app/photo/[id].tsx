import { TricolorBar } from '@/components/ui';
import { usePhotos } from '@/photos';
import { fontFamily, glass, radius } from '@/theme';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';

const asString = (value?: string | string[]) => (Array.isArray(value) ? (value[0] ?? '') : (value ?? ''));

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();

  const params = useLocalSearchParams<{
    id?: string;
    imageUrl?: string;
    photographer?: string;
    photographerUrl?: string;
    altText?: string;
  }>();
  const id = asString(params.id);
  const imageUrl = asString(params.imageUrl);
  const photographer = asString(params.photographer);
  const photographerUrl = asString(params.photographerUrl);
  const altText = asString(params.altText);

  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  const currentIndex = photos.findIndex((p) => String(p.id) === id);

  const goToAdjacentPhoto = (offset: number) => {
    if (currentIndex < 0) return;
    const target = photos[currentIndex + offset];
    if (!target) return;

    router.replace({
      pathname: '/photo/[id]',
      params: {
        id: String(target.id),
        imageUrl: target.imageUrl,
        photographer: target.photographer,
        photographerUrl: target.photographerUrl,
        altText: target.altText,
      },
    });
  };

  const handleOpenPhotographer = () => {
    if (photographerUrl) {
      WebBrowser.openBrowserAsync(photographerUrl);
    }
  };

  const handleShare = async () => {
    const text = `${altText || 'Tourist spot'} — 📸 by ${photographer}`;
    try {
      await Share.share({
        title: `Tourist spot by ${photographer}`,
        message: Platform.OS === 'android' && photographerUrl ? `${text}\n${photographerUrl}` : text,
        url: photographerUrl || undefined,
      });
    } catch (error) {
      console.warn('Share was not completed:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: photographer ? `By ${photographer}` : 'Tourist Spot' }} />

      <TricolorBar />

      <Image
        source={{ uri: imageUrl }}
        style={styles.hero}
        contentFit="contain"
        transition={200}
        accessibilityLabel={altText}
      />

      <ScrollView
        style={[styles.body, { backgroundColor: theme.colors.surface }]}
        contentContainerStyle={styles.bodyContent}
      >
        {/* Displays the photo's description / alt text */}
        {altText ? (
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
            {altText}
          </Text>
        ) : null}

        <View style={styles.pagerRow}>
          <IconButton
            icon="chevron-left"
            iconColor={theme.colors.onSurface}
            size={28}
            onPress={() => goToAdjacentPhoto(-1)}
            accessibilityLabel="Previous photo"
          />
          <Text variant="titleMedium" style={[styles.photographer, { color: theme.colors.onSurface }]}>
            📸 Captured by {photographer || '—'}
          </Text>
          <IconButton
            icon="chevron-right"
            iconColor={theme.colors.onSurface}
            size={28}
            onPress={() => goToAdjacentPhoto(1)}
            accessibilityLabel="Next photo"
          />
        </View>

        <Button mode="outlined" icon="open-in-new" onPress={handleOpenPhotographer} disabled={!photographerUrl}>
          Visit photographer profile
        </Button>

        <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.shareButton}>
          Share this spot
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hero: {
    width: '100%',
    height: '50%',
    backgroundColor: '#000',
  },
  body: {
    flex: 1,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: glass.border,
  },
  bodyContent: {
    padding: 20,
    gap: 14,
  },
  description: {
    fontFamily: fontFamily.medium,
    lineHeight: 22,
    marginBottom: 4,
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photographer: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 4,
  },
});