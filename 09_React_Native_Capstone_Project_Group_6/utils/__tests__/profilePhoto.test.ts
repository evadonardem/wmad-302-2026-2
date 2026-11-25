/* eslint-env jest */
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { deleteLocalPhoto, pickProfilePhoto } from '@/utils/profilePhoto';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///app/docs/',
  copyAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

const picker = ImagePicker.launchImageLibraryAsync as jest.Mock;
const copyAsync = FileSystem.copyAsync as jest.Mock;
const deleteAsync = FileSystem.deleteAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pickProfilePhoto', () => {
  it('asks for a square image', async () => {
    picker.mockResolvedValue({ canceled: true, assets: null });
    await pickProfilePhoto();
    expect(picker).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, aspect: [1, 1] })
    );
  });

  it('returns null when the user cancels', async () => {
    picker.mockResolvedValue({ canceled: true, assets: null });
    expect(await pickProfilePhoto()).toBeNull();
    expect(copyAsync).not.toHaveBeenCalled();
  });

  it('returns null when no file comes back', async () => {
    picker.mockResolvedValue({ canceled: false, assets: [] });
    expect(await pickProfilePhoto()).toBeNull();
  });

  it('copies the picked file into the app folder', async () => {
    picker.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///cache/pick.jpg' }] });
    const saved = await pickProfilePhoto();
    expect(saved).toMatch(/^file:\/\/\/app\/docs\/profile-photo-\d+\.jpg$/);
    expect(copyAsync).toHaveBeenCalledWith({ from: 'file:///cache/pick.jpg', to: saved });
  });

  it('falls back to the picked file if copying fails', async () => {
    picker.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///cache/pick.jpg' }] });
    copyAsync.mockRejectedValueOnce(new Error('disk full'));
    expect(await pickProfilePhoto()).toBe('file:///cache/pick.jpg');
  });
});

describe('deleteLocalPhoto', () => {
  it('deletes a photo stored in the app folder', async () => {
    await deleteLocalPhoto('file:///app/docs/profile-photo-1.jpg');
    expect(deleteAsync).toHaveBeenCalledWith('file:///app/docs/profile-photo-1.jpg', {
      idempotent: true,
    });
  });

  it('never deletes web addresses or files elsewhere', async () => {
    await deleteLocalPhoto('https://dummyjson.com/icon/emilys/128');
    await deleteLocalPhoto('file:///cache/other.jpg');
    expect(deleteAsync).not.toHaveBeenCalled();
  });

  it('ignores a delete error', async () => {
    deleteAsync.mockRejectedValueOnce(new Error('nope'));
    await expect(deleteLocalPhoto('file:///app/docs/x.jpg')).resolves.toBeUndefined();
  });
});
