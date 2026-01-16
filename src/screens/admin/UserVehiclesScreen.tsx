import React, { useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { VehicleService, Vehicle } from '../../services/VehicleService';
import VehicleCard from '../../components/VehicleCard';
import AppHeader from '../../components/AppHeader';

export default function UserVehiclesScreen({ route, navigation }: any) {
    const theme = useTheme();
    const { pessoaId, userName } = route.params;

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Reject dialog state
    const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchVehicles = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await VehicleService.getVehiclesByPessoaId(pessoaId);
            setVehicles(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar veículos');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchVehicles();
        }, [pessoaId])
    );

    const handleApprove = async (vehicleId: string) => {
        Alert.alert(
            'Aprovar Veículo',
            'Tem certeza que deseja aprovar este veículo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aprovar',
                    onPress: async () => {
                        try {
                            setProcessingId(vehicleId);
                            await VehicleService.approve(vehicleId);
                            Alert.alert('Sucesso', 'Veículo aprovado com sucesso!');
                            await fetchVehicles();
                        } catch (err: any) {
                            Alert.alert('Erro', err.message || 'Erro ao aprovar veículo');
                        } finally {
                            setProcessingId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleRejectPress = (vehicleId: string) => {
        setSelectedVehicleId(vehicleId);
        setRejectReason('');
        setRejectDialogVisible(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o motivo da rejeição');
            return;
        }

        if (!selectedVehicleId) return;

        try {
            setProcessingId(selectedVehicleId);
            setRejectDialogVisible(false);
            await VehicleService.reject(selectedVehicleId, rejectReason);
            Alert.alert('Sucesso', 'Veículo rejeitado com sucesso!');
            await fetchVehicles();
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao rejeitar veículo');
        } finally {
            setProcessingId(null);
            setSelectedVehicleId(null);
            setRejectReason('');
        }
    };

    const renderVehicleItem = ({ item }: { item: Vehicle }) => (
        <VehicleCard
            vehicle={item}
            showActions={true}
            onApprove={handleApprove}
            onReject={handleRejectPress}
        />
    );

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <AppHeader
                    title="Veículos"
                    showBackButton
                    onBackPress={() => navigation.goBack()}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Carregando veículos...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <AppHeader
                    title="Veículos"
                    showBackButton
                    onBackPress={() => navigation.goBack()}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
                        {error}
                    </Text>
                    <Button mode="contained" onPress={fetchVehicles} icon="refresh">
                        Tentar Novamente
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Veículos"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            {vehicles.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Icon name="car-off" size={64} color={theme.colors.onSurfaceVariant} />
                    <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                        Nenhum veículo cadastrado
                    </Text>
                    <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                        {userName} ainda não possui veículos cadastrados no sistema.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={vehicles}
                    renderItem={renderVehicleItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
                    ListHeaderComponent={
                        <Text variant="bodyMedium" style={{ paddingHorizontal: 16, marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
                            {vehicles.length} {vehicles.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
                        </Text>
                    }
                />
            )}

            {/* Reject Dialog */}
            <Portal>
                <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)} style={{ backgroundColor: theme.colors.background }}>
                    <Dialog.Title>Rejeitar Veículo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                            Por favor, informe o motivo da rejeição:
                        </Text>
                        <TextInput
                            mode="outlined"
                            label="Motivo da rejeição"
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            multiline
                            numberOfLines={4}

                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setRejectDialogVisible(false)}>Cancelar</Button>
                        <Button onPress={handleRejectConfirm} textColor={theme.colors.error}>
                            Rejeitar
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Loading overlay when processing */}
            {
                processingId && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                )
            }
        </View >
    );
}
