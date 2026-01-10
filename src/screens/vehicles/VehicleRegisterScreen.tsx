import React, { useState } from 'react';
import { View, ScrollView, Alert, Keyboard } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { VehicleService } from '../../services/VehicleService';
import AppHeader from '../../components/AppHeader';

export default function VehicleRegisterScreen({ route, navigation }: any) {
    const theme = useTheme();
    const { pessoaId } = route.params || {};

    const [placa, setPlaca] = useState('');
    const [modelo, setModelo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        Keyboard.dismiss();

        if (!pessoaId) {
            Alert.alert("Erro", "ID da pessoa não encontrado. Tente logar novamente.");
            return;
        }

        if (!placa || !modelo) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        setLoading(true);

        try {
            await VehicleService.register({
                pessoaId,
                placa: placa.toUpperCase(),
                modelo
            });

            Alert.alert("Sucesso", "Veículo cadastrado com sucesso!", [
                {
                    text: "OK", onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    })
                }
            ]);

        } catch (error: any) {
            Alert.alert("Erro", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Cadastrar Veículo"
                showBackButton
                onBackPress={() => navigation.navigate('Login')}
            />

            <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 32 }}>
                <Text variant="bodyLarge" style={{ marginBottom: 24, textAlign: 'center' }}>
                    Agora, vamos registrar seu veículo.
                </Text>

                <TextInput
                    mode="outlined"
                    label="Placa do Veículo"
                    placeholder="Ex: ABC1D23"
                    value={placa}
                    onChangeText={(t) => setPlaca(t.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={7}
                    left={<TextInput.Icon icon="car-back" color={theme.colors.primary} />}
                    style={{ backgroundColor: theme.colors.surface, marginBottom: 16 }}
                />

                <TextInput
                    mode="outlined"
                    label="Modelo"
                    placeholder="Ex: Fiat Uno"
                    value={modelo}
                    onChangeText={setModelo}
                    left={<TextInput.Icon icon="car" color={theme.colors.primary} />}
                    style={{ backgroundColor: theme.colors.surface, marginBottom: 32 }}
                />

                <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={{ borderRadius: 8, backgroundColor: theme.colors.secondary }}
                    contentStyle={{ paddingVertical: 8 }}
                >
                    Registrar Veículo
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    textColor={theme.colors.secondary}
                    style={{ marginTop: 16 }}
                >
                    Fazer isso depois
                </Button>

            </ScrollView>
        </View>
    );
}
