/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Keyboard, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, Divider, HelperText, ActivityIndicator } from 'react-native-paper';
import Select from '../../components/Select';

import { UserService } from '../../services/UserService.ts';
import { ViaCepService } from '../../services/ViaCepService.ts';
import { CampusService } from '../../services/CampusService.ts';
import AppHeader from '../../components/AppHeader';
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

export default function AdminUserRegisterScreen({ navigation }: any) {
    const theme = useTheme();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        senha: '',
        confirmSenha: '',
        tipo: 'ALUNO',
        papel: 'ROLE_COMUM',
        telefone: '',
        cidade: '',
        estado: '',
        logradouro: '',
        numero: '',
        cep: '',
        bairro: '',
        matricula: '',
        campusId: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [campusName, setCampusName] = useState('');
    const [campusOptions, setCampusOptions] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        loadCampusInfo();
    }, []);

    const loadCampusInfo = async () => {
        if (user?.campusId) {
            // Regular Admin: Load specific campus
            try {
                const campus = await CampusService.getCampusById(user.campusId);
                setCampusName(campus.nome);
                setFormData(prev => ({ ...prev, campusId: user.campusId || '' }));
            } catch (error) {
                console.error('Erro ao carregar campus:', error);
                setCampusName('Campus não encontrado');
            }
        } else if (user?.papel === 'ROLE_SUPER_ADMIN') {
            // Super Admin: Load all campuses for selection
            try {
                const response = await CampusService.listCampuses();
                const campuses = response.content || [];
                // Filter only active campus
                const activeCampuses = campuses.filter((c: any) => c.ativo === true);
                const options = activeCampuses.map((c: any) => ({ label: c.nome, value: c.id }));
                setCampusOptions(options);
            } catch (error) {
                console.error('Erro ao carregar campi:', error);
                Alert.alert('Erro', 'Não foi possível carregar a lista de campi');
            }
        }
    };


    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const handleRegister = async () => {
        Keyboard.dismiss();

        if (formData.senha !== formData.confirmSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        if (formData.tipo === 'ALUNO' && !formData.matricula) {
            Alert.alert("Atenção", "A matrícula é obrigatória para alunos.");
            return;
        }

        if (!formData.campusId) {
            Alert.alert("Atenção", "Por favor, selecione um Campus.");
            return;
        }

        setLoading(true);

        const { confirmSenha, ...payload } = formData;

        // Don't send empty matricula - send null or omit it
        const finalPayload = {
            ...payload,
            matricula: payload.matricula.trim() || undefined
        };

        try {
            await UserService.createUser(finalPayload);
            Alert.alert(
                "Sucesso",
                "Usuário criado com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert("Erro no Cadastro", error.message);
        } finally {
            setLoading(false);
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

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Cadastrar usuário"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 16, paddingBottom: 40 }}>
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
                    {user?.papel === 'ROLE_SUPER_ADMIN' ? (
                        <Select
                            label="Campus *"
                            value={formData.campusId}
                            options={campusOptions}
                            onSelect={(newValue) => updateField('campusId', newValue)}
                            icon="domain"
                            placeholder="Selecione o Campus"
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

                    <TextInput
                        mode="outlined"
                        label="Senha"
                        secureTextEntry={!showPassword}
                        value={formData.senha}
                        onChangeText={(t) => updateField('senha', t)}
                        left={<TextInput.Icon icon="lock" color={theme.colors.secondary} />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />

                    <TextInput
                        mode="outlined"
                        label="Confirmar Senha"
                        secureTextEntry={!showPassword}
                        value={formData.confirmSenha}
                        onChangeText={(t) => updateField('confirmSenha', t)}
                        left={<TextInput.Icon icon="lock-check" color={theme.colors.secondary} />}
                        error={formData.confirmSenha !== '' && formData.senha !== formData.confirmSenha}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
                    />
                    {formData.confirmSenha !== '' && formData.senha !== formData.confirmSenha && (
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
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={{ borderRadius: 8, backgroundColor: theme.colors.secondary }}
                    contentStyle={{ paddingVertical: 8 }}
                >
                    Cadastrar Usuário
                </Button>
            </ScrollView>
        </View>
    );
}
