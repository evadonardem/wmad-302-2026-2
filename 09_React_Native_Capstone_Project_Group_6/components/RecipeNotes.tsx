/**
 * "My notes" box on the recipe page.
 * The note is saved on the device (AsyncStorage, through CookbookContext) per
 * recipe, e.g. "Add less salt next time". Saving an empty note removes it.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useCookbook } from '@/context/CookbookContext';

interface RecipeNotesProps {
  recipeId: number;
  onMessage: (message: string) => void;
}

export function RecipeNotes({ recipeId, onMessage }: RecipeNotesProps) {
  const { colors } = useTheme();
  const { notes, setNote } = useCookbook();
  const saved = notes[recipeId] ?? '';

  // null = the user hasn't typed anything yet, so show the saved note
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? saved;
  const changed = text.trim() !== saved;

  const save = () => {
    setNote(recipeId, text);
    setDraft(null);
    onMessage(text.trim() ? 'Note saved' : 'Note removed');
  };

  return (
    <View>
      <Text variant="titleLarge" style={styles.title}>
        My notes
      </Text>
      <TextInput
        mode="outlined"
        placeholder="e.g. Add less salt next time"
        accessibilityLabel="Recipe note"
        value={text}
        onChangeText={setDraft}
        multiline
        numberOfLines={3}
        maxLength={500}
        style={styles.input}
      />
      <View style={styles.row}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {text.length}/500
        </Text>
        <Button mode="contained-tonal" icon="content-save-outline" onPress={save} disabled={!changed}>
          Save note
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 24, marginBottom: 10 },
  input: { minHeight: 90 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});
