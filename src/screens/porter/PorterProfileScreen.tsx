import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, useTheme, Button, TextInput, ActivityIndicator, Avatar, Portal, Modal, Snackbar, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { ViaCepService } from '../../services/ViaCepService';
import { UserService } from '../../services/UserService';
import { UserProfile } from '../../types/User';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PorterProfileScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuthStore();

    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    // Snackbar states
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

    // Editable fields
    const [telefone, setTelefone] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);

    const fetchUserData = async () => {
        if (!user?.id) return;

        try {
            setError(null);
            setLoading(true);
            const data = await UserService.getUserById(user.id);
            setProfileData(data);

            // Initialize editable fields
            setTelefone(data.pessoa.telefone || '');
            setLogradouro(data.endereco?.logradouro || '');
            setNumero(data.endereco?.numero || '');
            setComplemento(data.endereco?.complemento || '');
            setBairro(data.endereco?.bairro || '');
            setCidade(data.endereco?.cidade || '');
            setEstado(data.endereco?.estado || '');
            setCep(data.endereco?.cep || '');
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados do perfil');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [user?.id])
    );

    const handleCepChange = async (text: string) => {
        let v = text.replace(/\D/g, '');
        v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        setCep(v);

        if (v.length === 9) {
            setLoadingCep(true);
            try {
                const addressData = await ViaCepService.getAddress(v);
                if (addressData) {
                    setLogradouro(addressData.logradouro);
                    setBairro(addressData.bairro);
                    setCidade(addressData.localidade);
                    setEstado(addressData.uf);
                }
            } catch (error: any) {
                // Silently fail or show small feedback if needed, but standard flow is usually just not filling
                console.log('Erro ao buscar CEP', error);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleSavePhone = async () => {
        if (!profileData?.pessoa.id) return;

        try {
            setSaving(true);
            setError(null);

            await UserService.updatePhone(profileData.pessoa.id, telefone);
            await fetchUserData();
            setPhoneModalVisible(false);

            setSnackbarMessage('Telefone atualizado com sucesso!');
            setSnackbarType('success');
            setSnackbarVisible(true);
        } catch (err: any) {
            setSnackbarMessage(err.message || 'Erro ao salvar telefone');
            setSnackbarType('error');
            setSnackbarVisible(true);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!profileData?.endereco?.id) return;

        try {
            setSaving(true);
            setError(null);

            await UserService.updateAddress(profileData.endereco.id, {
                logradouro,
                numero,
                complemento: complemento || null,
                bairro,
                cidade,
                estado,
                cep,
            });
            await fetchUserData();
            setAddressModalVisible(false);

            setSnackbarMessage('Endereço atualizado com sucesso!');
            setSnackbarType('success');
            setSnackbarVisible(true);
        } catch (err: any) {
            setSnackbarMessage(err.message || 'Erro ao salvar endereço');
            setSnackbarType('error');
            setSnackbarVisible(true);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

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

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Carregando perfil...</Text>
                </View>
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, marginBottom: 16 }}>
                        {error || 'Erro ao carregar perfil'}
                    </Text>
                    <Button mode="contained" onPress={fetchUserData} icon="refresh">
                        Tentar Novamente
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingTop: insets.top
        }}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
                <StatusBar
                    barStyle={theme.dark ? "light-content" : "dark-content"}
                    backgroundColor={`${theme.colors.primary}20`}
                    translucent={true}
                />
                <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, }}>
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
                </View>

                {/* Dados Pessoais */}
                <View >
                    <Text variant="titleMedium" style={{ paddingHorizontal: 16, paddingVertical: 12, fontWeight: 'bold', fontSize: 16 }}>
                        Dados pessoais
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="account" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.nome}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Nome completo</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="card-account-details" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.cpf}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Número do CPF</Text>
                        </View>
                    </View>

                    {profileData.pessoa.matricula && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}>
                            <View style={{ width: 40, alignItems: 'center' }}>
                                <Icon name="badge-account" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.pessoa.matricula}</Text>
                                <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Matrícula</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}
                        onPress={() => setAddressModalVisible(true)}
                    >
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="map-marker" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>
                                {logradouro ? `${logradouro}, ${numero}${complemento ? ', ' + complemento : ''}` : 'Não informado'}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Endereço</Text>
                        </View>
                        <Icon name="pencil" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}
                        onPress={() => setPhoneModalVisible(true)}
                    >
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="phone" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{telefone || 'Não informado'}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Telefone</Text>
                        </View>
                        <Icon name="pencil" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Dados da conta */}
                <View >
                    <Text variant="titleMedium" style={{ paddingHorizontal: 16, paddingVertical: 12, fontWeight: 'bold', fontSize: 16 }}>
                        Dados da conta
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="email" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.email}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>E-mail</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name={getRoleIcon(profileData.papel) as any} size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{getRoleLabel(profileData.papel)}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Papel no sistema</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, }}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            <Icon name="domain" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 2 }}>{profileData.campus.nome}</Text>
                            <Text variant="bodySmall" style={{ color: '#666', fontSize: 12 }}>Campus</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <View style={{ alignSelf: 'center', marginTop: 32, }}>
                    <Button
                        mode="contained"
                        onPress={handleLogout}
                        icon="logout"
                        textColor={theme.colors.onError}
                        style={{ backgroundColor: theme.colors.error }}
                    >
                        Sair
                    </Button>
                </View>
            </ScrollView>

            {/* Phone Edit Modal */}
            <Portal>
                <Modal
                    visible={phoneModalVisible}
                    onDismiss={() => setPhoneModalVisible(false)}
                    contentContainerStyle={{ margin: 20, padding: 20, borderRadius: 8, maxHeight: '80%', backgroundColor: theme.colors.background }}
                >
                    <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                        Editar Telefone
                    </Text>
                    <TextInput
                        label="Telefone"
                        value={telefone}
                        onChangeText={setTelefone}
                        mode="outlined"
                        keyboardType="phone-pad"
                        left={<TextInput.Icon icon="phone" />}
                        activeOutlineColor={theme.colors.primary}
                        style={{ marginBottom: 16 }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <Button
                            mode="text"
                            onPress={() => setPhoneModalVisible(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSavePhone}
                            loading={saving}
                            disabled={saving}
                            buttonColor={theme.colors.primary}
                        >
                            Salvar
                        </Button>
                    </View>
                </Modal>
            </Portal>

            {/* Address Edit Modal */}
            <Portal>
                <Modal
                    visible={addressModalVisible}
                    onDismiss={() => setAddressModalVisible(false)}
                    contentContainerStyle={{ margin: 20, padding: 20, borderRadius: 8, maxHeight: '80%', backgroundColor: theme.colors.background }}
                >
                    <ScrollView>
                        <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                            Editar Endereço
                        </Text>

                        <TextInput
                            label="CEP"
                            value={cep}
                            onChangeText={handleCepChange}
                            mode="outlined"
                            keyboardType="numeric"
                            maxLength={9}
                            activeOutlineColor={theme.colors.primary}
                            style={{ marginBottom: 12 }}
                            right={loadingCep ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                        />

                        <TextInput
                            label="Logradouro"
                            value={logradouro}
                            onChangeText={setLogradouro}
                            mode="outlined"
                            activeOutlineColor={theme.colors.primary}
                            style={{ marginBottom: 12 }}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TextInput
                                label="Número"
                                value={numero}
                                onChangeText={setNumero}
                                mode="outlined"
                                keyboardType="numeric"
                                activeOutlineColor={theme.colors.primary}
                                style={{ marginBottom: 12, flex: 1 }}
                            />

                            <TextInput
                                label="Complemento"
                                value={complemento}
                                onChangeText={setComplemento}
                                mode="outlined"
                                activeOutlineColor={theme.colors.primary}
                                style={{ marginBottom: 12, flex: 2 }}
                            />
                        </View>

                        <TextInput
                            label="Bairro"
                            value={bairro}
                            onChangeText={setBairro}
                            mode="outlined"
                            activeOutlineColor={theme.colors.primary}
                            style={{ marginBottom: 12 }}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TextInput
                                label="Cidade"
                                value={cidade}
                                onChangeText={setCidade}
                                mode="outlined"
                                activeOutlineColor={theme.colors.primary}
                                style={{ marginBottom: 12, flex: 2 }}
                            />

                            <TextInput
                                label="UF"
                                value={estado}
                                onChangeText={setEstado}
                                mode="outlined"
                                maxLength={2}
                                activeOutlineColor={theme.colors.primary}
                                style={{ marginBottom: 12, flex: 1 }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                            <Button
                                mode="text"
                                onPress={() => setAddressModalVisible(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSaveAddress}
                                loading={saving}
                                disabled={saving}
                                buttonColor={theme.colors.primary}
                            >
                                Salvar
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>

            {/* Snackbar for feedback */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{
                    backgroundColor: snackbarType === 'success' ? theme.colors.tertiary : theme.colors.error
                }}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                    textColor: '#FFFFFF',
                }}
            >
                <Text style={{ color: '#FFFFFF' }}>{snackbarMessage}</Text>
            </Snackbar>
        </View>
    );
}
