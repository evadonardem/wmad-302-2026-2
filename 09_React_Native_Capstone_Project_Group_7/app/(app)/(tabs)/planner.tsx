/**
 * Weekly Meal Planner Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import { Card, Title, Button, TextInput as PaperTextInput } from 'react-native-paper';
import { mealPlanStorage } from '@/utils/storage';
import { APP_COLORS } from '@/constants/theme';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PlannerScreen() {
  const [mealPlan, setMealPlan] = useState<Record<string, { breakfast: string; lunch: string; dinner: string }>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [mealInput, setMealInput] = useState('');

  const loadPlan = useCallback(async () => {
    const plan = await mealPlanStorage.getPlan();
    setMealPlan(plan || {});
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const openEditModal = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', currentVal: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setMealInput(currentVal || '');
    setModalVisible(true);
  };

  const handleSaveMeal = async () => {
    const currentPlan = mealPlan || {};
    const dayData = currentPlan[selectedDay] || { breakfast: '', lunch: '', dinner: '' };
    const updated = {
      ...currentPlan,
      [selectedDay]: {
        ...dayData,
        [selectedMealType]: mealInput.trim(),
      },
    };
    setMealPlan(updated);
    await mealPlanStorage.savePlan(updated);
    setModalVisible(false);
  };

  const currentPlan = mealPlan || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Weekly Menu</Title>
        <Text style={styles.subtitle}>Curate your breakfast, lunch & dinner schedule</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {DAYS.map((day) => {
          const dayMeals = currentPlan[day] || {};
          return (
            <Card key={day} style={styles.card} elevation={1}>
              <View style={styles.dayHeader}>
                <Title style={styles.dayTitle}>{day}</Title>
              </View>
              <Card.Content style={styles.cardBody}>
                <View style={styles.mealRow}>
                  <View style={styles.mealTextGroup}>
                    <Text style={styles.mealTypeLabel}>BREAKFAST</Text>
                    <Text style={styles.mealValue}>{dayMeals.breakfast || 'Unplanned'}</Text>
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    textColor={APP_COLORS.primary}
                    style={styles.editBtn}
                    onPress={() => openEditModal(day, 'breakfast', dayMeals.breakfast)}
                  >
                    Edit
                  </Button>
                </View>

                <View style={styles.mealRow}>
                  <View style={styles.mealTextGroup}>
                    <Text style={styles.mealTypeLabel}>LUNCH</Text>
                    <Text style={styles.mealValue}>{dayMeals.lunch || 'Unplanned'}</Text>
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    textColor={APP_COLORS.primary}
                    style={styles.editBtn}
                    onPress={() => openEditModal(day, 'lunch', dayMeals.lunch)}
                  >
                    Edit
                  </Button>
                </View>

                <View style={[styles.mealRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.mealTextGroup}>
                    <Text style={styles.mealTypeLabel}>DINNER</Text>
                    <Text style={styles.mealValue}>{dayMeals.dinner || 'Unplanned'}</Text>
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    textColor={APP_COLORS.primary}
                    style={styles.editBtn}
                    onPress={() => openEditModal(day, 'dinner', dayMeals.dinner)}
                  >
                    Edit
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Text style={modalStyles.modalEyebrow}>{selectedDay.toUpperCase()}</Text>
            <Title style={modalStyles.modalTitle}>Plan {selectedMealType}</Title>
            <PaperTextInput
              label="Dish or recipe name"
              value={mealInput}
              onChangeText={setMealInput}
              style={modalStyles.input}
              mode="outlined"
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
            />
            <View style={modalStyles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                textColor={APP_COLORS.textSecondary}
                style={{ flex: 1, marginRight: 8, borderRadius: 12 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveMeal}
                buttonColor={APP_COLORS.primary}
                style={{ flex: 1, marginLeft: 8, borderRadius: 12 }}
              >
                Save Dish
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: APP_COLORS.textPrimary },
  subtitle: { fontSize: 14, color: APP_COLORS.textSecondary },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    marginBottom: 14,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  dayHeader: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#FAF9F5' },
  cardBody: { paddingTop: 8 },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  mealTextGroup: { flex: 1, paddingRight: 10 },
  mealTypeLabel: { fontSize: 10, fontWeight: '800', color: APP_COLORS.accent, letterSpacing: 1 },
  mealValue: { fontSize: 14, color: APP_COLORS.textPrimary, fontWeight: '600', marginTop: 2 },
  editBtn: { borderRadius: 10, borderColor: APP_COLORS.border },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(26, 36, 33, 0.55)', justifyContent: 'center', padding: 20 },
  content: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  modalEyebrow: { fontSize: 11, fontWeight: '800', color: APP_COLORS.accent, letterSpacing: 1.2 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: APP_COLORS.textPrimary, marginBottom: 16 },
  input: { backgroundColor: APP_COLORS.surfaceElevated, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
});