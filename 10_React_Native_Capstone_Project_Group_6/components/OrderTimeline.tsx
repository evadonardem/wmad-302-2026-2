/**
 * OrderTimeline - vertical list of tracking steps (placed -> processing -> shipped -> delivered)
 * Used on the Order Detail screen.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';
import { formatTrackingTime, type TrackingStep } from '@/utils/tracking';

interface Props {
  steps: TrackingStep[];
}

export function OrderTimeline({ steps }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = step.state === 'done';
        const current = step.state === 'current';
        const time = formatTrackingTime(step.at);
        return (
          <View
            key={step.key}
            style={styles.step}
            accessible
            accessibilityLabel={`${step.label}, ${done ? 'done' : current ? 'in progress' : 'not yet'}${time ? `, ${time}` : ''}`}
          >
            <View style={styles.rail}>
              <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                {done && <MaterialCommunityIcons name="check" size={14} color={colors.onPrimary} />}
              </View>
              {!isLast && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <View style={styles.text}>
              <Text style={[styles.label, step.state === 'upcoming' && styles.labelUpcoming]}>{step.label}</Text>
              <Text style={styles.description}>{step.description}</Text>
              {!!time && <Text style={styles.time}>{time}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    step: { flexDirection: 'row', gap: 12, minHeight: 56 },
    rail: { alignItems: 'center', width: 22 },
    dot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotDone: { backgroundColor: colors.success, borderColor: colors.success },
    dotCurrent: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
    line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
    lineDone: { backgroundColor: colors.success },
    text: { flex: 1, paddingBottom: 14 },
    label: { fontSize: 14, fontWeight: '700', color: colors.text },
    labelUpcoming: { color: colors.textFaint, fontWeight: '600' },
    description: { fontSize: 13, color: colors.textMuted },
    time: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  });
