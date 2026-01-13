import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, TextInput, ActivityIndicator, Avatar, Divider, Portal, Modal } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { UserService } from '../../services/UserService';
import { UserProfile } from '../../types/User';

export default function PorterProfileScreen() {
    const theme = useTheme();
    const { user, signOut } = useAuthStore();

    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    // Editable fields
    const [telefone, setTelefone] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');

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

    const handleSavePhone = async () => {
        if (!user?.id) return;

        try {
            setSaving(true);
            setError(null);

            await UserService.updateUser(user.id, { telefone });
            await fetchUserData();
            setPhoneModalVisible(false);
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar telefone');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!user?.id) return;

        try {
            setSaving(true);
            setError(null);

            await UserService.updateUser(user.id, {
                endereco: {
                    logradouro,
                    numero,
                    complemento: complemento || null,
                    bairro,
                    cidade,
                    estado,
                    cep,
                },
            });
            await fetchUserData();
            setAddressModalVisible(false);
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar endereço');
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

    const getInitials = (nome: string) => {
        const names = nome.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return nome.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Carregando perfil...</Text>
                </View>
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header - Centered */}
                <View style={styles.profileHeader}>
                    <Avatar.Text
                        size={100}
                        label={getInitials(profileData.pessoa.nome)}
                        style={{ backgroundColor: theme.colors.primary }}
                        labelStyle={{ color: '#FFFFFF', fontSize: 40, fontWeight: 'bold' }}
                    />
                    <Text variant="headlineSmall" style={styles.userName}>
                        {profileData.pessoa.nome}
                    </Text>
                    <Text variant="bodyMedium" style={styles.userEmail}>
                        {profileData.email}
                    </Text>
                </View>

                {/* Dados Pessoais */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Dados pessoais
                    </Text>

                    <View style={styles.listItem}>
                        <View style={styles.listItemIcon}>
                            <Icon name="account" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>{profileData.pessoa.nome}</Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>Nome completo</Text>
                        </View>
                    </View>



                    <View style={styles.listItem}>
                        <View style={styles.listItemIcon}>
                            <Icon name="card-account-details" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>{profileData.pessoa.cpf}</Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>Número do CPF</Text>
                        </View>
                    </View>

                    {profileData.pessoa.matricula && (
                        <>

                            <View style={styles.listItem}>
                                <View style={styles.listItemIcon}>
                                    <Icon name="badge-account" size={24} color={theme.colors.primary} />
                                </View>
                                <View style={styles.listItemContent}>
                                    <Text variant="bodyLarge" style={styles.listItemTitle}>{profileData.pessoa.matricula}</Text>
                                    <Text variant="bodySmall" style={styles.listItemSubtitle}>Matrícula</Text>
                                </View>
                            </View>
                        </>
                    )}



                    <TouchableOpacity style={styles.listItem} onPress={() => setAddressModalVisible(true)}>
                        <View style={styles.listItemIcon}>
                            <Icon name="map-marker" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>
                                {logradouro ? `${logradouro}, ${numero}${complemento ? ', ' + complemento : ''}` : 'Não informado'}
                            </Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>Endereço</Text>
                        </View>
                        <Icon name="pencil" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem} onPress={() => setPhoneModalVisible(true)}>
                        <View style={styles.listItemIcon}>
                            <Icon name="phone" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>{telefone || 'Não informado'}</Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>Telefone</Text>
                        </View>
                        <Icon name="pencil" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Dados da conta */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Dados da conta
                    </Text>

                    <View style={styles.listItem}>
                        <View style={styles.listItemIcon}>
                            <Icon name="email" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>{profileData.email}</Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>E-mail</Text>
                        </View>
                    </View>

                    <View style={styles.listItem}>
                        <View style={styles.listItemIcon}>
                            <Icon name="shield-account" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>{getRoleLabel(profileData.papel)}</Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>Papel no sistema</Text>
                        </View>
                    </View>



                    <View style={styles.listItem}>
                        <View style={styles.listItemIcon}>
                            <Icon name="domain" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text variant="bodyLarge" style={styles.listItemTitle}>{profileData.campus.nome}</Text>
                            <Text variant="bodySmall" style={styles.listItemSubtitle}>Campus</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="outlined"
                        onPress={handleLogout}
                        icon="logout"
                        textColor={theme.colors.error}
                        style={styles.logoutButton}
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
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
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
                    <View style={styles.modalButtons}>
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
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
                >
                    <ScrollView>
                        <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                            Editar Endereço
                        </Text>

                        <TextInput
                            label="CEP"
                            value={cep}
                            onChangeText={setCep}
                            mode="outlined"
                            keyboardType="numeric"
                            activeOutlineColor={theme.colors.primary}
                            style={styles.input}
                        />

                        <TextInput
                            label="Logradouro"
                            value={logradouro}
                            onChangeText={setLogradouro}
                            mode="outlined"
                            activeOutlineColor={theme.colors.primary}
                            style={styles.input}
                        />

                        <View style={styles.row}>
                            <TextInput
                                label="Número"
                                value={numero}
                                onChangeText={setNumero}
                                mode="outlined"
                                keyboardType="numeric"
                                activeOutlineColor={theme.colors.primary}
                                style={[styles.input, styles.inputSmall]}
                            />

                            <TextInput
                                label="Complemento"
                                value={complemento}
                                onChangeText={setComplemento}
                                mode="outlined"
                                activeOutlineColor={theme.colors.primary}
                                style={[styles.input, styles.inputLarge]}
                            />
                        </View>

                        <TextInput
                            label="Bairro"
                            value={bairro}
                            onChangeText={setBairro}
                            mode="outlined"
                            activeOutlineColor={theme.colors.primary}
                            style={styles.input}
                        />

                        <View style={styles.row}>
                            <TextInput
                                label="Cidade"
                                value={cidade}
                                onChangeText={setCidade}
                                mode="outlined"
                                activeOutlineColor={theme.colors.primary}
                                style={[styles.input, styles.inputLarge]}
                            />

                            <TextInput
                                label="UF"
                                value={estado}
                                onChangeText={setEstado}
                                mode="outlined"
                                maxLength={2}
                                activeOutlineColor={theme.colors.primary}
                                style={[styles.input, styles.inputSmall]}
                            />
                        </View>

                        <View style={styles.modalButtons}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    userName: {
        marginTop: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    userEmail: {
        marginTop: 4,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        marginTop: 24,
        backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontWeight: 'bold',
        fontSize: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    listItemIcon: {
        width: 40,
        alignItems: 'center',
    },
    listItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    listItemTitle: {
        fontWeight: '500',
        marginBottom: 2,
    },
    listItemSubtitle: {
        color: '#666',
        fontSize: 12,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 32,
    },
    logoutButton: {
        borderColor: '#FF5252',
    },
    modal: {
        margin: 20,
        padding: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    input: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputSmall: {
        flex: 1,
    },
    inputLarge: {
        flex: 2,
    },
});
