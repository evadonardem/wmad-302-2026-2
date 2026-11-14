/**
 * Shopping List - route: /cookbook/shopping-list
 * - add items by hand, or add all the ingredients of a recipe
 * - tick items off while shopping; ticked items move to the bottom
 * - share the list as text through the phone's share sheet
 */
import React, { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Appbar,
  Button,
  Checkbox,
  Dialog,
  IconButton,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useCookbook } from '@/context/CookbookContext';
import { useRecipeCatalog } from '@/hooks';
import { EmptyState } from '@/components/CommonComponents';
import { OfflineBanner } from '@/components/OfflineBanner';
import { RecipePickerDialog } from '@/components/RecipePickerDialog';
import { buildShoppingMessage } from '@/utils/cookbook';

type DialogName = 'pick' | 'clear' | null;

export default function ShoppingListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    shopping,
    addRecipesToShopping,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedShopping,
    clearShopping,
  } = useCookbook();
  const { recipes } = useRecipeCatalog();

  const [text, setText] = useState('');
  const [dialog, setDialog] = useState<DialogName>(null);
  const [message, setMessage] = useState<string | null>(null);

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  // Not-yet-bought items first (stable order inside each group)
  const sorted = useMemo(
    () => [...shopping.filter((i) => !i.checked), ...shopping.filter((i) => i.checked)],
    [shopping]
  );
  const doneCount = shopping.filter((i) => i.checked).length;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/cookbook');
  };

  const addManual = () => {
    if (!text.trim()) return;
    addShoppingItem(text);
    setText('');
  };

  const handleShare = async () => {
    try {
      await Share.share({ title: 'Shopping list', message: buildShoppingMessage(shopping) });
    } catch {
      setMessage("Sharing isn't available on this device");
    }
  };

  /** "for Beef Stew, Pizza +1" under an item */
  const sourceLabel = (recipeIds: number[]): string | null => {
    if (recipeIds.length === 0) return null;
    const names = recipeIds.map((id) => byId.get(id)?.name ?? `Recipe #${id}`);
    const shown = names.slice(0, 2).join(', ');
    return names.length > 2 ? `${shown} +${names.length - 2}` : shown;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="Shopping list" />
        <Appbar.Action
          icon="share-variant"
          onPress={handleShare}
          disabled={shopping.length === 0}
          accessibilityLabel="Share shopping list"
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <OfflineBanner />

        <TextInput
          mode="outlined"
          label="Add an item"
          value={text}
          onChangeText={setText}
          onSubmitEditing={addManual}
          returnKeyType="done"
          right={<TextInput.Icon icon="plus" onPress={addManual} accessibilityLabel="Add item" />}
        />

        <View style={styles.actions}>
          <Button mode="contained-tonal" icon="silverware-fork-knife" onPress={() => setDialog('pick')}>
            Add from a recipe
          </Button>
        </View>

        {shopping.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Your list is empty"
            message="Type an item above, add a recipe's ingredients, or plan a week of meals and add them all at once."
          />
        ) : (
          <>
            <Text variant="labelLarge" style={[styles.summary, { color: colors.onSurfaceVariant }]}>
              {doneCount} of {shopping.length} done
            </Text>
            {sorted.map((item) => {
              const source = sourceLabel(item.recipeIds);
              return (
                <View key={item.id} style={styles.itemRow}>
                  <Checkbox
                    status={item.checked ? 'checked' : 'unchecked'}
                    onPress={() => toggleShoppingItem(item.id)}
                  />
                  <View style={styles.flex}>
                    <Text
                      variant="bodyLarge"
                      onPress={() => toggleShoppingItem(item.id)}
                      style={[{ color: colors.onSurface }, item.checked && styles.done]}
                    >
                      {item.name}
                    </Text>
                    {source && (
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                        {source}
                      </Text>
                    )}
                  </View>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removeShoppingItem(item.id)}
                    accessibilityLabel={`Remove ${item.name}`}
                  />
                </View>
              );
            })}

            <View style={styles.footer}>
              <Button mode="outlined" icon="check-all" onPress={clearCheckedShopping} disabled={doneCount === 0}>
                Remove ticked items
              </Button>
              <Button mode="text" textColor={colors.error} onPress={() => setDialog('clear')}>
                Clear list
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <RecipePickerDialog
        visible={dialog === 'pick'}
        title="Add ingredients from"
        recipes={recipes}
        onDismiss={() => setDialog(null)}
        onPick={(recipe) => {
          addRecipesToShopping([recipe]);
          setDialog(null);
          setMessage(`Added ingredients of ${recipe.name}`);
        }}
      />

      <Portal>
        <Dialog visible={dialog === 'clear'} onDismiss={() => setDialog(null)} style={styles.dialog}>
          <Dialog.Title>Clear list</Dialog.Title>
          <Dialog.Content>
            <Text>{`Remove all ${shopping.length} items from your shopping list?`}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button
              onPress={() => {
                clearShopping();
                setDialog(null);
              }}
            >
              Clear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={2500}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16 },
  actions: { flexDirection: 'row', marginTop: 12 },
  summary: { marginTop: 20, marginBottom: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  done: { textDecorationLine: 'line-through', opacity: 0.5 },
  footer: { marginTop: 20, gap: 8, alignItems: 'flex-start' },
  dialog: { borderRadius: 24 },
});
