import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';

export default function AdminUsersScreen() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <AppHeader title="Usuários" />
            <View style={styles.content}>
                <Icon name="account-group" size={64} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={styles.text}>
                    Tela de Usuários
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Em desenvolvimento...
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    text: {
        marginTop: 16,
        color: '#666',
    },
    subtitle: {
        marginTop: 8,
        color: '#999',
    },
});
