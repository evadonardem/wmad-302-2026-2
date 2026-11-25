import {
  AVATAR_SIZE,
  MAX_AVATAR_LENGTH,
  buildAvatarDataUri,
  isAvatarUri,
  keepStoredAvatar,
  withSavedAvatar,
} from '@/utils/avatar';

const goodUri = buildAvatarDataUri('QUJDREVGRw==');
const user = { id: 1, image: 'api.png' };

describe('buildAvatarDataUri', () => {
  it('wraps base64 in a jpeg data string', () => {
    expect(buildAvatarDataUri('QUJD')).toBe('data:image/jpeg;base64,QUJD');
  });

  it('drops line breaks and spaces some platforms add to base64', () => {
    expect(buildAvatarDataUri('QU\nJD RE')).toBe('data:image/jpeg;base64,QUJDRE');
  });
});

describe('isAvatarUri', () => {
  it('accepts a picture made by buildAvatarDataUri', () => {
    expect(isAvatarUri(goodUri)).toBe(true);
  });

  it('accepts png and webp data strings too', () => {
    expect(isAvatarUri('data:image/png;base64,QUJD')).toBe(true);
    expect(isAvatarUri('data:image/webp;base64,QUJD')).toBe(true);
  });

  it('rejects anything that is not a small image data string', () => {
    expect(isAvatarUri('https://dummyjson.com/icon/emilys/128')).toBe(false);
    expect(isAvatarUri('file:///cache/photo.jpg')).toBe(false);
    expect(isAvatarUri('data:text/html;base64,QUJD')).toBe(false);
    expect(isAvatarUri('data:image/svg+xml;base64,QUJD')).toBe(false);
    expect(isAvatarUri('data:image/jpeg;base64,')).toBe(false);
    expect(isAvatarUri('data:image/jpeg;base64,not base64!')).toBe(false);
    expect(isAvatarUri('')).toBe(false);
    expect(isAvatarUri(null)).toBe(false);
    expect(isAvatarUri(42)).toBe(false);
  });

  it('rejects a picture that is too big to keep on the device', () => {
    const huge = 'data:image/jpeg;base64,' + 'A'.repeat(MAX_AVATAR_LENGTH);
    expect(isAvatarUri(huge)).toBe(false);
  });
});

describe('withSavedAvatar', () => {
  it('puts the saved picture on the user and marks it as chosen', () => {
    expect(withSavedAvatar(user, goodUri)).toEqual({ id: 1, image: goodUri, imageEdited: true });
  });

  it('leaves the user alone when nothing (or something damaged) is saved', () => {
    expect(withSavedAvatar(user, null)).toBe(user);
    expect(withSavedAvatar(user, undefined)).toBe(user);
    expect(withSavedAvatar(user, '')).toBe(user); // "removed" is saved as an empty string
    expect(withSavedAvatar(user, 'javascript:alert(1)')).toBe(user);
  });

  it('does not change the user it is given', () => {
    withSavedAvatar(user, goodUri);
    expect(user).toEqual({ id: 1, image: 'api.png' });
  });
});

describe('keepStoredAvatar', () => {
  const fresh = { id: 1, image: 'fresh-from-api.png' };

  it('keeps the picture the person chose instead of the API one', () => {
    expect(keepStoredAvatar(fresh, { image: goodUri, imageEdited: true })).toEqual({
      id: 1,
      image: goodUri,
      imageEdited: true,
    });
  });

  it('uses the fresh picture when the person never chose one', () => {
    expect(keepStoredAvatar(fresh, { image: 'old-api.png' })).toBe(fresh);
    expect(keepStoredAvatar(fresh, { image: 'old-api.png', imageEdited: false })).toBe(fresh);
  });

  it('uses the fresh picture if the stored one is empty', () => {
    expect(keepStoredAvatar(fresh, { image: '', imageEdited: true })).toBe(fresh);
  });
});

describe('AVATAR_SIZE', () => {
  it('is a sensible size in pixels', () => {
    expect(AVATAR_SIZE).toBeGreaterThan(0);
  });
});
