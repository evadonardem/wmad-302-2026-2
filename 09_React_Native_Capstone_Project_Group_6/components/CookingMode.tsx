/**
 * Cooking mode - one instruction step at a time with Previous / Next buttons.
 * - big readable text, a progress bar and "Step 2 of 8"
 * - the optional timer of each step (StepTimer). Timers of other steps keep
 *   running while you move on, they are only hidden.
 * - "Keep screen awake" switch (on by default) so the phone doesn't lock
 *   while your hands are covered in flour. It is switched off again when you
 *   leave this screen.
 * - an Ingredients button that opens the list in a popup.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  Portal,
  ProgressBar,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { StepTimer } from '@/components/StepTimer';
import { EmptyState } from '@/components/CommonComponents';
import { clampStep, stepLabel, stepProgress } from '@/utils/cookingMode';
import type { Recipe } from '@/types/recipe';

const KEEP_AWAKE_TAG = 'cooking-mode';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
  /** Bottom safe-area inset so the buttons clear the phone's gesture bar */
  bottomInset?: number;
}

export function CookingMode({ recipe, onExit, bottomInset = 0 }: CookingModeProps) {
  const { colors } = useTheme();
  const steps = recipe.instructions;
  const count = steps.length;

  const [index, setIndex] = useState(0);
  const [keepAwake, setKeepAwake] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);

  // Keep the screen on while the switch is on; always release it when leaving
  useEffect(() => {
    if (!keepAwake) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    return () => {
      Promise.resolve(deactivateKeepAwake(KEEP_AWAKE_TAG)).catch(() => undefined);
    };
  }, [keepAwake]);

  const current = clampStep(index, count);
  const isFirst = current === 0;
  const isLast = current === count - 1;

  const goNext = () => {
    if (isLast) onExit();
    else setIndex(current + 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={onExit} accessibilityLabel="Exit cooking mode" />
        <Appbar.Content title={recipe.name} subtitle="Cooking mode" />
        <Appbar.Action
          icon="format-list-bulleted"
          onPress={() => setShowIngredients(true)}
          accessibilityLabel="Show ingredients"
        />
      </Appbar.Header>

      {count === 0 ? (
        <EmptyState
          icon="chef-hat"
          title="No steps for this recipe"
          message="This recipe has no instructions to follow."
          actionLabel="Go back"
          onAction={onExit}
        />
      ) : (
        <>
          <View style={styles.progress}>
            <Text variant="titleMedium" style={{ color: colors.primary }}>
              {stepLabel(current, count)}
            </Text>
            <ProgressBar progress={stepProgress(current, count)} style={styles.bar} />
          </View>

          <ScrollView contentContainerStyle={styles.stepArea}>
            <Text variant="headlineSmall" style={[styles.stepText, { color: colors.onSurface }]}>
              {steps[current]}
            </Text>

            {/* Every step's timer stays mounted so a running timer isn't lost */}
            {steps.map((step, i) => (
              <View key={`${i}-${step.slice(0, 12)}`} style={i === current ? undefined : styles.hidden}>
                <StepTimer text={step} />
              </View>
            ))}
          </ScrollView>

          <View style={[styles.bottom, { paddingBottom: bottomInset + 16 }]}>
            <View style={styles.awakeRow}>
              <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
                Keep screen awake
              </Text>
              <Switch
                value={keepAwake}
                onValueChange={setKeepAwake}
                color={colors.primary}
                accessibilityLabel="Keep screen awake"
              />
            </View>
            <View style={styles.buttons}>
              <Button
                mode="outlined"
                icon="chevron-left"
                onPress={() => setIndex(current - 1)}
                disabled={isFirst}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Previous
              </Button>
              <Button
                mode="contained"
                icon={isLast ? 'check' : 'chevron-right'}
                onPress={goNext}
                style={styles.button}
                contentStyle={[styles.buttonContent, !isLast && styles.reverse]}
              >
                {isLast ? 'Finish' : 'Next'}
              </Button>
            </View>
          </View>
        </>
      )}

      <Portal>
        <Dialog
          visible={showIngredients}
          onDismiss={() => setShowIngredients(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Ingredients</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              {recipe.ingredients.map((ingredient, i) => (
                <Text key={`${ingredient}-${i}`} variant="bodyLarge" style={styles.ingredient}>
                  • {ingredient}
                </Text>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowIngredients(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progress: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  bar: { height: 8, borderRadius: 4 },
  stepArea: { padding: 20, gap: 20, flexGrow: 1, justifyContent: 'center' },
  stepText: { lineHeight: 36 },
  hidden: { display: 'none' },
  bottom: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  awakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buttons: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, borderRadius: 999 },
  buttonContent: { height: 52 },
  reverse: { flexDirection: 'row-reverse' },
  dialog: { borderRadius: 24 },
  dialogScroll: { maxHeight: 320, paddingHorizontal: 20 },
  ingredient: { paddingVertical: 6 },
});
