/**
 * Error Boundary - catches rendering errors below it and shows a friendly screen
 * instead of a crash. "Try again" re-renders the children.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Logo } from '@/components/CommonComponents';
import { colors } from '@/constants/colors';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  // Called with the error so it can be logged/reported
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <Logo size={120} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          Sorry, the app ran into a problem. Please try again.
        </Text>
        <Button mode="contained" onPress={this.reset} style={styles.button}>
          Try again
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
  },
});