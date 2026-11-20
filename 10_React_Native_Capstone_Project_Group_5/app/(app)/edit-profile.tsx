import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, IconButton, TextInput } from 'react-native-paper';
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

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
            disabled={saving}
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
  input: { marginBottom: 12, backgroundColor: '#FFF' },
  note: { color: '#746C7A', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  saveButton: { borderRadius: 12 },
  saveButtonContent: { minHeight: 46 },
});
