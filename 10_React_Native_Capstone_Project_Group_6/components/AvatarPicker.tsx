/**
 * AvatarPicker - the profile picture with a camera badge. Tap it to choose a new picture
 * from the photo library, or to go back to the default one.
 *
 * Needs two Expo packages:  npx expo install expo-image-picker expo-image-manipulator
 * The picture is cropped square, shrunk to 256px and saved on the device (see utils/avatar.ts).
 */
import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Avatar, Button, Dialog, Portal, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';
import { AVATAR_SIZE, buildAvatarDataUri } from '@/utils/avatar';

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function AvatarPicker({ size = 88, style }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { user, updateAvatar } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (task: () => Promise<string | null>) => {
    setMenuOpen(false);
    setBusy(true);
    try {
      setMessage(await task());
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not update your photo');
    } finally {
      setBusy(false);
    }
  };

  const choosePhoto = () =>
    run(async () => {
      // No `mediaTypes`: the picker shows images only by default, and its value differs between
      // expo-image-picker versions (a list in new ones, a single string in old ones)
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, // lets the person crop it square
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return null; // closed the picker: nothing to say

      // Shrink it: a phone photo is several MB, the avatar only needs a few KB
      const small = await manipulateAsync(result.assets[0].uri, [{ resize: { width: AVATAR_SIZE } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!small.base64) throw new Error('That image could not be read. Try another one.');

      await updateAvatar(buildAvatarDataUri(small.base64));
      return 'Profile photo updated';
    });

  const removePhoto = () =>
    run(async () => {
      await updateAvatar(null);
      return 'Profile photo removed';
    });

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        disabled={busy}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
      >
        <Avatar.Image
          size={size}
          source={{ uri: user?.image || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.badge}>
          {busy ? (
            <ActivityIndicator size={14} color={colors.onPrimary} />
          ) : (
            <MaterialCommunityIcons name="camera" size={14} color={colors.onPrimary} />
          )}
        </View>
      </TouchableOpacity>

      <Portal>
        <Dialog visible={menuOpen} onDismiss={() => setMenuOpen(false)} style={{ borderRadius: 24, backgroundColor: colors.surface }}>
          <Dialog.Title>Profile photo</Dialog.Title>
          <Dialog.Content style={styles.options}>
            <Button mode="contained" icon="image" onPress={choosePhoto}>
              Choose from gallery
            </Button>
            {user?.imageEdited && (
              <Button textColor={colors.primaryText} mode="outlined" icon="delete-outline" onPress={removePhoto}>
                Remove photo
              </Button>
            )}
            <Button textColor={colors.primaryText} mode="text" onPress={() => setMenuOpen(false)}>
              Cancel
            </Button>
          </Dialog.Content>
        </Dialog>

        <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={2500}>
          {message ?? ''}
        </Snackbar>
      </Portal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    avatar: { backgroundColor: colors.primaryContainer },
    badge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    options: { gap: 8 },
  });