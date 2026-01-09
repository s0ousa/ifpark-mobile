import React from 'react';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useAuthStore } from '../store/useAuthStore';

export default function TestHomeScreen() {
    const theme = useTheme();
    const signOut = useAuthStore((state) => state.signOut);

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
            <Text variant="headlineMedium" style={{ marginBottom: 20, color: theme.colors.primary }}>
                Bem-vindo ao IfPark!
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 40 }}>
                Você realizou o login com sucesso.
            </Text>

            <Button
                mode="contained"
                onPress={handleLogout}
                style={{ backgroundColor: theme.colors.error }}
            >
                Sair
            </Button>
        </View>
    );
}
