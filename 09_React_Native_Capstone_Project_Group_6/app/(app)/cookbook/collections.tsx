/**
 * Collections - route: /cookbook/collections
 * Custom folders of recipes (e.g. "Weeknight dinners").
 * One screen, two views: the list of collections, and the inside of one
 * collection (rename, delete, add and remove recipes).
 */
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Appbar,
  Button,
  Card,
  Dialog,
  FAB,
  IconButton,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCookbook } from '@/context/CookbookContext';
import { useRecipeCatalog } from '@/hooks';
import { EmptyState } from '@/components/CommonComponents';
import { OfflineBanner } from '@/components/OfflineBanner';
import { RecipePickerDialog } from '@/components/RecipePickerDialog';

type DialogName = 'create' | 'rename' | 'delete' | 'pick' | null;

export default function CollectionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    collections,
    createCollection,
    renameCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
  } = useCookbook();
  const { recipes } = useRecipeCatalog();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const selected = collections.find((c) => c.id === selectedId) ?? null;
  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const goBack = () => {
    if (selected) setSelectedId(null);
    else if (router.canGoBack()) router.back();
    else router.replace('/(app)/cookbook');
  };

  const openCreate = () => {
    setName('');
    setDialog('create');
  };
  const openRename = () => {
    setName(selected?.name ?? '');
    setDialog('rename');
  };

  const submitName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (dialog === 'create') {
      setSelectedId(createCollection(trimmed));
    } else if (dialog === 'rename' && selected) {
      renameCollection(selected.id, trimmed);
    }
    setDialog(null);
  };

  const confirmDelete = () => {
    if (selected) {
      deleteCollection(selected.id);
      setMessage(`Deleted "${selected.name}"`);
    }
    setSelectedId(null);
    setDialog(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={selected ? selected.name : 'Collections'} />
        {selected && (
          <>
            <Appbar.Action icon="pencil-outline" onPress={openRename} accessibilityLabel="Rename collection" />
            <Appbar.Action icon="trash-can-outline" onPress={() => setDialog('delete')} accessibilityLabel="Delete collection" />
          </>
        )}
      </Appbar.Header>

      {selected ? (
        /* ---------- inside one collection ---------- */
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <OfflineBanner />
          <Button mode="contained" icon="plus" onPress={() => setDialog('pick')} style={styles.addButton}>
            Add recipes
          </Button>
          {selected.recipeIds.length === 0 ? (
            <EmptyState
              icon="silverware-fork-knife"
              title="Nothing here yet"
              message="Add recipes here, or use the Collection button on any recipe."
            />
          ) : (
            selected.recipeIds.map((id) => {
              const recipe = byId.get(id);
              return (
                <Card key={id} style={styles.card} elevation={1}>
                  <View style={styles.recipeRow}>
                    <TouchableOpacity
                      style={styles.recipeTap}
                      onPress={() => router.push(`/recipe/${id}`)}
                      accessibilityRole="button"
                    >
                      {recipe ? (
                        <Image source={{ uri: recipe.image }} style={styles.thumb} />
                      ) : (
                        <View style={[styles.thumb, { backgroundColor: colors.surfaceVariant }]} />
                      )}
                      <View style={styles.flex}>
                        <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.onSurface }}>
                          {recipe ? recipe.name : `Recipe #${id}`}
                        </Text>
                        {recipe && (
                          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                            {recipe.cuisine} · {recipe.difficulty}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => removeFromCollection(selected.id, id)}
                      accessibilityLabel="Remove from collection"
                    />
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      ) : (
        /* ---------- list of collections ---------- */
        <>
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}>
            {collections.length === 0 ? (
              <EmptyState
                icon="folder-plus-outline"
                title="No collections yet"
                message="Group your recipes into folders like Weeknight dinners or Party food."
                actionLabel="Create collection"
                onAction={openCreate}
              />
            ) : (
              collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  onPress={() => setSelectedId(collection.id)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${collection.name}`}
                >
                  <Card style={styles.card} elevation={1}>
                    <View style={styles.collectionRow}>
                      <MaterialCommunityIcons name="folder-outline" size={32} color={colors.primary} />
                      <View style={styles.flex}>
                        <Text variant="titleMedium" numberOfLines={1} style={{ color: colors.onSurface }}>
                          {collection.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {collection.recipeIds.length} {collection.recipeIds.length === 1 ? 'recipe' : 'recipes'}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          {collections.length > 0 && (
            <FAB
              icon="plus"
              label="New collection"
              onPress={openCreate}
              style={[styles.fab, { bottom: insets.bottom + 16 }]}
            />
          )}
        </>
      )}

      <RecipePickerDialog
        visible={dialog === 'pick'}
        title="Add a recipe"
        recipes={recipes}
        onDismiss={() => setDialog(null)}
        onPick={(recipe) => {
          if (selected) {
            addToCollection(selected.id, recipe.id);
            setMessage(`Added ${recipe.name}`);
          }
          setDialog(null);
        }}
      />

      <Portal>
        <Dialog
          visible={dialog === 'create' || dialog === 'rename'}
          onDismiss={() => setDialog(null)}
          style={styles.dialog}
        >
          <Dialog.Title>{dialog === 'rename' ? 'Rename collection' : 'New collection'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              mode="outlined"
              value={name}
              onChangeText={setName}
              onSubmitEditing={submitName}
              autoFocus
              maxLength={40}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button onPress={submitName} disabled={!name.trim()}>
              {dialog === 'rename' ? 'Save' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'delete'} onDismiss={() => setDialog(null)} style={styles.dialog}>
          <Dialog.Title>Delete collection</Dialog.Title>
          <Dialog.Content>
            <Text>{`Delete "${selected?.name ?? ''}"? The recipes themselves are not deleted.`}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button onPress={confirmDelete}>Delete</Button>
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
  card: { marginBottom: 12 },
  addButton: { marginBottom: 16 },
  collectionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  recipeRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  recipeTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  fab: { position: 'absolute', right: 16 },
  dialog: { borderRadius: 24 },
});
