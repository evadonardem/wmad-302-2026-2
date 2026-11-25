/**
 * Profile picture helpers (pure functions, easy to unit test)
 *
 * The picture is shrunk to AVATAR_SIZE px and kept as a small "data:" text string, so it can be
 * saved with the rest of the account on the device (no file to lose when the phone clears its cache).
 *
 * - buildAvatarDataUri / isAvatarUri: make and check that string
 * - withSavedAvatar: put a saved picture on a user (used at login)
 * - keepStoredAvatar: keep the saved picture when /auth/me hands back the API's picture
 */

/** Pictures are resized to this many pixels wide (square after cropping). */
export const AVATAR_SIZE = 256;

/** Longest data string we accept (about 220 KB of image): a 256px JPEG is normally under 30 KB. */
export const MAX_AVATAR_LENGTH = 300_000;

export function buildAvatarDataUri(base64: string): string {
  return `data:image/jpeg;base64,${base64.replace(/\s/g, '')}`;
}

export function isAvatarUri(uri: unknown): uri is string {
  return (
    typeof uri === 'string' &&
    uri.length <= MAX_AVATAR_LENGTH &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(uri)
  );
}

type WithImage = { image: string; imageEdited?: boolean };

/** The user with their saved picture on it. Nothing saved (or a damaged value) leaves the user as it is. */
export function withSavedAvatar<T extends WithImage>(user: T, saved: string | null | undefined): T {
  return isAvatarUri(saved) ? { ...user, image: saved, imageEdited: true } : user;
}

/** If the person chose their own picture, keep it; otherwise use the fresh one. */
export function keepStoredAvatar<T extends WithImage>(fresh: T, stored: Pick<WithImage, 'image' | 'imageEdited'>): T {
  return stored.imageEdited && stored.image ? { ...fresh, image: stored.image, imageEdited: true } : fresh;
}
