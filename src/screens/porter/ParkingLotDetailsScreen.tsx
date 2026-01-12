import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Divider, Icon, TextInput, FAB, Portal, Modal, Button, IconButton } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import { ParkingLot, ParkingLotService } from '../../services/ParkingLotService';
import { MovementService, Movement } from '../../services/MovementService';
import MovementCard from '../../components/MovementCard';

type ParkingLotDetailsScreenProps = {
    route: any;
    navigation: any;
};

export default function ParkingLotDetailsScreen({ route, navigation }: ParkingLotDetailsScreenProps) {
    const theme = useTheme();
    const { parkingLot: initialParkingLot } = route.params as { parkingLot: ParkingLot };
    const [parkingLot, setParkingLot] = useState<ParkingLot>(initialParkingLot);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchPlate, setSearchPlate] = useState('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPlateConfirm, setShowPlateConfirm] = useState(false);
    const [scannedPlate, setScannedPlate] = useState('');

    useEffect(() => {
        loadData();
    }, [parkingLot.id]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [parkingLotData, movementsData] = await Promise.all([
                ParkingLotService.getParkingLotById(parkingLot.id),
                MovementService.getMovementsByParkingLot(parkingLot.id)
            ]);

            setParkingLot(parkingLotData);
            setMovements(movementsData.content);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleRegisterEntry = async () => {
        if (!searchPlate.trim()) {
            setModalError('Por favor, digite a placa do veículo');
            return;
        }

        try {
            setRegistering(true);
            setModalError(null);
            await MovementService.registerEntry(searchPlate.toUpperCase(), parkingLot.id);
            setModalVisible(false);
            setSearchPlate('');
            await loadData();
        } catch (err: any) {
            setModalError(err.message || 'Erro ao registrar entrada');
        } finally {
            setRegistering(false);
        }
    };

    const handleRegisterExit = async () => {
        if (!searchPlate.trim()) {
            setModalError('Por favor, digite a placa do veículo');
            return;
        }

        try {
            setRegistering(true);
            setModalError(null);
            await MovementService.registerExit(searchPlate.toUpperCase(), parkingLot.id);
            setModalVisible(false);
            setSearchPlate('');
            await loadData();
        } catch (err: any) {
            setModalError(err.message || 'Erro ao registrar saída');
        } finally {
            setRegistering(false);
        }
    };

    const filteredMovements = movements.filter(movement => {
        const query = searchQuery.toLowerCase();
        return (
            movement.veiculo.placa.toLowerCase().includes(query) ||
            movement.veiculo.pessoa.nome.toLowerCase().includes(query)
        );
    });


    const renderListHeader = useMemo(() => (
        <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                <Card style={{ flex: 1, backgroundColor: theme.colors.success, borderRadius: 12 }} mode="elevated">
                    <Card.Content style={{ alignItems: 'flex-start', paddingVertical: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Icon source="check-circle-outline" size={30} color="white" />
                            <Text variant="headlineLarge" style={{ fontWeight: 'bold', color: 'white' }}>
                                {parkingLot.vagasLivres}
                            </Text>
                        </View>
                        <Text variant="bodyLarge" style={{ color: 'white' }}>
                            Vagas Livres
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={{ flex: 1, backgroundColor: theme.colors.error, borderRadius: 12 }} mode="elevated">
                    <Card.Content style={{ alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Icon source="car-outline" size={30} color="white" />
                            <Text variant="headlineLarge" style={{ fontWeight: 'bold', color: 'white' }}>
                                {parkingLot.vagasOcupadas}
                            </Text>
                        </View>
                        <Text variant="bodyLarge" style={{ color: 'white' }}>
                            Vagas Ocupadas
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.onBackground }}>
                Histórico
            </Text>
            <View style={{ marginBottom: 16 }}>
                <TextInput
                    mode="outlined"
                    placeholder="Buscar por placa ou nome..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    left={<TextInput.Icon icon="magnify" />}
                    style={{ backgroundColor: theme.colors.surface }}
                />
            </View>
        </>
    ), [parkingLot.vagasLivres, parkingLot.vagasOcupadas, searchQuery, theme]);

    const renderEmptyComponent = () => {
        if (loading) {
            return (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>
                        Carregando histórico...
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Icon source="alert-circle-outline" size={48} color={theme.colors.error} />
                    <Text style={{ marginTop: 12, color: theme.colors.error, textAlign: 'center' }}>
                        {error}
                    </Text>
                    <Button mode="outlined" onPress={loadData} style={{ marginTop: 12 }}>
                        Tentar novamente
                    </Button>
                </View>
            );
        }

        return (
            <View style={{ padding: 40, alignItems: 'center' }}>
                <Icon source="car-off" size={48} color={theme.colors.textSecondary} />
                <Text style={{ marginTop: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                    {searchQuery ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação registrada'}
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title={parkingLot.nome}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <FlatList
                data={filteredMovements}
                renderItem={({ item, index }) => (
                    <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, overflow: 'hidden' }}>
                        <MovementCard movement={item} />
                        {index < filteredMovements.length - 1 && <Divider />}
                    </View>
                )}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            />

            <FAB
                icon="plus"
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 36,
                    borderRadius: 50,
                    backgroundColor: theme.colors.secondary,
                }}
                color="white"
                onPress={() => setModalVisible(true)}
                customSize={72}
            />

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: theme.colors.surface,
                        padding: 24,
                        margin: 20,
                        borderRadius: 16,
                    }}
                >
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.primary }}>
                        Registrar Acesso
                    </Text>

                    <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
                        Digite ou escaneie a placa
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <TextInput
                            mode="outlined"
                            label="Placa do Veículo"
                            placeholder="Ex: ABC-1234"
                            value={searchPlate}
                            onChangeText={(text) => {
                                setSearchPlate(text);
                                setModalError(null);
                            }}
                            autoCapitalize="characters"
                            maxLength={8}
                            error={!!modalError}
                            disabled={registering}
                            style={{ flex: 1, backgroundColor: theme.colors.surface }}
                        />

                        <IconButton
                            icon="barcode-scan"
                            mode="contained"
                            containerColor="#e6ebea"
                            iconColor={theme.colors.primary}
                            size={24}
                            disabled={registering}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('CameraScreen', {
                                    onPlateDetected: (plate: string) => {
                                        setScannedPlate(plate);
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

                    {modalError && (
                        <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 12 }}>
                            {modalError}
                        </Text>
                    )}

                    <View style={{ gap: 12 }}>
                        <Button
                            mode="contained"
                            icon="login"
                            loading={registering}
                            disabled={registering}
                            style={{ backgroundColor: theme.colors.success }}
                            onPress={handleRegisterEntry}
                        >
                            Registrar Entrada
                        </Button>

                        <Button
                            mode="contained"
                            icon="logout"
                            loading={registering}
                            disabled={registering}
                            style={{ backgroundColor: '#2196F3' }}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            onPress={handleRegisterExit}
                        >
                            Registrar Saída
                        </Button>
                        <Divider />
                        <Button
                            mode="contained"
                            icon="account-plus"
                            disabled={registering}
                            style={{ backgroundColor: theme.colors.tertiary }}
                            onPress={() => {
                                setModalVisible(false);
                                setSearchPlate('');
                                setModalError(null);
                                navigation.navigate('VisitorRegistration', {
                                    parkingLotId: parkingLot.id
                                });
                            }}
                        >
                            Registrar Visitante
                        </Button>

                        <Button
                            mode="outlined"
                            disabled={registering}
                            onPress={() => {
                                setModalVisible(false);
                                setSearchPlate('');
                                setModalError(null);
                            }}
                        >
                            Cancelar
                        </Button>
                    </View>
                </Modal>

                {/* Modal de Confirmação da Placa Escaneada */}
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
                        backgroundColor: theme.colors.background,
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
                                setSearchPlate(scannedPlate);
                                setShowPlateConfirm(false);
                                setModalVisible(true);
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
                                    onPlateDetected: (plate: string) => {
                                        setScannedPlate(plate);
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
                            onPress={() => {
                                setShowPlateConfirm(false);
                                setModalVisible(true);
                            }}
                        >
                            Cancelar
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}
