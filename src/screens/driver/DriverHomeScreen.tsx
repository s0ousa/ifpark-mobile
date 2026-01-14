import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, useTheme, ActivityIndicator, FAB, Portal, Modal, Button, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import ParkingLotInfoCard from '../../components/ParkingLotInfoCard';
import VehicleCard from '../../components/VehicleCard';
import { ParkingLotService, ParkingLot } from '../../services/ParkingLotService';
import { VehicleService, Vehicle } from '../../services/VehicleService';
import { UserService } from '../../services/UserService';
import { useAuthStore } from '../../store/useAuthStore';

export default function DriverHomeScreen({ navigation }: any) {
    const theme = useTheme();
    const { user } = useAuthStore();

    console.log('DriverHomeScreen rendering, user:', user);

    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [placa, setPlaca] = useState('');
    const [modelo, setModelo] = useState('');
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            console.log('Loading data for user:', user?.id);
            console.log('User pessoaId:', user?.pessoaId);
            setError(null);
            setLoading(true);

            // Buscar dados do usuário para pegar campus
            const userData = await UserService.getUserById(user?.id || '');
            console.log('User data loaded:', userData);

            // Buscar estacionamentos do campus
            const parkingLotsData = await ParkingLotService.getParkingLotsByCampus(userData.campus.id);
            console.log('Parking lots loaded:', parkingLotsData);

            // Buscar veículos da pessoa
            if (!user?.pessoaId) {
                console.warn('⚠️ No pessoaId found for user!');
            }
            const vehiclesData = user?.pessoaId
                ? await VehicleService.getVehiclesByPessoaId(user.pessoaId)
                : [];
            console.log('🚗 Vehicles loaded:', vehiclesData);
            console.log('🚗 Number of vehicles:', vehiclesData.length);

            setParkingLots(parkingLotsData.content);
            setVehicles(vehiclesData);
            console.log('✅ Data loaded successfully');
            console.log('✅ Vehicles state:', vehiclesData);
        } catch (err: any) {
            console.error('❌ Error loading data:', err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSaveVehicle = async () => {
        if (!placa.trim() || !modelo.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (!user?.pessoaId) {
            Alert.alert('Erro', 'ID da pessoa não encontrado');
            return;
        }

        try {
            setSaving(true);
            await VehicleService.register({
                pessoaId: user.pessoaId,
                placa: placa.trim(),
                modelo: modelo.trim(),
            });

            // Limpar formulário
            setPlaca('');
            setModelo('');
            setModalVisible(false);

            // Recarregar lista de veículos
            await loadData();
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao cadastrar veículo');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <AppHeader title="Início" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                        Carregando...
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <AppHeader title="Início" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, textAlign: 'center' }}>
                        {error}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <AppHeader title="Início" />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Estacionamentos */}
                <View style={{ marginTop: 24 }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold', marginHorizontal: 16, marginBottom: 12 }}>
                        Estacionamentos
                    </Text>

                    {parkingLots.length > 0 ? (
                        parkingLots.map((lot) => (
                            <ParkingLotInfoCard key={lot.id} parkingLot={lot} />
                        ))
                    ) : (
                        <View style={{ padding: 24, alignItems: 'center' }}>
                            <Icon name="parking" size={48} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                                Nenhum estacionamento disponível no seu campus
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ marginTop: 16 }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold', marginHorizontal: 16, marginBottom: 12 }}>
                        Meus Veículos
                    </Text>

                    {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                        ))
                    ) : (
                        <View style={{ padding: 24, alignItems: 'center' }}>
                            <Icon name="car-off" size={48} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                                Você ainda não possui veículos cadastrados
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB for adding vehicle */}
            <FAB
                icon="plus"
                style={{
                    position: 'absolute',
                    margin: 16,
                    bottom: 36,
                    right: 0,
                    borderRadius: 50,
                    backgroundColor: theme.colors.secondary,
                }}
                color="#FFFFFF"
                onPress={() => setModalVisible(true)}
                customSize={64}
            />

            {/* Vehicle Registration Modal */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: '#FFFFFF',
                        margin: 20,
                        padding: 20,
                        borderRadius: 12,
                    }}
                >
                    <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                        Cadastrar Veículo
                    </Text>

                    <TextInput
                        label="Placa"
                        value={placa}
                        onChangeText={(text) => setPlaca(text.toUpperCase())}
                        mode="outlined"
                        placeholder="Ex: ABC1D23 ou ABC1234"
                        autoCapitalize="characters"
                        maxLength={7}
                        style={{ marginBottom: 12 }}
                    />

                    <TextInput
                        label="Modelo"
                        value={modelo}
                        onChangeText={setModelo}
                        mode="outlined"
                        placeholder="Ex: Honda Civic"
                        style={{ marginBottom: 20 }}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setModalVisible(false);
                                setPlaca('');
                                setModelo('');
                            }}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSaveVehicle}
                            loading={saving}
                            disabled={saving}
                        >
                            Salvar
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}
