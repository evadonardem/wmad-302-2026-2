/**
 * ErrorBoundary - catches render errors anywhere below it and shows a friendly
 * fallback instead of a white screen.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Called after the user taps "Try again" and the boundary resets */
  onReset?: () => void;
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

  handleReset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container} accessibilityRole="alert">
        <MaterialCommunityIcons name="alert-circle-outline" size={72} color="#C62828" />
        <Text style={styles.title}>Oops, something went wrong</Text>
        <Text style={styles.message}>
          The app ran into an unexpected problem. Please try again - your cart is safe.
        </Text>
        <Button mode="contained" onPress={this.handleReset} style={styles.button}>
          Try again
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFF8F1' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 16, color: '#2B1B17', textAlign: 'center' },
  message: { fontSize: 14, marginTop: 8, color: '#6B5750', textAlign: 'center' },
  button: { marginTop: 24 },
});
