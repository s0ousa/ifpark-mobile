/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { View, Keyboard, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Divider, ActivityIndicator, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Select from '../../components/Select';

import { UserService } from '../../services/UserService.ts';
import { ViaCepService } from '../../services/ViaCepService.ts';
import { CampusService } from '../../services/CampusService.ts';
import AppHeader from '../../components/AppHeader';
import Icon from '@react-native-vector-icons/material-design-icons';
import { useAuthStore } from '../../store/useAuthStore';

const USER_TYPES = [
    { label: 'Aluno', value: 'ALUNO' },
    { label: 'Servidor', value: 'SERVIDOR' },
    { label: 'Terceirizado', value: 'TERCEIRIZADO' },
];

const USER_ROLES = [
    { label: 'Motorista', value: 'ROLE_COMUM' },
    { label: 'Porteiro', value: 'ROLE_VIGIA' },
    { label: 'Administrador', value: 'ROLE_ADMIN' },
];

const USER_STATUS = [
    { label: 'Ativo', value: 'ATIVO' },
    { label: 'Pendente', value: 'PENDENTE' },
    { label: 'Rejeitado', value: 'REJEITADO' },
];

export default function UserEditScreen({ route, navigation }: any) {
    const theme = useTheme();
    const { userId } = route.params;
    const { user: currentUser } = useAuthStore();

    // Check if the admin is editing their own profile
    const isEditingOwnProfile = currentUser?.id === userId;

    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        tipo: 'ALUNO',
        papel: 'ROLE_COMUM',
        status: 'ATIVO',
        telefone: '',
        cidade: '',
        estado: '',
        logradouro: '',
        numero: '',
        cep: '',
        bairro: '',
        complemento: '',
        matricula: '',
        campusId: ''
    });

    const [passwordData, setPasswordData] = useState({
        novaSenha: '',
        confirmNovaSenha: '',
    });

    const [originalData, setOriginalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [campusName, setCampusName] = useState('');

    const [campusOptions, setCampusOptions] = useState<any[]>([]);

    useEffect(() => {
        loadInitialData();
    }, [userId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const userData = await UserService.getUserById(userId);

            setOriginalData(userData);
            setCampusName(userData.campus?.nome || 'Campus não encontrado');

            // Populate form
            setFormData({
                nome: userData.pessoa.nome || '',
                cpf: userData.pessoa.cpf || '',
                email: userData.email || '',
                tipo: userData.pessoa.tipo || 'ALUNO',
                papel: userData.papel || 'ROLE_COMUM',
                status: userData.pessoa.status || 'ATIVO',
                telefone: userData.pessoa.telefone || '',
                cidade: userData.endereco?.cidade || '',
                estado: userData.endereco?.estado || '',
                logradouro: userData.endereco?.logradouro || '',
                numero: userData.endereco?.numero || '',
                cep: userData.endereco?.cep || '',
                bairro: userData.endereco?.bairro || '',
                complemento: userData.endereco?.complemento || '',
                matricula: userData.pessoa.matricula || '',
                campusId: userData.campus?.id || ''
            });

            // If Super Admin, load campuses
            if (currentUser?.papel === 'ROLE_SUPER_ADMIN') {
                try {
                    const campusData = await CampusService.findAll();
                    if (campusData && campusData.content) {
                        const options = campusData.content.map((c: any) => ({
                            label: c.nome,
                            value: c.id
                        }));
                        setCampusOptions(options);
                    }
                } catch (err) {
                    console.error("Erro ao carregar campi:", err);
                }
            }

        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar dados');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updatePasswordField = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const handleCepChange = async (text: string) => {
        let v = text.replace(/\D/g, '');
        v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        updateField('cep', v);

        if (v.length === 9) {
            setLoadingCep(true);
            try {
                const addressData = await ViaCepService.getAddress(v);
                if (addressData) {
                    setFormData(prev => ({
                        ...prev,
                        logradouro: addressData.logradouro,
                        bairro: addressData.bairro,
                        cidade: addressData.localidade,
                        estado: addressData.uf,
                    }));
                }
            } catch (error: any) {
                Alert.alert("Atenção", error.message || "Erro ao buscar CEP");
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleCpfChange = (text: string) => {
        let v = text.replace(/\D/g, '');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        updateField('cpf', v);
    };

    const handlePhoneChange = (text: string) => {
        let v = text.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        updateField('telefone', v);
    };

    const handleUpdate = async () => {
        Keyboard.dismiss();

        if (formData.tipo === 'ALUNO' && !formData.matricula) {
            Alert.alert("Atenção", "A matrícula é obrigatória para alunos.");
            return;
        }

        // Validate password if provided
        if (passwordData.novaSenha || passwordData.confirmNovaSenha) {
            if (passwordData.novaSenha !== passwordData.confirmNovaSenha) {
                Alert.alert("Erro", "As senhas não coincidem.");
                return;
            }
            if (passwordData.novaSenha.length < 6) {
                Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
                return;
            }
        }

        setSaving(true);

        try {
            // Prepare update payload with only changed fields
            const updatePayload: any = {};

            // User data
            if (formData.email !== originalData.email) {
                updatePayload.email = formData.email;
            }
            if (formData.papel !== originalData.papel) {
                updatePayload.papel = formData.papel;
            }
            // Check campus change (only for Super Admin)
            if (currentUser?.papel === 'ROLE_SUPER_ADMIN' && formData.campusId !== originalData.campus?.id) {
                updatePayload.campusId = formData.campusId;
            }

            // Password (if provided)
            if (passwordData.novaSenha) {
                updatePayload.senha = passwordData.novaSenha;
            }

            // Pessoa data
            if (formData.nome !== originalData.pessoa.nome) {
                updatePayload.nome = formData.nome;
            }
            if (formData.cpf !== originalData.pessoa.cpf) {
                updatePayload.cpf = formData.cpf;
            }
            if (formData.matricula !== originalData.pessoa.matricula) {
                updatePayload.matricula = formData.matricula;
            }
            if (formData.tipo !== originalData.pessoa.tipo) {
                updatePayload.tipo = formData.tipo;
            }
            if (formData.status !== originalData.pessoa.status) {
                updatePayload.status = formData.status;
            }
            if (formData.telefone !== originalData.pessoa.telefone) {
                updatePayload.telefone = formData.telefone;
            }

            // Endereco data
            if (formData.logradouro !== originalData.endereco?.logradouro) {
                updatePayload.logradouro = formData.logradouro;
            }
            if (formData.numero !== originalData.endereco?.numero) {
                updatePayload.numero = formData.numero;
            }
            if (formData.complemento !== originalData.endereco?.complemento) {
                updatePayload.complemento = formData.complemento;
            }
            if (formData.bairro !== originalData.endereco?.bairro) {
                updatePayload.bairro = formData.bairro;
            }
            if (formData.cidade !== originalData.endereco?.cidade) {
                updatePayload.cidade = formData.cidade;
            }
            if (formData.estado !== originalData.endereco?.estado) {
                updatePayload.estado = formData.estado;
            }
            if (formData.cep !== originalData.endereco?.cep) {
                updatePayload.cep = formData.cep;
            }

            // Update user data (includes password if provided)
            if (Object.keys(updatePayload).length > 0) {
                await UserService.updateUser(userId, updatePayload);
            }

            Alert.alert(
                "Sucesso",
                "Usuário atualizado com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert("Erro ao Atualizar", error.message);
        } finally {
            setSaving(false);
        }
    };

    const SectionTitle = ({ title }: { title: string }) => (
        <View style={{ marginBottom: 8 }}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {title}
            </Text>
            <Divider />
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <AppHeader
                    title="Editar Usuário"
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



    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Editar Usuário"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <KeyboardAwareScrollView
                contentContainerStyle={{ padding: 24, paddingTop: 16, paddingBottom: 40 }}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ marginBottom: 12 }}>
                    <SectionTitle title="Dados Pessoais" />
                    <TextInput
                        mode="outlined"
                        label="Nome Completo"
                        value={formData.nome}
                        onChangeText={(t) => updateField('nome', t)}
                        left={<TextInput.Icon icon="account" color={theme.colors.secondary} />}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <TextInput
                        mode="outlined"
                        label="CPF"
                        value={formData.cpf}
                        onChangeText={handleCpfChange}
                        keyboardType="numeric"
                        maxLength={14}
                        left={<TextInput.Icon icon="card-account-details" color={theme.colors.secondary} />}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <TextInput
                        mode="outlined"
                        label="Telefone"
                        value={formData.telefone}
                        onChangeText={handlePhoneChange}
                        keyboardType="phone-pad"
                        maxLength={15}
                        left={<TextInput.Icon icon="phone" color={theme.colors.secondary} />}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />
                </View>

                <View style={{ marginBottom: 12 }}>
                    <SectionTitle title="Vínculo Institucional" />

                    {currentUser?.papel === 'ROLE_SUPER_ADMIN' ? (
                        <Select
                            label="Campus"
                            value={formData.campusId}
                            options={campusOptions}
                            onSelect={(newValue) => updateField('campusId', newValue)}
                            icon="office-building-marker"
                        />
                    ) : (
                        <TextInput
                            mode="outlined"
                            label="Campus"
                            value={campusName}
                            editable={false}
                            left={<TextInput.Icon icon="office-building-marker" color={theme.colors.secondary} />}
                            style={{ backgroundColor: theme.colors.surfaceDisabled, marginBottom: 12 }}
                        />
                    )}

                    <Select
                        label="Tipo de Usuário"
                        value={formData.tipo}
                        options={USER_TYPES}
                        onSelect={(newValue) => updateField('tipo', newValue)}
                        icon="account-group"
                    />

                    {(formData.tipo === 'ALUNO' || formData.tipo === 'SERVIDOR') && (
                        <TextInput
                            mode="outlined"
                            label={formData.tipo === 'ALUNO' ? "Matrícula *" : "Matrícula"}
                            value={formData.matricula}
                            onChangeText={(t) => updateField('matricula', t)}
                            left={<TextInput.Icon icon="badge-account-horizontal" color={theme.colors.secondary} />}
                            style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                        />
                    )}

                    <Select
                        label="Papel no Sistema"
                        value={formData.papel}
                        options={USER_ROLES}
                        onSelect={(newValue) => updateField('papel', newValue)}
                        icon="security"
                        disabled={isEditingOwnProfile}
                    />
                    {isEditingOwnProfile && (
                        <Text variant="bodySmall" style={{ color: '#666', marginTop: 4, marginBottom: 12 }}>
                            Você não pode alterar seu próprio papel no sistema
                        </Text>
                    )}

                    <Select
                        label="Status"
                        value={formData.status}
                        options={USER_STATUS}
                        onSelect={(newValue) => updateField('status', newValue)}
                        icon="check-circle"
                        disabled={isEditingOwnProfile}
                    />
                </View>

                <View style={{ marginBottom: 12 }}>
                    <SectionTitle title="Dados de Acesso" />
                    <TextInput
                        mode="outlined"
                        label="Email"
                        value={formData.email}
                        onChangeText={(t) => updateField('email', t)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="email" color={theme.colors.secondary} />}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <Text variant="bodySmall" style={{ color: '#666', marginBottom: 8, marginTop: 4 }}>
                        Deixe os campos de senha em branco para manter a senha atual
                    </Text>

                    <TextInput
                        mode="outlined"
                        label="Nova Senha"
                        secureTextEntry={!showPassword}
                        value={passwordData.novaSenha}
                        onChangeText={(t) => updatePasswordField('novaSenha', t)}
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="lock" color={theme.colors.secondary} />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                                forceTextInputFocus={false}
                            />
                        }
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <TextInput
                        mode="outlined"
                        label="Confirmar Nova Senha"
                        secureTextEntry={!showPassword}
                        value={passwordData.confirmNovaSenha}
                        onChangeText={(t) => updatePasswordField('confirmNovaSenha', t)}
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="lock-check" color={theme.colors.secondary} />}
                        error={passwordData.confirmNovaSenha !== '' && passwordData.novaSenha !== passwordData.confirmNovaSenha}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                                forceTextInputFocus={false}
                            />
                        }
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />
                    {passwordData.confirmNovaSenha !== '' && passwordData.novaSenha !== passwordData.confirmNovaSenha && (
                        <HelperText type="error">As senhas não conferem</HelperText>
                    )}
                </View>

                <View>
                    <SectionTitle title="Endereço" />
                    <TextInput
                        mode="outlined"
                        label="CEP"
                        value={formData.cep}
                        onChangeText={handleCepChange}
                        keyboardType="numeric"
                        maxLength={9}
                        right={loadingCep ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                        <TextInput
                            mode="outlined"
                            label="Logradouro"
                            value={formData.logradouro}
                            onChangeText={(t) => updateField('logradouro', t)}
                            style={{ flex: 3, backgroundColor: theme.colors.surface }}
                        />
                        <TextInput
                            mode="outlined"
                            label="Nº"
                            value={formData.numero}
                            onChangeText={(t) => updateField('numero', t)}
                            style={{ flex: 1, backgroundColor: theme.colors.surface }}
                        />
                    </View>

                    <TextInput
                        mode="outlined"
                        label="Complemento"
                        value={formData.complemento}
                        onChangeText={(t) => updateField('complemento', t)}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <TextInput
                        mode="outlined"
                        label="Bairro"
                        value={formData.bairro}
                        onChangeText={(t) => updateField('bairro', t)}
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                        <TextInput
                            mode="outlined"
                            label="Cidade"
                            value={formData.cidade}
                            onChangeText={(t) => updateField('cidade', t)}
                            style={{ flex: 3, backgroundColor: theme.colors.surface }}
                        />
                        <TextInput
                            mode="outlined"
                            label="UF"
                            placeholder="BA"
                            value={formData.estado}
                            onChangeText={(t) => updateField('estado', t.toUpperCase())}
                            maxLength={2}
                            style={{ flex: 1, backgroundColor: theme.colors.surface }}
                        />
                    </View>
                </View>

                <Button
                    mode="contained"
                    onPress={handleUpdate}
                    loading={saving}
                    disabled={saving}
                    style={{ borderRadius: 8, backgroundColor: theme.colors.secondary }}
                    contentStyle={{ paddingVertical: 8 }}
                >
                    Salvar Alterações
                </Button>
            </KeyboardAwareScrollView>
        </View>
    );
}
