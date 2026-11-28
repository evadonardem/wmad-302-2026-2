import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, IconButton, TextInput } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { marketplaceColors } from '@/constants/theme';
import { showAlert } from '@/utils/platformAlert';

const brandPurple = '#75648A';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileImage, setProfileImage] = useState(user?.image ?? '');
  const [saving, setSaving] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setProfileImage(user?.image ?? '');
  }, [user]);

  const chooseProfileImage = async () => {
    setSelectingImage(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert('Photo access required', 'Allow access to your photos to choose a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        base64: Platform.OS === 'web',
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) throw new Error('No photo was selected.');

      if (Platform.OS === 'web') {
        if (!asset.base64) throw new Error('Could not read the selected photo.');
        setProfileImage(`data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`);
      } else {
        const documentDirectory = FileSystem.documentDirectory;
        if (!documentDirectory) throw new Error('Local photo storage is unavailable on this device.');
        const extension = asset.mimeType?.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg';
        const destination = `${documentDirectory}profile-${user?.id ?? 'user'}-${Date.now()}.${extension}`;
        await FileSystem.copyAsync({ from: asset.uri, to: destination });
        setProfileImage(destination);
      }
    } catch (error) {
      showAlert('Could not select profile photo', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSelectingImage(false);
    }
  };

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('Name required', 'Enter your first and last name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showAlert('Check your email', 'Enter a valid email address.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        image: profileImage,
      });
      showAlert('Profile updated', 'Your changes have been saved on this device.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (error) {
      showAlert('Could not update profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <View>
          <Text style={styles.heading}>Edit profile</Text>
          <Text style={styles.subtitle}>Keep your account details up to date</Text>
        </View>
      </View>
      <Card style={styles.formCard} mode="contained">
        <Card.Content>
          <View style={styles.photoPicker}>
            {profileImage ? (
              <Avatar.Image size={88} source={{ uri: profileImage }} />
            ) : (
              <Avatar.Text
                size={88}
                label={`${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'U'}
                style={styles.avatar}
              />
            )}
            <Button
              mode="outlined"
              icon="image-plus"
              textColor={brandPurple}
              onPress={() => void chooseProfileImage()}
              loading={selectingImage}
              disabled={selectingImage || saving}
            >
              {profileImage ? 'Change profile photo' : 'Choose profile photo'}
            </Button>
            {profileImage && (
              <Button
                mode="text"
                textColor={brandPurple}
                onPress={() => setProfileImage('')}
                disabled={selectingImage || saving}
              >
                Remove photo
              </Button>
            )}
          </View>
          <TextInput label="First name" mode="outlined" value={firstName} onChangeText={setFirstName} style={styles.input} />
          <TextInput label="Last name" mode="outlined" value={lastName} onChangeText={setLastName} style={styles.input} />
          <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <TextInput label="Username" mode="outlined" value={user?.username ?? ''} editable={false} style={styles.input} />
          <Text style={styles.note}>
            Profile updates are saved on this device for the demo.
          </Text>
          <Button
            mode="contained"
            buttonColor={brandPurple}
            onPress={() => void save()}
            loading={saving}
            disabled={saving || selectingImage}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Save changes
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background },
  content: { padding: 16, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heading: { color: '#30283A', fontSize: 21, fontWeight: '800' },
  subtitle: { color: '#746C7A', fontSize: 12, marginTop: 2 },
  formCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: marketplaceColors.border },
  photoPicker: { alignItems: 'center', gap: 8, marginBottom: 18 },
  avatar: { backgroundColor: brandPurple },
  input: { marginBottom: 12, backgroundColor: '#FFF' },
  note: { color: '#746C7A', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  saveButton: { borderRadius: 12 },
  saveButtonContent: { minHeight: 46 },
});
