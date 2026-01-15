import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';

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
};

type CampusInfoCardProps = {
    campus: CampusData;
    onEdit?: () => void;
    style?: ViewStyle;
};

export default function CampusInfoCard({ campus, onEdit, style }: CampusInfoCardProps) {
    const theme = useTheme();

    return (
        <Card style={[styles.card, style]}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={styles.campusName}>
                            {campus.nome}
                        </Text>
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
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: '#E8F5E9' }]}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: '#4CAF50' }]}>
                            {campus.quantidadeEstacionamentos}
                        </Text>
                        <Text variant="bodySmall" style={styles.statLabel} numberOfLines={1}>
                            Estacionamentos
                        </Text>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: '#E3F2FD' }]}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: '#2196F3' }]}>
                            {campus.totalVagas}
                        </Text>
                        <Text variant="bodySmall" style={styles.statLabel} numberOfLines={1}>
                            Vagas
                        </Text>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: '#F3E5F5' }]}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: '#9C27B0' }]}>
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
