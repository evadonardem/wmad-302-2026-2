import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, IconButton, Switch, TextInput } from 'react-native-paper';
import { addressesStorage, DeliveryAddress } from '@/utils/marketplaceStorage';

const orange = '#EE4D2D';
const emptyAddress = { recipient: '', phone: '', street: '', city: '', postalCode: '' };

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [form, setForm] = useState(emptyAddress);
  const [isDefault, setIsDefault] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      setAddresses(await addressesStorage.getAll());
    } catch (error) {
      Alert.alert('Could not load addresses', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadAddresses();
  }, [loadAddresses]));

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setIsDefault(false);
  };

  const saveAddress = async () => {
    if (Object.values(form).some((value) => !value.trim())) {
      Alert.alert('Address details required', 'Please fill in every address field.');
      return;
    }
    setSaving(true);
    try {
      await addressesStorage.save({
        id: editingId ?? `address-${Date.now()}`,
        ...form,
        isDefault: isDefault || addresses.length === 0,
      });
      resetForm();
      await loadAddresses();
    } catch (error) {
      Alert.alert('Could not save address', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const editAddress = (address: DeliveryAddress) => {
    setEditingId(address.id);
    setForm({
      recipient: address.recipient,
      phone: address.phone,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
    });
    setIsDefault(address.isDefault);
  };

  const removeAddress = (address: DeliveryAddress) => {
    Alert.alert('Delete address', `Remove the address for ${address.recipient}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          addressesStorage.remove(address.id)
            .then(loadAddresses)
            .catch((error: unknown) =>
              Alert.alert('Could not delete address', error instanceof Error ? error.message : 'Please try again.')
            );
        },
      },
    ]);
  };

  const setDefault = async (id: string) => {
    try {
      await addressesStorage.setDefault(id);
      await loadAddresses();
    } catch (error) {
      Alert.alert('Could not update default address', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text style={styles.heading}>Delivery addresses</Text>
      </View>
      {loading ? <Text style={styles.muted}>Loading addresses...</Text> : addresses.map((address) => (
        <Card key={address.id} style={styles.card} mode="contained">
          <Card.Content>
            <View style={styles.addressHeader}>
              <Text style={styles.name}>{address.recipient}</Text>
              {address.isDefault && <Text style={styles.defaultTag}>DEFAULT</Text>}
            </View>
            <Text style={styles.muted}>{address.phone}</Text>
            <Text style={styles.body}>
              {address.street}, {address.city} {address.postalCode}
            </Text>
            <View style={styles.actions}>
              {!address.isDefault && (
                <Button compact textColor={orange} onPress={() => void setDefault(address.id)}>
                  Set default
                </Button>
              )}
              <Button compact textColor={orange} onPress={() => editAddress(address)}>Edit</Button>
              <Button compact textColor="#B00020" onPress={() => removeAddress(address)}>Delete</Button>
            </View>
          </Card.Content>
        </Card>
      ))}
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <Text style={styles.formTitle}>{editingId ? 'Edit address' : 'Add a new address'}</Text>
          <TextInput label="Recipient name" mode="outlined" value={form.recipient} onChangeText={(recipient) => setForm({ ...form, recipient })} style={styles.input} />
          <TextInput label="Phone number" mode="outlined" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" style={styles.input} />
          <TextInput label="Street address" mode="outlined" value={form.street} onChangeText={(street) => setForm({ ...form, street })} style={styles.input} />
          <TextInput label="City" mode="outlined" value={form.city} onChangeText={(city) => setForm({ ...form, city })} style={styles.input} />
          <TextInput label="Postal code" mode="outlined" value={form.postalCode} onChangeText={(postalCode) => setForm({ ...form, postalCode })} keyboardType="number-pad" style={styles.input} />
          <View style={styles.defaultRow}>
            <Text style={styles.body}>Make this my default address</Text>
            <Switch value={isDefault} onValueChange={setIsDefault} color={orange} />
          </View>
          <Button mode="contained" buttonColor={orange} onPress={() => void saveAddress()} loading={saving} disabled={saving}>
            {editingId ? 'Save changes' : 'Add address'}
          </Button>
          {editingId && <Button onPress={resetForm}>Cancel editing</Button>}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  heading: { color: '#222', fontSize: 21, fontWeight: '800' },
  card: { backgroundColor: '#FFF', marginBottom: 12 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#222', fontWeight: '700', fontSize: 16 },
  defaultTag: { color: orange, fontWeight: '800', fontSize: 11 },
  muted: { color: '#777', fontSize: 13, marginTop: 6 },
  body: { color: '#444', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  formTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 12 },
  input: { marginBottom: 10, backgroundColor: '#FFF' },
  defaultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
});
