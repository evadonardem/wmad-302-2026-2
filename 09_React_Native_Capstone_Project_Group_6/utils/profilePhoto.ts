/**
 * Profile photo helpers.
 * The user picks a picture from the gallery (square crop). It is copied into
 * the app's own folder so it doesn't disappear when the picker's cache is
 * cleaned, and only its file path is saved on the account.
 */
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

/**
 * Open the gallery. Returns the saved photo's path, or null if the user
 * cancelled. If copying fails the picker's own file is used instead.
 */
export async function pickProfilePhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
  });
  const uri = result.canceled ? undefined : result.assets?.[0]?.uri;
  if (!uri) return null;
  return keepInAppFolder(uri);
}

/** Copy a picked file into the app folder (file name changes every time). */
async function keepInAppFolder(uri: string): Promise<string> {
  const folder = FileSystem.documentDirectory;
  if (!folder) return uri; // e.g. on web there is no app folder
  try {
    const target = `${folder}profile-photo-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: target });
    return target;
  } catch {
    return uri;
  }
}

/** Delete an old photo, but only if it is one of ours (never a web address). */
export async function deleteLocalPhoto(uri: string): Promise<void> {
  const folder = FileSystem.documentDirectory;
  if (!folder || !uri.startsWith(folder)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // an old file that can't be deleted is not worth bothering the user
  }
}
