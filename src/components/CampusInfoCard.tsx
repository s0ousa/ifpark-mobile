import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';

type CampusData = {
    id: string;
    nome: string;
    endereco: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        complemento?: string | null;
        cep: string;
    };
    quantidadeEstacionamentos: number;
    totalVagas: number;
    totalUsuarios: number;
    ativo?: boolean;
};

type CampusInfoCardProps = {
    campus: CampusData;
    onEdit?: () => void;
    onPress?: () => void;
    style?: ViewStyle;
};

export default function CampusInfoCard({ campus, onEdit, onPress, style }: CampusInfoCardProps) {
    const theme = useTheme();

    const isInactive = campus.ativo === false;

    // Define colors based on activity status
    const colors = {
        estacionamentos: {
            bg: isInactive ? '#F5F5F5' : '#E8F5E9',
            text: isInactive ? '#9E9E9E' : '#4CAF50'
        },
        vagas: {
            bg: isInactive ? '#F5F5F5' : '#E3F2FD',
            text: isInactive ? '#9E9E9E' : '#2196F3'
        },
        usuarios: {
            bg: isInactive ? '#F5F5F5' : '#F3E5F5',
            text: isInactive ? '#9E9E9E' : '#9C27B0'
        }
    };

    const cardContent = (
        <Card style={[styles.card, style, isInactive && { opacity: 0.8 }]}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text variant="titleMedium" style={[styles.campusName, isInactive && { color: '#757575' }]}>
                                {campus.nome}
                            </Text>
                            {isInactive && (
                                <View style={{ backgroundColor: '#E0E0E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text variant="labelSmall" style={{ color: '#757575', fontSize: 10 }}>INATIVO</Text>
                                </View>
                            )}
                        </View>
                        <Text variant="bodySmall" style={styles.campusAddress}>
                            {campus.endereco.logradouro}, {campus.endereco.numero} - {campus.endereco.bairro}, {campus.endereco.cidade}/{campus.endereco.estado}
                        </Text>
                    </View>
                    {onEdit && (
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={onEdit}
                        />
                    )}
                    {onPress && (
                        <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    )}
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: colors.estacionamentos.bg }]}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: colors.estacionamentos.text }]}>
                            {campus.quantidadeEstacionamentos}
                        </Text>
                        <Text variant="bodySmall" style={styles.statLabel} numberOfLines={1}>
                            Estacionamentos
                        </Text>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: colors.vagas.bg }]}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: colors.vagas.text }]}>
                            {campus.totalVagas}
                        </Text>
                        <Text variant="bodySmall" style={styles.statLabel} numberOfLines={1}>
                            Vagas
                        </Text>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: colors.usuarios.bg }]}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: colors.usuarios.text }]}>
                            {campus.totalUsuarios}
                        </Text>
                        <Text variant="bodySmall" style={styles.statLabel} numberOfLines={1}>
                            Usuários
                        </Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={1}>
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    campusName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    campusAddress: {
        color: '#666',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statValue: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        textAlign: 'center',
        color: '#666',
    },
});

export type { CampusData };
