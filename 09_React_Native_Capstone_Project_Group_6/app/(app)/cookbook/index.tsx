/**
 * My Cookbook - route: /cookbook
 * Hub with three cards: Collections, Meal Plan and Shopping List.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Appbar, Card, List, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCookbook } from '@/context/CookbookContext';
import { getWeekDays, toDateKey } from '@/utils/cookbook';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function CookbookHubScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { collections, mealPlan, shopping } = useCookbook();

  const plannedThisWeek = useMemo(() => {
    const keys = new Set(getWeekDays(new Date()).map(toDateKey));
    return mealPlan.filter((meal) => keys.has(meal.date)).length;
  }, [mealPlan]);
  const toBuy = shopping.filter((item) => !item.checked).length;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/profile');
  };

  const icon = (name: IconName) =>
    function SectionIcon(props: { style?: object }) {
      return <MaterialCommunityIcons name={name} size={28} color={colors.primary} style={props.style} />;
    };
  const chevron = function Chevron(props: { style?: object }) {
    return (
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} style={props.style} />
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="My Cookbook" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text variant="bodyMedium" style={[styles.intro, { color: colors.onSurfaceVariant }]}>
          Organize recipes, plan your week and shop for what you need.
        </Text>

        <Card style={styles.card} elevation={1}>
          <List.Item
            title="Collections"
            description={`${collections.length} ${collections.length === 1 ? 'collection' : 'collections'}`}
            left={icon('folder-multiple-outline')}
            right={chevron}
            onPress={() => router.push('/(app)/cookbook/collections')}
          />
        </Card>
        <Card style={styles.card} elevation={1}>
          <List.Item
            title="Meal plan"
            description={`${plannedThisWeek} ${plannedThisWeek === 1 ? 'meal' : 'meals'} planned this week`}
            left={icon('calendar-week')}
            right={chevron}
            onPress={() => router.push('/(app)/cookbook/meal-plan')}
          />
        </Card>
        <Card style={styles.card} elevation={1}>
          <List.Item
            title="Shopping list"
            description={`${toBuy} ${toBuy === 1 ? 'item' : 'items'} to buy`}
            left={icon('cart-outline')}
            right={chevron}
            onPress={() => router.push('/(app)/cookbook/shopping-list')}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  intro: { marginBottom: 16 },
  card: { marginBottom: 12 },
});
