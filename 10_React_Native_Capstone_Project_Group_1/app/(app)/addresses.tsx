/**
 * Addresses - add, edit, delete and choose a default delivery address.
 */
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Checkbox, FAB, HelperText, Modal, Portal, TextInput, useTheme } from 'react-native-paper';
import { useAddresses } from '@/context/AddressContext';
import { Address, AddressInput } from '@/types/user';
import { ConfirmDialog, EmptyState, LoadingView } from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { FieldErrors, hasErrors, validateAddress } from '@/utils/validators';

const EMPTY_FORM: AddressInput = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  city: '',
  postalCode: '',
  isDefault: false,
};

type TextField = 'label' | 'fullName' | 'phone' | 'line1' | 'city' | 'postalCode';

export default function AddressesScreen() {
  const theme = useTheme();
  const { addresses, isHydrated, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAddresses();

  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<AddressInput>>({});
  const [toDelete, setToDelete] = useState<Address | null>(null);

  if (!isHydrated) return <LoadingView message="Loading addresses..." />;

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormVisible(true);
  };

  const openEdit = (address: Address) => {
    const { id, userId: _userId, ...input } = address;
    setEditingId(id);
    setForm(input);
    setErrors({});
    setFormVisible(true);
  };

  const setField = (field: TextField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = () => {
    const validation = validateAddress(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    const clean: AddressInput = {
      ...form,
      label: form.label.trim() || 'Address',
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
    };
    if (editingId) updateAddress(editingId, clean);
    else addAddress(clean);
    setFormVisible(false);
  };

  const input = (key: TextField, label: string, keyboardType?: 'phone-pad') => (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={form[key]}
        onChangeText={(v) => setField(key, v)}
        error={!!errors[key]}
        keyboardType={keyboardType}
        dense
      />
      <HelperText type="error" visible={!!errors[key]}>
        {errors[key] ?? ''}
      </HelperText>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        contentContainerStyle={addresses.length === 0 ? styles.emptyContent : styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <EmptyState
            icon="map-marker-outline"
            title="No saved addresses"
            message="Add an address to check out faster."
            actionLabel="Add address"
            onAction={openNew}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card} elevation={1}>
            <Card.Content>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>{item.label}</Text>
                {item.isDefault && (
                  <View style={[styles.defaultTag, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={[styles.defaultText, { color: theme.colors.primary }]}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: theme.colors.onSurface }}>{item.fullName}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.line1}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {item.city} {item.postalCode}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.phone}</Text>
            </Card.Content>
            <Card.Actions>
              {!item.isDefault && <Button onPress={() => setDefaultAddress(item.id)}>Set default</Button>}
              <Button onPress={() => openEdit(item)}>Edit</Button>
              <Button textColor={theme.colors.error} onPress={() => setToDelete(item)}>
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      {addresses.length > 0 && <FAB icon="plus" label="Add address" style={styles.fab} onPress={openNew} />}

      <Portal>
        <Modal
          visible={formVisible}
          onDismiss={() => setFormVisible(false)}
          contentContainerStyle={[styles.sheet, { backgroundColor: theme.colors.surface }]}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>
                {editingId ? 'Edit address' : 'New address'}
              </Text>
              {input('label', 'Label (Home, Work...)')}
              {input('fullName', 'Full name')}
              {input('phone', 'Phone number', 'phone-pad')}
              {input('line1', 'Street address')}
              {input('city', 'City')}
              {input('postalCode', 'Postal code')}
              <Checkbox.Item
                label="Make this my default address"
                status={form.isDefault ? 'checked' : 'unchecked'}
                onPress={() => setForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                position="leading"
                labelStyle={styles.checkboxLabel}
              />
              <View style={styles.sheetActions}>
                <Button mode="outlined" onPress={() => setFormVisible(false)} style={styles.sheetButton}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSave} style={styles.sheetButton}>
                  Save
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete address"
        message={`Delete "${toDelete?.label ?? ''}"?`}
        confirmLabel="Delete"
        destructive
        onDismiss={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) removeAddress(toDelete.id);
          setToDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: 96, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' },
  emptyContent: { flexGrow: 1 },
  card: { borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: 16, fontWeight: '700', marginRight: spacing.sm },
  defaultTag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 8 },
  defaultText: { fontSize: 11, fontWeight: '700' },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg },
  sheet: { margin: spacing.lg, padding: spacing.lg, borderRadius: 16, maxHeight: '90%', alignSelf: 'center', width: '92%', maxWidth: 520 },
  sheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  checkboxLabel: { textAlign: 'left', fontSize: 14 },
  sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  sheetButton: { flex: 1 },
});
