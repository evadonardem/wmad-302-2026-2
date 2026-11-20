/**
 * Addresses - Marketplace (CRUD)
 * List, add, edit, delete and choose a default delivery address. Saved on the device
 * per account; the default one is prefilled at Checkout.
 * The list/form switch is a state variable (no extra routes), and all the rules live in
 * utils/profile.ts so they can be unit tested.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Button, Card, Dialog, HelperText, Portal, Snackbar, Switch, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { Address, AddressForm } from '@/types/auth';
import {
  AddressErrors,
  emptyAddressForm,
  removeAddress,
  saveAddress,
  setDefaultAddress,
  validateAddress,
} from '@/utils/profile';
import { addressStorage } from '@/utils/storage';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';

export default function AddressesScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const username = user?.username;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AddressForm | null>(null); // null = show the list
  const [errors, setErrors] = useState<AddressErrors>({});
  const [toDelete, setToDelete] = useState<Address | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    addressStorage
      .get(username)
      .then((saved) => {
        if (!cancelled) setAddresses(saved);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  /** Show the new list right away, then save it. */
  const persist = (next: Address[], successMessage: string) => {
    if (!username) return;
    setAddresses(next);
    addressStorage
      .set(username, next)
      .then(() => setMessage(successMessage))
      .catch(() => setMessage("Couldn't save your addresses."));
  };

  const startAdd = () => {
    setErrors({});
    setEditing(emptyAddressForm(user ? `${user.firstName} ${user.lastName}` : '', user?.phone ?? ''));
  };

  const startEdit = (address: Address) => {
    setErrors({});
    setEditing({ ...address });
  };

  const setField = (field: keyof AddressForm, value: string | boolean) => {
    setEditing((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = () => {
    if (!editing) return;
    const validationErrors = validateAddress(editing);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const isNew = !editing.id;
    persist(saveAddress(addresses, editing, `ADDR-${Date.now()}`), isNew ? 'Address added' : 'Address updated');
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    persist(removeAddress(addresses, toDelete.id), 'Address deleted');
    setToDelete(null);
  };

  // ---------- Form (add / edit) ----------
  if (editing) {
    const isEditingDefault = !!editing.id && addresses.find((a) => a.id === editing.id)?.isDefault === true;

    const renderField = (
      field: 'label' | 'fullName' | 'phone' | 'address' | 'city' | 'postalCode',
      label: string,
      keyboardType: 'default' | 'phone-pad' | 'number-pad' = 'default'
    ) => (
      <View>
        <TextInput
          mode="outlined"
          label={label}
          value={editing[field]}
          onChangeText={(text) => setField(field, text)}
          error={!!errors[field]}
          keyboardType={keyboardType}
        />
        <HelperText type="error" visible={!!errors[field]}>
          {errors[field] ?? ''}
        </HelperText>
      </View>
    );

    return (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title={editing.id ? 'Edit address' : 'Add address'} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {renderField('label', 'Name (Home, Office...)')}
          {renderField('fullName', 'Full name')}
          {renderField('phone', 'Phone number', 'phone-pad')}
          {renderField('address', 'Street address')}
          {renderField('city', 'City')}
          {renderField('postalCode', 'Postal code', 'number-pad')}

          <View style={styles.defaultRow}>
            <Text style={styles.defaultLabel}>
              {isEditingDefault ? 'This is your default address' : 'Make this my default address'}
            </Text>
            <Switch
              value={editing.isDefault || isEditingDefault || addresses.length === 0}
              disabled={isEditingDefault || addresses.length === 0}
              onValueChange={(value) => setField('isDefault', value)}
              accessibilityLabel="Default address"
            />
          </View>

          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save address
          </Button>
          <Button mode="text" onPress={() => setEditing(null)}>
            Cancel
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ---------- List ----------
  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Addresses" />
      <ScrollView contentContainerStyle={styles.content}>
        {!loading && addresses.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={72} color={colors.iconMuted} />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.muted}>Add one to fill in Checkout faster.</Text>
          </View>
        ) : null}

        {addresses.map((address) => (
          <Card key={address.id} style={styles.card} elevation={1}>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>{address.label}</Text>
                {address.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardText}>{address.fullName}</Text>
              <Text style={styles.cardText}>{address.phone}</Text>
              <Text style={styles.cardText}>
                {address.address}, {address.city} {address.postalCode}
              </Text>
              <View style={styles.cardActions}>
                {!address.isDefault ? (
                  <Button compact onPress={() => persist(setDefaultAddress(addresses, address.id), 'Default address changed')}>
                    Set default
                  </Button>
                ) : null}
                <Button compact onPress={() => startEdit(address)}>
                  Edit
                </Button>
                <Button compact textColor={colors.errorText} onPress={() => setToDelete(address)}>
                  Delete
                </Button>
              </View>
            </View>
          </Card>
        ))}

        <Button mode="contained" icon="plus" onPress={startAdd} style={styles.button}>
          Add address
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={!!toDelete} onDismiss={() => setToDelete(null)}>
          <Dialog.Title>Delete address</Dialog.Title>
          <Dialog.Content>
            <Text>Delete your “{toDelete?.label}” address?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setToDelete(null)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor={colors.errorText}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={2500}>
        {message ?? ''}
      </Snackbar>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 12 },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  card: { borderRadius: 12, marginBottom: 12 },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 8 },
  cardText: { fontSize: 14, color: colors.textBody, marginTop: 2 },
  defaultBadge: { backgroundColor: colors.primaryContainer, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primaryText },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, flexWrap: 'wrap' },
  defaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  defaultLabel: { flex: 1, fontSize: 14, color: colors.textBody, marginRight: 12 },
  button: { marginTop: 8, borderRadius: 8 },
});
