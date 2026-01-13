import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';

export default function PorterDriversScreen() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Motoristas" />
            <View style={styles.content}>
                <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
                    Em breve
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    A funcionalidade de gerenciamento de motoristas será implementada em breve.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
});
