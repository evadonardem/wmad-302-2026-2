import { Linking, Platform } from 'react-native';

export type DownloadResult = 'saved' | 'opened' | 'denied' | 'failed';

// Downloads one photo size.
// - Web: starts a browser download.
// - Phone: saves the photo to the gallery (asks for permission the first time).
// If saving does not work, the image is opened in the browser so it can still be saved from there.
export const downloadPhoto = async (
  url: string,
  id: string | number,
  sizeLabel: string,
): Promise<DownloadResult> => {
  const filename = `lakbay-${id}-${sizeLabel}-${Date.now()}.jpg`;

  try {
    if (Platform.OS === 'web') {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      return 'saved';
    }

    // The two Expo modules are loaded only when a download starts.
    const MediaLibrary: any = await import('expo-media-library');
    const FileSystem: any = await import('expo-file-system');

    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (!permission.granted) return 'denied';

    let localUri: string;
    if (FileSystem.File?.downloadFileAsync) {
      // Newer expo-file-system API
      const file = await FileSystem.File.downloadFileAsync(
        url,
        new FileSystem.File(FileSystem.Paths.cache, filename),
      );
      localUri = file.uri;
    } else {
      // Older expo-file-system API
      const result = await FileSystem.downloadAsync(url, `${FileSystem.cacheDirectory}${filename}`);
      localUri = result.uri;
    }

    await MediaLibrary.saveToLibraryAsync(localUri);
    return 'saved';
  } catch {
    try {
      await Linking.openURL(url);
      return 'opened';
    } catch {
      return 'failed';
    }
  }
};