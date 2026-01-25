/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { View, Keyboard, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, IconButton, Divider, HelperText, ActivityIndicator } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Select from '../../components/Select';

import { CampusService } from '../../services/CampusService.ts';
import { AuthService } from '../../services/AuthService.ts';
import { ViaCepService } from '../../services/ViaCepService.ts';
import AppHeader from '../../components/AppHeader';

const USER_TYPES = [
  { label: 'Aluno', value: 'ALUNO' },
  { label: 'Servidor', value: 'SERVIDOR' },
  { label: 'Terceirizado', value: 'TERCEIRIZADO' },
];

export default function RegisterScreen({ navigation }: any) {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmSenha: '',
    tipo: 'ALUNO',
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
  const [campusOptions, setCampusOptions] = useState([]);
  const [loadingCep, setLoadingCep] = useState(false);


  useEffect(() => {
    loadCampi();
  }, []);

  const loadCampi = async () => {
    try {
      console.log('Carregando campi...');
      const data = await CampusService.findAll();
      console.log('Dados recebidos:', data);

      if (data.content && Array.isArray(data.content)) {
        // Filter only active campus
        const activeCampuses = data.content.filter((c: any) => c.ativo === true);
        const formattedOptions = activeCampuses.map((c: any) => ({
          label: c.nome,
          value: c.id
        }));
        console.log('Opções formatadas:', formattedOptions);
        setCampusOptions(formattedOptions);
      } else {
        console.error('Estrutura de dados inesperada:', data);
        Alert.alert("Aviso", "Estrutura de dados de campi inesperada.");
      }
    } catch (error: any) {
      console.error('Erro ao carregar campi:', error);
      Alert.alert("Aviso", `Não foi possível carregar a lista de campi: ${error.message}`);
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

    // Don't send empty matricula - send undefined
    const finalPayload = {
      ...payload,
      matricula: payload.matricula.trim() || undefined
    };

    try {
      const response = await AuthService.register(finalPayload);
      console.log(response);
      Alert.alert(
        "Sucesso",
        "Conta criada com sucesso! Deseja cadastrar seu veículo agora?",
        [
          {
            text: "Agora não",
            onPress: () => navigation.goBack(),
            style: "cancel"
          },
          {
            text: "Cadastrar Veículo",
            onPress: () => {
              const pessoaId = response?.pessoa?.id;
              if (pessoaId) {
                navigation.navigate('VehicleRegister', { pessoaId });
              } else {
                navigation.goBack();
              }
            }
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
        title="Criar Conta"
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
          <Select
            label="Campus"
            value={formData.campusId}
            options={campusOptions}
            onSelect={(newValue) => updateField('campusId', newValue)}
            error={false}
            icon="office-building-marker"
          />

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
            label="Confirmar Senha"
            secureTextEntry={!showPassword}
            value={formData.confirmSenha}
            onChangeText={(t) => updateField('confirmSenha', t)}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock-check" color={theme.colors.secondary} />}
            error={formData.confirmSenha !== '' && formData.senha !== formData.confirmSenha}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
                forceTextInputFocus={false}
              />
            }
            style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
          />
          {formData.confirmSenha !== '' && formData.senha !== formData.confirmSenha && (
            <HelperText type="error">As senhas não conferem</HelperText>
          )}

        </View>

        <View >

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
          Finalizar Cadastro
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          textColor={theme.colors.secondary}
          style={{ marginTop: 16 }}
        >
          Já tenho conta
        </Button>

      </KeyboardAwareScrollView>
    </View>
  );
}