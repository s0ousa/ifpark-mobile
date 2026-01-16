import React, { useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { Text, useTheme, Button, ActivityIndicator, Avatar, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { UserService } from '../../services/UserService';
import { UserProfile } from '../../types/User';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';

export default function UserDetailsScreen({ route, navigation }: any) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { userId } = route.params;

    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await UserService.getUserById(userId);
            setProfileData(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados do usuário');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [userId])
    );

    const getRoleLabel = (papel: string) => {
        const roles: Record<string, string> = {
            'ROLE_COMUM': 'Motorista',
            'ROLE_VIGIA': 'Porteiro',
            'ROLE_ADMIN': 'Administrador',
            'ROLE_SUPER_ADMIN': 'Super Administrador',
        };
        return roles[papel] || papel;
    };

    const getRoleIcon = (papel: string) => {
        const icons: Record<string, string> = {
            'ROLE_COMUM': 'car',
            'ROLE_VIGIA': 'shield-account',
            'ROLE_ADMIN': 'security',
            'ROLE_SUPER_ADMIN': 'security',
        };
        return icons[papel] || 'account';
    };

    const getInitials = (nome: string) => {
        const names = nome.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return nome.substring(0, 2).toUpperCase();
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'ATIVO': 'Ativo',
            'PENDENTE': 'Pendente',
            'REJEITADO': 'Rejeitado',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'ATIVO': '#4CAF50',
            'PENDENTE': '#FF9800',
            'REJEITADO': '#F44336',
        };
        return colors[status] || '#999';
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <AppHeader
                    title="Detalhes do Usuário"
                    showBackButton
                    onBackPress={() => navigation.goBack()}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Carregando dados...</Text>
                </View>
            </View>
        );
    }

    if (!profileData || error) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <AppHeader
                    title="Detalhes do Usuário"
                    showBackButton
                    onBackPress={() => navigation.goBack()}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, marginBottom: 16 }}>
                        {error || 'Erro ao carregar dados'}
                    </Text>
                    <Button mode="contained" onPress={fetchUserData} icon="refresh">
                        Tentar Novamente
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Detalhes do Usuário"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                <StatusBar
                    barStyle={theme.dark ? "light-content" : "dark-content"}
                    backgroundColor={`${theme.colors.primary}20`}
                    translucent={true}
                />
                <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 }}>
                    <Avatar.Text
                        size={100}
                        label={getInitials(profileData.pessoa.nome)}
                        style={{ backgroundColor: theme.colors.primary }}
                        labelStyle={{ color: '#FFFFFF', fontSize: 40, fontWeight: 'bold' }}
                    />
                    <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: 'bold', textAlign: 'center' }}>
                        {profileData.pessoa.nome}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginTop: 4, color: '#666', textAlign: 'center' }}>
                        {profileData.email}
                    </Text>

                    {/* Status Badge */}
                    <View style={{
                        marginTop: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: `${getStatusColor(profileData.pessoa.status)}20`
                    }}>
                        <Text style={{ color: getStatusColor(profileData.pessoa.status), fontWeight: '600' }}>
                            {getStatusLabel(profileData.pessoa.status)}
                        </Text>
                    </View>
                </View>

                {/* Dados Pessoais */}
                <View>
                    <Text variant="titleMedium" style={{ paddingHorizontal: 16, paddingVertical: 12, fontWeight: 'bold', fontSize: 16 }}>
                        Dados pessoais
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="account" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.nome}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Nome completo</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="card-account-details" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.cpf}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Número do CPF</Text>
                        </View>
                    </View>

                    {profileData.pessoa.matricula && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                            <View style={{ width: 40, alignItems: 'center' }}>
                                <Icon name="badge-account" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.matricula}</Text>
                                <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Matrícula</Text>
                            </View>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="map-marker" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>
                                {profileData.endereco?.logradouro
                                    ? `${profileData.endereco.logradouro}, ${profileData.endereco.numero}${profileData.endereco.complemento ? ', ' + profileData.endereco.complemento : ''}`
                                    : 'Não informado'}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Endereço</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="phone" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.telefone || 'Não informado'}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Telefone</Text>
                        </View>
                    </View>
                </View>

                {/* Dados da conta */}
                <View>
                    <Text variant="titleMedium" style={{ paddingHorizontal: 16, paddingVertical: 12, fontWeight: 'bold', fontSize: 16 }}>
                        Dados da conta
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="email" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.email}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>E-mail</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name={getRoleIcon(profileData.papel) as any} size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{getRoleLabel(profileData.papel)}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Papel no sistema</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="domain" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.campus.nome}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Campus</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* FAB to edit */}
            <FAB
                icon="pencil"
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 36,
                    borderRadius: 50,
                    backgroundColor: theme.colors.secondary,
                }}
                customSize={64}
                color="white"
                onPress={() => navigation.navigate('UserEdit', { userId })}
            />
        </View>
    );
}
