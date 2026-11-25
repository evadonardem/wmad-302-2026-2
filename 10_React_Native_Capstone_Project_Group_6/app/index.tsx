/**
 * Entry route ("/")
 * Expo Router needs a screen for the root URL. We wait for the saved session to load
 * (isLoading), then send the user to Home if logged in, otherwise to Login.
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useAppTheme();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return <Redirect href={isAuthenticated ? '/(app)/(tabs)/home' : '/(auth)/login'} />;
}