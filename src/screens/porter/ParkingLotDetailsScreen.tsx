import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Divider, Icon, Searchbar, FAB, Portal, Modal, Button, IconButton, TextInput } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import { ParkingLot, ParkingLotService } from '../../services/ParkingLotService';
import { MovementService, Movement } from '../../services/MovementService';
import MovementCard from '../../components/MovementCard';
import { useAuthStore } from '../../store/useAuthStore';

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

    // Edit modal states (for admin)
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editCapacity, setEditCapacity] = useState('');
    const [saving, setSaving] = useState(false);

    const { user } = useAuthStore();
    const isAdmin = (user as any)?.papel === 'ROLE_ADMIN';
    const isSuperAdmin = (user as any)?.papel === 'ROLE_SUPER_ADMIN';

    console.log('ParkingLotDetailsScreen - User:', user);
    console.log('ParkingLotDetailsScreen - Papel:', (user as any)?.papel);
    console.log('ParkingLotDetailsScreen - isAdmin:', isAdmin);

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

    const handleUpdateParkingLot = async () => {
        if (!editName.trim() || !editCapacity.trim()) return;

        const capacity = parseInt(editCapacity);
        if (isNaN(capacity) || capacity <= 0) {
            setModalError('Capacidade deve ser um número maior que zero');
            return;
        }

        setSaving(true);
        setModalError(null);
        try {
            const updatedLot = await ParkingLotService.updateParkingLot(parkingLot.id, {
                nome: editName,
                capacidadeTotal: capacity
            });
            setParkingLot(updatedLot);
            setEditModalVisible(false);
            setEditName('');
            setEditCapacity('');
            await loadData();
        } catch (err: any) {
            setModalError(err.message || 'Erro ao atualizar estacionamento');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        setSaving(true);
        setModalError(null);
        try {
            const updatedLot = await ParkingLotService.toggleParkingLotStatus(parkingLot.id, !parkingLot.ativo);
            setParkingLot(updatedLot);
            setEditModalVisible(false);
            await loadData();
        } catch (err: any) {
            setModalError(err.message || 'Erro ao alterar status do estacionamento');
        } finally {
            setSaving(false);
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
                <Searchbar
                    placeholder="Buscar por placa ou nome..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                        marginBottom: 8,
                        backgroundColor: '#FFFFFF',
                    }}
                    iconColor={theme.colors.primary}
                    inputStyle={{ color: theme.colors.onSurface }}
                    elevation={1}
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

            {isSuperAdmin ? (
                <>
                    <FAB
                        icon="pencil"
                        style={{
                            position: 'absolute',
                            margin: 16,
                            right: 0,
                            bottom: 110, // Above the register FAB
                            borderRadius: 50,
                            backgroundColor: theme.colors.tertiary, // Distinct color for edit
                        }}
                        color="white"
                        onPress={() => {
                            setEditName(parkingLot.nome);
                            setEditCapacity(parkingLot.capacidadeTotal.toString());
                            setEditModalVisible(true);
                        }}
                        customSize={56} // Slightly smaller or standard
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
                        customSize={64}
                    />
                </>
            ) : (
                <FAB
                    icon={isAdmin ? "pencil" : "plus"}
                    style={{
                        position: 'absolute',
                        margin: 16,
                        right: 0,
                        bottom: 36,
                        borderRadius: 50,
                        backgroundColor: theme.colors.secondary,
                    }}
                    color="white"
                    onPress={() => {
                        if (isAdmin) {
                            setEditName(parkingLot.nome);
                            setEditCapacity(parkingLot.capacidadeTotal.toString());
                            setEditModalVisible(true);
                        } else {
                            setModalVisible(true);
                        }
                    }}
                    customSize={64}
                />
            )}

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

                {/* Edit Parking Lot Modal (Admin only) */}
                <Modal
                    visible={editModalVisible}
                    onDismiss={() => setEditModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: 'white',
                        padding: 24,
                        marginHorizontal: 20,
                        borderRadius: 12,
                    }}
                >
                    <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                        Editar Estacionamento
                    </Text>

                    {modalError && (
                        <Text style={{ color: theme.colors.error, marginBottom: 12 }}>
                            {modalError}
                        </Text>
                    )}

                    <TextInput
                        label="Nome do Estacionamento"
                        value={editName}
                        onChangeText={setEditName}
                        mode="outlined"
                        style={{ marginBottom: 12 }}
                        disabled={saving}
                    />

                    <TextInput
                        label="Capacidade Total"
                        value={editCapacity}
                        onChangeText={(text) => setEditCapacity(text.replace(/[^0-9]/g, ''))}
                        mode="outlined"
                        style={{ marginBottom: 20 }}
                        disabled={saving}
                        keyboardType="numeric"
                    />

                    <Button
                        mode="contained"
                        icon={parkingLot.ativo ? "close-circle" : "check-circle"}
                        onPress={handleToggleStatus}
                        loading={saving}
                        disabled={saving}
                        style={{
                            backgroundColor: parkingLot.ativo ? theme.colors.error : theme.colors.success,
                            marginBottom: 16
                        }}
                    >
                        {parkingLot.ativo ? 'Desativar estacionamento' : 'Ativar estacionamento'}
                    </Button>

                    <Divider style={{ marginBottom: 16 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                        <Button
                            mode="text"
                            onPress={() => setEditModalVisible(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleUpdateParkingLot}
                            loading={saving}
                            disabled={saving || !editName.trim() || !editCapacity.trim()}
                        >
                            Salvar
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}
