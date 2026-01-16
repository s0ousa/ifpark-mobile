import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator, Searchbar, Chip, Portal, Modal, Button, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import { VehicleService, Vehicle } from '../../services/VehicleService';
import VehicleCard from '../../components/VehicleCard';
import { useAuthStore } from '../../store/useAuthStore';
import { CampusService } from '../../services/CampusService';
import { CampusData } from '../../components/CampusInfoCard';
import Select from '../../components/Select';

export default function AdminVehiclesScreen({ navigation }: any) {
    const theme = useTheme();
    const { user } = useAuthStore();
    const isSuperAdmin = user?.papel === 'ROLE_SUPER_ADMIN';

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('TODOS');
    const [selectedCampus, setSelectedCampus] = useState<CampusData | null>(null);
    const [campuses, setCampuses] = useState<CampusData[]>([]);

    // Modal
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const loadData = async () => {
        try {
            setError(null);
            setLoading(true);

            // If Super Admin, fetch campuses for filter
            if (isSuperAdmin && campuses.length === 0) {
                const campusResponse = await CampusService.listCampuses();
                setCampuses(campusResponse.content || []);
            }

            let data: Vehicle[] = [];
            if (isSuperAdmin) {
                if (selectedCampus) {
                    data = await VehicleService.getVehiclesByCampus(selectedCampus.id);
                } else {
                    data = await VehicleService.getAllVehicles();
                }
            } else if (user?.campusId) {
                data = await VehicleService.getVehiclesByCampus(user.campusId);
                // Also could use getAllVehicles if implicit filter, but endpoint safe
            }

            setVehicles(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar veículos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedCampus])
    );

    // Apply local filters
    React.useEffect(() => {
        let result = vehicles;

        // Status Filter
        if (statusFilter !== 'TODOS') {
            result = result.filter(v => v.statusAprovacao === statusFilter);
        }

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(v =>
                v.placa.toLowerCase().includes(query) ||
                v.modelo.toLowerCase().includes(query) ||
                v.pessoa.nome.toLowerCase().includes(query)
            );
        }

        setFilteredVehicles(result);
    }, [vehicles, searchQuery, statusFilter]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const openVehicleDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setModalVisible(true);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Searchbar
                placeholder="Buscar por placa, modelo ou nome"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={theme.colors.primary}
                elevation={1}
            />

            {isSuperAdmin && (
                <View style={[styles.filterRow, { alignItems: 'center' }]}>
                    <View style={{ flex: 1 }}>
                        <Select
                            label="Filtrar por Campus"
                            value={selectedCampus?.id || ''}
                            options={campuses.map(c => ({ label: c.nome, value: c.id }))}
                            onSelect={(value) => setSelectedCampus(campuses.find(c => c.id === value) || null)}
                            placeholder="Todos os Campi"
                        />
                    </View>
                    {selectedCampus && (
                        <TouchableOpacity onPress={() => setSelectedCampus(null)} style={styles.clearFilterButton}>
                            <Icon name="close-circle" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.statusFilterContainer}>
                {(['TODOS', 'PENDENTE', 'APROVADO'] as const).map((filter) => (
                    <Chip
                        key={filter}
                        selected={statusFilter === filter}
                        onPress={() => setStatusFilter(filter)}
                        selectedColor={theme.colors.tertiary}
                        style={{
                            backgroundColor: statusFilter === filter ? theme.colors.secondary : theme.colors.outline,
                        }}
                        textStyle={{
                            fontSize: 13,
                            color: statusFilter === filter ? '#FFFFFF' : theme.colors.onSurface
                        }}
                        showSelectedOverlay
                    >
                        {filter === 'TODOS' ? 'Todos' : filter === 'PENDENTE' ? 'Pendentes' : 'Aprovados'}
                    </Chip>
                ))}
            </View>

            <Text variant="bodyMedium" style={styles.countText}>
                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Gestão de Veículos" />

            {loading && !refreshing && vehicles.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredVehicles}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <VehicleCard
                            vehicle={item}
                            onPress={() => openVehicleDetails(item)}
                            showActions={false} // Actions inside modal/details
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    ListHeaderComponent={renderHeader()}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="car-off" size={64} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                                Nenhum veículo encontrado
                            </Text>
                        </View>
                    }
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            )}

            {/* Details Modal */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    {selectedVehicle && (
                        <View>
                            <View style={styles.modalHeader}>
                                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Detalhes do Veículo</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Icon name="close" size={24} color={theme.colors.onSurface} />
                                </TouchableOpacity>
                            </View>
                            <Divider style={{ marginVertical: 16 }} />

                            <View style={styles.detailRow}>
                                <Text variant="labelLarge" style={styles.detailLabel}>Placa:</Text>
                                <Text variant="bodyLarge">{selectedVehicle.placa}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text variant="labelLarge" style={styles.detailLabel}>Modelo:</Text>
                                <Text variant="bodyLarge">{selectedVehicle.modelo}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text variant="labelLarge" style={styles.detailLabel}>Status:</Text>
                                <Text variant="bodyLarge" style={{
                                    color: selectedVehicle.statusAprovacao === 'APROVADO' ? '#4CAF50' :
                                        selectedVehicle.statusAprovacao === 'REJEITADO' ? '#F44336' : '#FFA726',
                                    fontWeight: 'bold'
                                }}>
                                    {selectedVehicle.statusAprovacao}
                                </Text>
                            </View>
                            {selectedVehicle.motivoRejeicao && (
                                <View style={styles.detailRow}>
                                    <Text variant="labelLarge" style={styles.detailLabel}>Motivo Rejeição:</Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.error, flex: 1 }}>{selectedVehicle.motivoRejeicao}</Text>
                                </View>
                            )}

                            <Divider style={{ marginVertical: 16 }} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Proprietário</Text>

                            <View style={styles.detailRow}>
                                <Text variant="labelLarge" style={styles.detailLabel}>Nome:</Text>
                                <Text variant="bodyLarge" style={{ flex: 1 }}>{selectedVehicle.pessoa.nome}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text variant="labelLarge" style={styles.detailLabel}>Tipo:</Text>
                                <Text variant="bodyLarge">{selectedVehicle.pessoa.tipo}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text variant="labelLarge" style={styles.detailLabel}>Telefone:</Text>
                                <Text variant="bodyLarge">{selectedVehicle.pessoa.telefone}</Text>
                            </View>

                            <Button
                                mode="contained"
                                onPress={() => setModalVisible(false)}
                                style={{ marginTop: 24 }}
                            >
                                Fechar
                            </Button>
                        </View>
                    )}
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
    headerContainer: {
        backgroundColor: '#F5F5F5',
        paddingBottom: 8,
    },
    searchBar: {
        margin: 16,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
    },

    clearFilterButton: {
        marginLeft: 8,
        padding: 4,
    },
    statusFilterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 8,
    },

    countText: {
        paddingHorizontal: 16,
        color: '#666',
        marginBottom: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    detailLabel: {
        width: 120,
        color: '#666',
        fontWeight: 'bold',
    },
});
