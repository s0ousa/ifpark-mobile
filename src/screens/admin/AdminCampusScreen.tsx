import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator, Card, FAB, Portal, Modal, Button, TextInput, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import { useAuthStore } from '../../store/useAuthStore';
import { UserService } from '../../services/UserService';
import { ParkingLotService, ParkingLot } from '../../services/ParkingLotService';
import { CampusService, Campus } from '../../services/CampusService';
import ParkingLotInfoCard from '../../components/ParkingLotInfoCard';
import CampusInfoCard from '../../components/CampusInfoCard';
import { theme } from '../../theme';

export default function AdminCampusScreen({ navigation }: any) {
    const theme = useTheme();
    const { user } = useAuthStore();

    const [campusData, setCampusData] = useState<Campus | null>(null);
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [editCampusModalVisible, setEditCampusModalVisible] = useState(false);
    const [campusName, setCampusName] = useState('');
    const [endereco, setEndereco] = useState({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
    });
    const [saving, setSaving] = useState(false);

    // Create Parking Lot Modal states
    const [createParkingLotModalVisible, setCreateParkingLotModalVisible] = useState(false);
    const [newParkingLotName, setNewParkingLotName] = useState('');
    const [newParkingLotCapacity, setNewParkingLotCapacity] = useState('');

    const loadData = async () => {
        if (!user?.id) return;

        try {
            setError(null);
            setLoading(true);

            // Get user data to get campus ID
            const userData = await UserService.getUserById(user.id);

            // Get campus data with statistics
            const campus = await CampusService.getCampusById(userData.campus.id);
            setCampusData(campus);
            setCampusName(campus.nome);

            const parkingLotsData = await ParkingLotService.getParkingLotsByCampus(userData.campus.id);
            setParkingLots(parkingLotsData.content);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [user?.id])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleSaveCampus = async () => {
        if (!campusData || !campusName.trim()) return;

        setSaving(true);
        try {
            const updateData = {
                nome: campusName,
                endereco: endereco
            };
            console.log('Updating campus with data:', JSON.stringify(updateData, null, 2));
            console.log('Campus ID:', campusData.id);

            await CampusService.updateCampus(campusData.id, updateData);
            await loadData();
            setEditCampusModalVisible(false);
            setCampusName('');
            setEndereco({
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                estado: '',
                cep: ''
            });
        } catch (error: any) {
            console.error('Error updating campus:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error message:', error.message);
            setError('Erro ao atualizar campus: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleCreateParkingLot = async () => {
        if (!campusData || !newParkingLotName.trim() || !newParkingLotCapacity.trim()) return;

        const capacity = parseInt(newParkingLotCapacity);
        if (isNaN(capacity) || capacity <= 0) {
            setError('Capacidade deve ser um número maior que zero');
            return;
        }

        setSaving(true);
        try {
            await ParkingLotService.createParkingLot({
                nome: newParkingLotName,
                campusId: campusData.id,
                capacidadeTotal: capacity
            });
            await loadData();
            setCreateParkingLotModalVisible(false);
            setNewParkingLotName('');
            setNewParkingLotCapacity('');
        } catch (error: any) {
            console.error('Error creating parking lot:', error);
            setError('Erro ao criar estacionamento: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };

    const getOccupancyColor = (lot: ParkingLot) => {
        const rate = (lot.vagasOcupadas / lot.capacidadeTotal) * 100;
        if (rate >= 80) return theme.colors.error;
        if (rate >= 60) return '#FB8C00';
        return theme.colors.success || '#4CAF50';
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AppHeader title="Campus" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                        Carregando...
                    </Text>
                </View>
            </View>
        );
    }

    if (error || !campusData) {
        return (
            <View style={styles.container}>
                <AppHeader title="Campus" />
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, marginBottom: 16 }}>
                        {error || 'Erro ao carregar dados'}
                    </Text>
                    <Button mode="contained" onPress={loadData} icon="refresh">
                        Tentar Novamente
                    </Button>
                </View>
            </View>
        );
    }

    return (

        <View style={styles.container}>
            <AppHeader title="Campus" />
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Campus Info Card */}
                <CampusInfoCard
                    style={{ marginTop: 16 }}
                    campus={campusData}
                    onEdit={() => {
                        setCampusName(campusData.nome);
                        setEndereco({
                            logradouro: campusData.endereco.logradouro,
                            numero: campusData.endereco.numero,
                            complemento: campusData.endereco.complemento || '',
                            bairro: campusData.endereco.bairro,
                            cidade: campusData.endereco.cidade,
                            estado: campusData.endereco.estado,
                            cep: campusData.endereco.cep
                        });
                        setEditCampusModalVisible(true);
                    }}
                />

                {/* Parking Lots Section */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Estacionamentos
                    </Text>

                    {parkingLots.length > 0 ? (
                        parkingLots.map((lot) => (
                            <ParkingLotInfoCard
                                key={lot.id}
                                parkingLot={lot}
                                onPress={() => navigation.navigate('ParkingLotDetails', { parkingLot: lot })}
                                showChevron={true}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="parking" size={48} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodyMedium" style={styles.emptyStateText}>
                                Nenhum estacionamento cadastrado
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB to create new parking lot */}
            <FAB
                icon="plus"
                customSize={64}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 36,
                    borderRadius: 50,
                    backgroundColor: theme.colors.secondary,
                }}
                color="#FFFFFF"
                onPress={() => setCreateParkingLotModalVisible(true)}
            />

            {/* Edit Campus Name Modal */}
            <Portal>
                <Modal
                    visible={editCampusModalVisible}
                    onDismiss={() => setEditCampusModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>
                        Editar Campus
                    </Text>

                    <TextInput
                        label="Nome do Campus"
                        value={campusName}
                        onChangeText={setCampusName}
                        mode="outlined"
                        style={styles.input}
                        disabled={saving}
                    />

                    <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>
                        Endereço
                    </Text>

                    <TextInput
                        label="Logradouro"
                        value={endereco.logradouro}
                        onChangeText={(text) => setEndereco({ ...endereco, logradouro: text })}
                        mode="outlined"
                        style={styles.input}
                        disabled={saving}
                    />

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput
                            label="Número"
                            value={endereco.numero}
                            onChangeText={(text) => setEndereco({ ...endereco, numero: text })}
                            mode="outlined"
                            style={[styles.input, { flex: 1 }]}
                            disabled={saving}
                        />
                        <TextInput
                            label="Complemento"
                            value={endereco.complemento}
                            onChangeText={(text) => setEndereco({ ...endereco, complemento: text })}
                            mode="outlined"
                            style={[styles.input, { flex: 2 }]}
                            disabled={saving}
                        />
                    </View>

                    <TextInput
                        label="Bairro"
                        value={endereco.bairro}
                        onChangeText={(text) => setEndereco({ ...endereco, bairro: text })}
                        mode="outlined"
                        style={styles.input}
                        disabled={saving}
                    />

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput
                            label="Cidade"
                            value={endereco.cidade}
                            onChangeText={(text) => setEndereco({ ...endereco, cidade: text })}
                            mode="outlined"
                            style={[styles.input, { flex: 2 }]}
                            disabled={saving}
                        />
                        <TextInput
                            label="UF"
                            value={endereco.estado}
                            onChangeText={(text) => setEndereco({ ...endereco, estado: text })}
                            mode="outlined"
                            style={[styles.input, { flex: 1 }]}
                            disabled={saving}
                            maxLength={2}
                        />
                    </View>

                    <TextInput
                        label="CEP"
                        value={endereco.cep}
                        onChangeText={(text) => setEndereco({ ...endereco, cep: text })}
                        mode="outlined"
                        style={styles.input}
                        disabled={saving}
                        keyboardType="numeric"
                    />

                    <View style={styles.modalActions}>
                        <Button
                            mode="text"
                            onPress={() => setEditCampusModalVisible(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSaveCampus}
                            loading={saving}
                            disabled={saving || !campusName.trim()}
                        >
                            Salvar
                        </Button>
                    </View>
                </Modal>
            </Portal>

            {/* Create Parking Lot Modal */}
            <Portal>
                <Modal
                    visible={createParkingLotModalVisible}
                    onDismiss={() => setCreateParkingLotModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>
                        Novo Estacionamento
                    </Text>

                    <TextInput
                        label="Nome do Estacionamento"
                        value={newParkingLotName}
                        onChangeText={setNewParkingLotName}
                        mode="outlined"
                        style={styles.input}
                        disabled={saving}
                    />

                    <TextInput
                        label="Capacidade Total"
                        value={newParkingLotCapacity}
                        onChangeText={(text) => setNewParkingLotCapacity(text.replace(/[^0-9]/g, ''))}
                        mode="outlined"
                        style={styles.input}
                        disabled={saving}
                        keyboardType="numeric"
                        placeholder="Ex: 50"
                    />

                    <View style={styles.modalActions}>
                        <Button
                            mode="text"
                            onPress={() => setCreateParkingLotModalVisible(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreateParkingLot}
                            loading={saving}
                            disabled={saving || !newParkingLotName.trim() || !newParkingLotCapacity.trim()}
                        >
                            Criar
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    campusCard: {
        margin: 16,
        marginBottom: 8,
    },
    campusHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    campusIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    campusName: {
        fontWeight: 'bold',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    campusLocation: {
        color: '#666',
        marginLeft: 4,
    },
    campusAddress: {
        color: '#666',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginVertical: 12,
    },
    parkingLotCard: {
        marginHorizontal: 16,
        marginBottom: 12,
    },
    parkingLotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    parkingLotName: {
        fontWeight: '500',
    },
    parkingLotCapacity: {
        color: '#666',
        marginTop: 4,
    },
    occupancyBar: {
        marginTop: 8,
    },
    occupancyBarBackground: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    occupancyBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    occupancyStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyStateText: {
        color: '#666',
        marginTop: 12,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: 20,
        borderRadius: 12,
    },
    modalTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
});
