import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';

type UserData = {
    id: string;
    email: string;
    papel: string;
    pessoa: {
        id: string;
        nome: string;
        cpf: string;
        matricula: string | null;
        tipo: string;
        status: string;
        telefone: string;
    };
    campus: {
        id: string;
        nome: string;
    };
};

type UserCardProps = {
    user: UserData;
    onPress?: () => void;
};

export default function UserCard({ user, onPress }: UserCardProps) {
    const theme = useTheme();

    const getRoleName = (papel: string) => {
        switch (papel) {
            case 'ROLE_ADMIN':
                return 'Admin';
            case 'ROLE_VIGIA':
                return 'Porteiro';
            case 'ROLE_COMUM':
                return 'Motorista';
            default:
                return papel;
        }
    };

    const getRoleColor = (papel: string) => {
        switch (papel) {
            case 'ROLE_ADMIN':
                return '#9C27B0';
            case 'ROLE_VIGIA':
                return '#2196F3';
            case 'ROLE_COMUM':
                return '#4CAF50';
            default:
                return theme.colors.primary;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ATIVO':
                return '#4CAF50';
            case 'PENDENTE':
                return '#FF9800';
            case 'REJEITADO':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ATIVO':
                return 'Aprovado';
            case 'PENDENTE':
                return 'Pendente';
            case 'REJEITADO':
                return 'Rejeitado';
            default:
                return status;
        }
    };

    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content style={styles.cardContent}>
                {/* Header with name and role */}
                <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.name}>
                        {user.pessoa.nome}
                    </Text>
                    <View
                        style={[
                            styles.roleBadge,
                            { backgroundColor: getRoleColor(user.papel) }
                        ]}
                    >
                        <Text style={styles.roleBadgeText}>
                            {getRoleName(user.papel)}
                        </Text>
                    </View>
                </View>

                {/* Info rows */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Telefone:</Text>
                    <Text style={styles.infoValue}>{user.pessoa.telefone}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tipo:</Text>
                    <Text style={styles.infoValue}>
                        {user.pessoa.tipo}
                        {user.pessoa.matricula && ` • Mat: ${user.pessoa.matricula}`}
                    </Text>
                </View>

                {/* Status badge at bottom */}
                <View style={styles.footer}>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: `${getStatusColor(user.pessoa.status)}20` }
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: getStatusColor(user.pessoa.status) }
                            ]}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(user.pessoa.status) }]}>
                            {getStatusLabel(user.pessoa.status)}
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
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    cardContent: {
        paddingVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        width: 80,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    footer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export type { UserData };
