import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export type SettingsAction = {
  icon: ReactNode;
  name: string;
  onPress?: () => void;
};

export default function GeneralSettings({ actions }: { actions: SettingsAction[] }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* TODO 12: one pressable row per action */}
      {actions.map((item, index) => (
        <Pressable
          key={item.name}
          onPress={item.onPress ?? (() => {})}
          style={({ pressed }) => [
            styles.actionRow,
            index < actions.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.colors.border,
            },
            pressed && { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.background }]}>{item.icon}</View>
          <Text style={[styles.actionName, { color: theme.colors.text }]}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionName: { flex: 1, fontSize: 16, fontWeight: '600' },
});