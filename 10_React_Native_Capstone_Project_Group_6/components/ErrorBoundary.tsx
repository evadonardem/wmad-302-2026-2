/**
 * ErrorBoundary - catches a crash in any screen below it and shows a friendly
 * "Something went wrong" screen instead of a blank page. "Try again" clears the error
 * and shows the screens again.
 *
 * React only allows error boundaries to be CLASS components (there is no hook for it).
 * It uses plain React Native views (not Paper) so it still works if the crash came
 * from the theme/provider code itself.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional hook for reporting (e.g. to a crash service). Called with the error. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  /** React calls this when a child throws: whatever we return becomes the new state. */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container} accessibilityRole="alert">
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app ran into a problem. You can try again; if it keeps happening, restart the app.
        </Text>
        {__DEV__ ? <Text style={styles.details}>{error.message}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={this.reset} accessibilityRole="button">
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  title: { fontSize: 22, fontWeight: '700', color: '#202124', marginBottom: 8 },
  message: { fontSize: 15, color: '#5F6368', textAlign: 'center', marginBottom: 12 },
  details: { fontSize: 12, color: '#D93025', textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#1A73E8', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
