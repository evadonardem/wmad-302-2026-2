
/**
 * Index Screen - Marketplace App Entry Route
 * Redirects users based on their authentication status.
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // Redirect authenticated users to the Marketplace Home
  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  // Redirect unauthenticated users to Login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
