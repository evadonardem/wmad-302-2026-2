/**
 * Error boundary - catches render errors and shows a friendly message with a retry button.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <View style={styles.container} testID="error-boundary-fallback">
        <Text variant="displaySmall">😵</Text>
        <Text variant="titleLarge" style={styles.title}>
          Oops, something went wrong
        </Text>
        <Text variant="bodyMedium" style={styles.message}>
          The app ran into an unexpected problem. You can try again.
        </Text>
        <Button mode="contained" onPress={this.reset} style={styles.button}>
          Try again
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { marginTop: 12, fontWeight: '700', textAlign: 'center' },
  message: { marginTop: 8, textAlign: 'center' },
  button: { marginTop: 24 },
});
