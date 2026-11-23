/**
 * Addresses - list, add, edit, delete and choose a default delivery address.
 * Saved on the device with AsyncStorage (DummyJSON has no address endpoint).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Card, HelperText, IconButton, TextInput } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/CommonComponents';
import { addressStorage } from '@/utils/storage';
import { addAddress, removeAddress, setDefaultAddress, updateAddress } from '@/utils/addresses';
import { hasErrors, validateAddress, AddressErrors } from '@/utils/validation';
import type { Address, AddressInput } from '@/types/address';
import { styles } from './accountStyles';

const EMPTY: AddressInput = { label: '', street: '', city: '', postalCode: '' };

const FIELDS: { key: keyof AddressInput; label: string }[] = [
  { key: 'label', label: 'Label (e.g. Home, Work)' },
  { key: 'street', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'postalCode', label: 'Postal code' },
];

export default function AddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Address | null>(null);

  useEffect(() => {
    if (!user) return;
    addressStorage
      .getForUser(user.id)
      .then(setAddresses)
      .finally(() => setLoading(false));
  }, [user]);

  const persist = useCallback(
    (next: Address[]) => {
      setAddresses(next);
      if (user) addressStorage.setForUser(user.id, next).catch(() => undefined);
    },
    [user]
  );

  const openForm = (address?: Address) => {
    setEditingId(address?.id ?? null);
    setForm(address ? { label: address.label, street: address.street, city: address.city, postalCode: address.postalCode } : EMPTY);
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
  };

  const handleSave = () => {
    const found = validateAddress(form);
    setErrors(found);
    if (hasErrors(found) || !user) return;
    persist(
      editingId
        ? updateAddress(addresses, editingId, form)
        : addAddress(addresses, user.id, form, `addr-${Date.now()}`)
    );
    closeForm();
  };

  if (loading) {
    return (
      <View style={styles.flex}>
        <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {showForm ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>{editingId ? 'Edit address' : 'New address'}</Text>
              {FIELDS.map(({ key, label }) => (
                <View key={key} style={styles.fieldGap}>
                  <TextInput
                    label={label}
                    mode="outlined"
                    value={form[key]}
                    error={Boolean(errors[key])}
                    style={styles.input}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, [key]: text }));
                      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
                    }}
                  />
                  <HelperText type="error" visible={Boolean(errors[key])}>
                    {errors[key] ?? ''}
                  </HelperText>
                </View>
              ))}
              <View style={styles.actions}>
                <Button mode="contained" onPress={handleSave}>
                  Save
                </Button>
                <Button onPress={closeForm}>Cancel</Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Button mode="contained" icon="plus" onPress={() => openForm()} style={{ marginBottom: 16 }}>
            Add address
          </Button>
        )}

        {addresses.length === 0 && !showForm ? (
          <EmptyState
            icon="map-marker-outline"
            title="No saved addresses"
            message="Add an address to speed up checkout"
          />
        ) : (
          addresses.map((address) => (
            <Card key={address.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardTitleRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <Text style={styles.cardTitle}>{address.label}</Text>
                    {address.isDefault && <Text style={styles.defaultTag}>DEFAULT</Text>}
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="pencil" size={20} onPress={() => openForm(address)} accessibilityLabel="Edit address" />
                    <IconButton
                      icon="delete-outline"
                      size={20}
                      iconColor="#EA4335"
                      onPress={() => setToDelete(address)}
                      accessibilityLabel="Delete address"
                    />
                  </View>
                </View>
                <Text style={styles.cardText}>
                  {address.street}, {address.city} {address.postalCode}
                </Text>
                {!address.isDefault && (
                  <Button compact onPress={() => persist(setDefaultAddress(addresses, address.id))} style={{ alignSelf: 'flex-start' }}>
                    Set as default
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete address"
        message={`Remove "${toDelete?.label ?? ''}" from your saved addresses?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) persist(removeAddress(addresses, toDelete.id));
          setToDelete(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}
