import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';

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
                return 'Administrador';
            case 'ROLE_VIGIA':
                return 'Porteiro';
            case 'ROLE_COMUM':
                return 'Motorista';
            case 'ROLE_SUPER_ADMIN':
                return 'Super Admin';
            default:
                return papel;
        }
    };

    const getRoleIcon = (papel: string) => {
        switch (papel) {
            case 'ROLE_COMUM':
                return 'car';
            case 'ROLE_VIGIA':
                return 'shield-account';
            case 'ROLE_ADMIN':
                return 'security';
            case 'ROLE_SUPER_ADMIN':
                return 'security';
            default:
                return 'account';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ATIVO':
                return { name: 'check-circle', color: '#4CAF50' };
            case 'PENDENTE':
                return { name: 'clock-outline', color: '#FF9800' };
            case 'REJEITADO':
                return { name: 'close-circle', color: '#F44336' };
            default:
                return { name: 'help-circle', color: '#999' };
        }
    };

    const formatTipoPessoa = (tipo: string) => {
        switch (tipo) {
            case 'ALUNO':
                return 'Aluno';
            case 'SERVIDOR':
                return 'Servidor';
            case 'TERCEIRIZADO':
                return 'Terceirizado';
            case 'VISITANTE':
                return 'Visitante';
            default:
                return tipo;
        }
    };

    const statusIcon = getStatusIcon(user.pessoa.status);

    return (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                marginHorizontal: 16,
                marginBottom: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            }}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${theme.colors.secondary}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                }}
            >
                <Icon name="account" size={20} color={theme.colors.secondary} />
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text
                        variant="titleMedium"
                        style={{ fontWeight: '600', fontSize: 16, color: '#333' }}
                        numberOfLines={1}
                    >
                        {user.pessoa.nome}
                    </Text>
                    <Icon name={statusIcon.name as any} size={18} color={statusIcon.color} style={{ marginLeft: 6 }} />
                </View>

                <Text style={{ fontSize: 13, color: '#666', marginBottom: 6 }} numberOfLines={1}>
                    {user.pessoa.matricula
                        ? `${formatTipoPessoa(user.pessoa.tipo)} • Mat: ${user.pessoa.matricula}`
                        : formatTipoPessoa(user.pessoa.tipo)
                    }
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name={getRoleIcon(user.papel) as any} size={14} color="#666" />
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: '500' }}>
                        {getRoleName(user.papel)}
                    </Text>
                </View>
            </View>

            <View style={{ marginLeft: 8 }}>
                <Icon name="chevron-right" size={24} color="#999" />
            </View>
        </TouchableOpacity>
    );
}

export type { UserData };
