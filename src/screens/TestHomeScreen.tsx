import React from 'react';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

export default function TestHomeScreen({ navigation }: any) {
    const theme = useTheme();

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
                onPress={() => navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })}
                style={{ backgroundColor: theme.colors.error }}
            >
                Sair
            </Button>
        </View>
    );
}
