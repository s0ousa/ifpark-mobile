import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator, IconButton, Portal, Modal } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import { VisitorService, VisitorRegistrationData } from '../../services/VisitorService';
import { ViaCepService } from '../../services/ViaCepService';

type VisitorRegistrationScreenProps = {
    route: any;
    navigation: any;
};

export default function VisitorRegistrationScreen({ route, navigation }: VisitorRegistrationScreenProps) {
    const theme = useTheme();
    const { parkingLotId } = route.params as { parkingLotId: string };

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [placa, setPlaca] = useState('');
    const [modelo, setModelo] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPlateConfirm, setShowPlateConfirm] = useState(false);
    const [scannedPlate, setScannedPlate] = useState('');

    // Máscaras
    const maskCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        return v;
    };

    const maskCEP = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v.length > 8) v = v.substring(0, 8);
        v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        return v;
    };

    const maskPlaca = (value: string) => {
        // Remove tudo que não é letra ou número
        let v = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 7) v = v.substring(0, 7);
        return v;
    };

    // Buscar endereço por CEP
    const handleCepChange = async (value: string) => {
        const masked = maskCEP(value);
        setCep(masked);

        const cleanCep = masked.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                setLoadingCep(true);
                const address = await ViaCepService.getAddress(cleanCep);
                if (address) {
                    setLogradouro(address.logradouro || '');
                    setBairro(address.bairro || '');
                    setCidade(address.localidade || '');
                    setEstado(address.uf || '');
                }
            } catch (err: any) {
                Alert.alert('Erro', err.message || 'CEP não encontrado');
            } finally {
                setLoadingCep(false);
            }
        }
    };

    // Validação
    const validateForm = (): boolean => {
        if (!nome.trim() || nome.trim().length < 3) {
            setError('Nome deve ter no mínimo 3 caracteres');
            return false;
        }

        const cpfDigits = cpf.replace(/\D/g, '');
        if (cpfDigits.length !== 11) {
            setError(`CPF deve ter 11 dígitos (${cpfDigits.length} digitados)`);
            return false;
        }

        const phoneDigits = telefone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            setError(`Telefone inválido (deve ter 10 ou 11 dígitos)`);
            return false;
        }

        const cepDigits = cep.replace(/\D/g, '');
        if (cepDigits.length !== 8) {
            setError(`CEP deve ter 8 dígitos (${cepDigits.length} digitados)`);
            return false;
        }

        if (!logradouro.trim() || logradouro.trim().length < 3) {
            setError('Logradouro inválido (mínimo 3 caracteres)');
            return false;
        }

        if (!numero.trim()) {
            setError('Número é obrigatório');
            return false;
        }

        if (!bairro.trim() || bairro.trim().length < 2) {
            setError('Bairro inválido (mínimo 2 caracteres)');
            return false;
        }

        if (!cidade.trim() || cidade.trim().length < 2) {
            setError('Cidade inválida (mínimo 2 caracteres)');
            return false;
        }

        if (estado.length !== 2) {
            setError('Estado deve ter 2 caracteres (UF)');
            return false;
        }

        const placaClean = placa.replace(/[^A-Z0-9]/g, '');
        if (placaClean.length !== 7) {
            setError(`Placa deve ter 7 caracteres (${placaClean.length} digitados)`);
            return false;
        }

        // Validar formato da placa (ABC1D23 ou ABC1234)
        const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
        if (!placaRegex.test(placaClean)) {
            setError('Placa inválida. Formato: ABC1D23 ou ABC1234');
            return false;
        }

        if (!modelo.trim() || modelo.trim().length < 2) {
            setError('Modelo deve ter no mínimo 2 caracteres');
            return false;
        }

        setError(null);
        return true;
    };

    // Submeter formulário
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data: VisitorRegistrationData = {
                nome: nome.trim(),
                cpf,
                tipo: 'VISITANTE',
                telefone,
                cep,
                logradouro: logradouro.trim(),
                numero: numero.trim(),
                bairro: bairro.trim(),
                cidade: cidade.trim(),
                estado: estado.toUpperCase(),
                placa: placa.replace(/[^A-Z0-9]/g, ''),
                modelo: modelo.trim()
            };

            console.log('Dados enviados:', data); // Para debug

            await VisitorService.registerVisitor(data);

            Alert.alert(
                'Sucesso',
                'Visitante registrado com sucesso!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            console.error('Erro ao registrar:', err); // Para debug
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao registrar visitante';
            setError(errorMessage);
            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Registrar Visitante"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Dados Pessoais */}
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, color: theme.colors.primary }}>
                    Dados Pessoais
                </Text>

                <TextInput
                    mode="outlined"
                    label="Nome Completo *"
                    value={nome}
                    onChangeText={setNome}
                    disabled={loading}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />

                <TextInput
                    mode="outlined"
                    label="CPF *"
                    value={cpf}
                    onChangeText={(text) => setCpf(maskCPF(text))}
                    keyboardType="numeric"
                    maxLength={14}
                    disabled={loading}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                    placeholder="000.000.000-00"
                />

                <TextInput
                    mode="outlined"
                    label="Telefone *"
                    value={telefone}
                    onChangeText={(text) => setTelefone(maskPhone(text))}
                    keyboardType="phone-pad"
                    maxLength={15}
                    disabled={loading}
                    style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
                    placeholder="(00) 00000-0000"
                />

                {/* Endereço */}
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, color: theme.colors.primary }}>
                    Endereço
                </Text>

                <TextInput
                    mode="outlined"
                    label="CEP *"
                    value={cep}
                    onChangeText={handleCepChange}
                    keyboardType="numeric"
                    maxLength={9}
                    disabled={loading}
                    right={loadingCep ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                    placeholder="00000-000"
                />

                <TextInput
                    mode="outlined"
                    label="Logradouro *"
                    value={logradouro}
                    onChangeText={setLogradouro}
                    disabled={loading || loadingCep}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />

                <TextInput
                    mode="outlined"
                    label="Número *"
                    value={numero}
                    onChangeText={setNumero}
                    disabled={loading}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />

                <TextInput
                    mode="outlined"
                    label="Complemento"
                    value={complemento}
                    onChangeText={setComplemento}
                    disabled={loading}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />

                <TextInput
                    mode="outlined"
                    label="Bairro *"
                    value={bairro}
                    onChangeText={setBairro}
                    disabled={loading || loadingCep}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />

                <TextInput
                    mode="outlined"
                    label="Cidade *"
                    value={cidade}
                    onChangeText={setCidade}
                    disabled={loading || loadingCep}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />

                <TextInput
                    mode="outlined"
                    label="Estado (UF) *"
                    value={estado}
                    onChangeText={(text) => setEstado(text.toUpperCase())}
                    maxLength={2}
                    autoCapitalize="characters"
                    disabled={loading || loadingCep}
                    style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
                    placeholder="BA"
                />

                {/* Veículo */}
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, color: theme.colors.primary }}>
                    Veículo
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <TextInput
                        mode="outlined"
                        label="Placa *"
                        value={placa}
                        onChangeText={(text) => setPlaca(maskPlaca(text))}
                        maxLength={7}
                        autoCapitalize="characters"
                        disabled={loading}
                        style={{ flex: 1, backgroundColor: theme.colors.surface }}
                        placeholder="ABC1D23"
                    />

                    <IconButton
                        icon="barcode-scan"
                        mode="contained"
                        containerColor="#e6ebea"
                        iconColor={theme.colors.primary}
                        size={24}
                        disabled={loading}
                        onPress={() => {
                            navigation.navigate('CameraScreen', {
                                onPlateDetected: (detectedPlate: string) => {
                                    setScannedPlate(detectedPlate);
                                    setShowPlateConfirm(true);
                                }
                            });
                        }}
                        style={{
                            marginTop: 6,
                            margin: 0,
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                        }}
                    />
                </View>

                <TextInput
                    mode="outlined"
                    label="Modelo *"
                    value={modelo}
                    onChangeText={setModelo}
                    disabled={loading}
                    style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
                    placeholder="Ex: Fiat Uno"
                />

                {/* Mensagem de erro */}
                {error && (
                    <Text variant="bodyMedium" style={{ color: theme.colors.error, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' }}>
                        {error}
                    </Text>
                )}

                {/* Botões */}
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={{ marginBottom: 12 }}
                >
                    Registrar Visitante
                </Button>

                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
            </ScrollView>

            {/* Modal de Confirmação da Placa Escaneada */}
            <Portal>
                <Modal
                    visible={showPlateConfirm}
                    onDismiss={() => setShowPlateConfirm(false)}
                    contentContainerStyle={{
                        backgroundColor: theme.colors.surface,
                        padding: 24,
                        margin: 20,
                        borderRadius: 16,
                    }}
                >
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.onBackground, textAlign: 'center' }}>
                        Placa Detectada
                    </Text>

                    <View style={{
                        borderRadius: 12,
                        padding: 20,
                        marginVertical: 20,
                        borderWidth: 2,
                        borderColor: theme.colors.secondary,
                    }}>
                        <Text style={{
                            fontSize: 32,
                            fontWeight: 'bold',
                            letterSpacing: 4,
                            textAlign: 'center',
                            color: theme.colors.onSurface,
                        }}>
                            {scannedPlate}
                        </Text>
                    </View>

                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }}>
                        A placa está correta?
                    </Text>

                    <View style={{ gap: 12 }}>
                        <Button
                            mode="contained"
                            icon="check"
                            style={{ backgroundColor: theme.colors.success }}
                            onPress={() => {
                                setPlaca(maskPlaca(scannedPlate));
                                setShowPlateConfirm(false);
                            }}
                        >
                            Confirmar
                        </Button>

                        <Button
                            mode="contained"
                            icon="refresh"
                            style={{ backgroundColor: '#FF9800' }}
                            onPress={() => {
                                setShowPlateConfirm(false);
                                navigation.navigate('CameraScreen', {
                                    onPlateDetected: (detectedPlate: string) => {
                                        setScannedPlate(detectedPlate);
                                        setShowPlateConfirm(true);
                                    }
                                });
                            }}
                        >
                            Tentar Novamente
                        </Button>

                        <Button
                            mode="outlined"
                            icon="close"
                            onPress={() => setShowPlateConfirm(false)}
                        >
                            Cancelar
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}