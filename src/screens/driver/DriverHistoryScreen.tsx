import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';

export default function DriverHistoryScreen() {
    const theme = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <AppHeader title="Histórico" />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Icon name="history" size={64} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleLarge" style={{ marginTop: 16, marginBottom: 8, color: theme.colors.onSurface }}>
                    Em breve
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    O histórico de movimentações dos seus veículos será exibido aqui em breve.
                </Text>
            </View>
        </View>
    );
}
