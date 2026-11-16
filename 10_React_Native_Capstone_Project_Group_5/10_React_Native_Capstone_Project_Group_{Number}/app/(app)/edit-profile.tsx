import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, IconButton, TextInput } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';

const orange = '#EE4D2D';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Name required', 'Enter your first and last name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      Alert.alert('Profile updated', 'Your changes have been saved on this device.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Could not update profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
      <Text style={styles.heading}>Edit profile</Text>
      <TextInput label="First name" mode="outlined" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput label="Last name" mode="outlined" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput label="Username" mode="outlined" value={user?.username ?? ''} editable={false} style={styles.input} />
      <Text style={styles.note}>
        DummyJSON simulates profile updates. Your changes are retained locally and may not persist on the API.
      </Text>
      <Button mode="contained" buttonColor={orange} onPress={() => void save()} loading={saving} disabled={saving}>
        Save changes
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 18, paddingBottom: 32 },
  heading: { color: '#222', fontSize: 23, fontWeight: '800', marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: '#FFF' },
  note: { color: '#777', fontSize: 12, lineHeight: 18, marginBottom: 18 },
});
