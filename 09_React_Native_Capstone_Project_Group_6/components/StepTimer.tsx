/**
 * StepTimer - optional cooking timer for one recipe step.
 * Looks for a time in the step text ("simmer for 30 minutes"). If there is one,
 * it shows a "Start timer" button; otherwise it shows nothing.
 * The countdown is based on the end time (not on counting ticks), so it stays
 * correct even if the app is briefly in the background.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import { describeDuration, formatTimer, parseStepDuration } from '@/utils/cookingTimer';

type Status = 'idle' | 'running' | 'paused' | 'done';

export function StepTimer({ text }: { text: string }) {
  const theme = useTheme();
  const duration = useMemo(() => parseStepDuration(text), [text]);
  const total = duration?.seconds ?? 0;

  const [status, setStatus] = useState<Status>('idle');
  const [remaining, setRemaining] = useState(total);
  const endAt = useRef(0); // time (ms) when the timer should reach zero

  // Tick while running
  useEffect(() => {
    if (status !== 'running') return undefined;
    const id = setInterval(() => {
      const left = Math.ceil((endAt.current - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        setStatus('done');
        Vibration.vibrate([0, 500, 300, 500]);
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  // Stop vibrating if the screen is closed
  useEffect(() => () => Vibration.cancel(), []);

  if (!duration) return null;

  const start = () => {
    endAt.current = Date.now() + remaining * 1000;
    setStatus('running');
  };

  const pause = () => {
    setRemaining(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)));
    setStatus('paused');
  };

  const reset = () => {
    Vibration.cancel();
    setRemaining(total);
    setStatus('idle');
  };

  if (status === 'idle') {
    return (
      <Button
        mode="outlined"
        compact
        icon="timer-outline"
        onPress={start}
        style={styles.startButton}
        accessibilityLabel={`Start ${describeDuration(total)} timer`}
      >
        {`Start timer · ${describeDuration(total)}`}
      </Button>
    );
  }

  if (status === 'done') {
    return (
      <View style={[styles.box, { backgroundColor: theme.colors.errorContainer }]}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>
          Time&apos;s up! ⏰
        </Text>
        <Button compact onPress={reset}>
          Dismiss
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.box, { backgroundColor: theme.colors.primaryContainer }]}>
      <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
        {formatTimer(remaining)}
      </Text>
      <View style={styles.actions}>
        <IconButton
          icon={status === 'running' ? 'pause' : 'play'}
          size={22}
          iconColor={theme.colors.primary}
          onPress={status === 'running' ? pause : start}
          accessibilityLabel={status === 'running' ? 'Pause timer' : 'Resume timer'}
        />
        <IconButton
          icon="restart"
          size={22}
          iconColor={theme.colors.onSurfaceVariant}
          onPress={reset}
          accessibilityLabel="Reset timer"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  startButton: { alignSelf: 'flex-start' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
  },
  actions: { flexDirection: 'row' },
});
