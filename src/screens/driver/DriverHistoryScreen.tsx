import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator, Searchbar, Divider } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import { MovementService, Movement } from '../../services/MovementService';
import { useAuthStore } from '../../store/useAuthStore';

export default function DriverHistoryScreen() {
    const theme = useTheme();
    const { user } = useAuthStore();
    const [movements, setMovements] = useState<Movement[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMovements = async (isRefreshing = false) => {
        if (!user?.id) {
            setError('Usuário não identificado');
            setLoading(false);
            return;
        }

        try {
            if (!isRefreshing) setLoading(true);
            setError(null);

            const response = await MovementService.getMovementsByUser(user.id);
            setMovements(response.content);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar histórico');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMovements(true);
    };

    // Filter movements by search query (plate or parking lot name)
    const filteredMovements = useMemo(() => {
        if (!searchQuery.trim()) return movements;

        const query = searchQuery.toLowerCase().trim();
        return movements.filter(m =>
            m.veiculo.placa.toLowerCase().includes(query) ||
            m.estacionamento.nome.toLowerCase().includes(query)
        );
    }, [movements, searchQuery]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderMovementCard = ({ item }: { item: Movement }) => {
        const isStillParked = !item.dataSaida;
        const iconColor = isStillParked ? theme.colors.success : '#2196F3';
        const iconBackgroundColor = isStillParked ? '#E8F5E9' : '#E3F2FD';

        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardContent}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: iconBackgroundColor }]}>
                            <Icon name="car" size={20} color={iconColor} />
                        </View>
                    </View>

                    {/* Information */}
                    <View style={styles.infoContainer}>
                        {/* Parking lot name */}
                        <View style={styles.headerSection}>
                            <Text variant="bodyLarge" style={[styles.parkingName, { color: theme.colors.onSurface }]}>
                                {item.estacionamento.nome}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary }}>
                                {item.veiculo.placa} • {item.veiculo.modelo}
                            </Text>
                        </View>

                        {/* Entry and Exit times */}
                        <View style={styles.timesSection}>
                            {/* Entry */}
                            <View style={styles.timeRow}>
                                <View style={[styles.badge, styles.entryBadge]}>
                                    <Text style={[styles.badgeText, { color: theme.colors.success }]}>
                                        ENTRADA
                                    </Text>
                                </View>
                                <Text variant="bodyMedium" style={[styles.timeText, { color: theme.colors.onSurface }]}>
                                    {formatDate(item.dataEntrada)}
                                </Text>
                            </View>

                            {/* Exit */}
                            <View style={styles.timeRow}>
                                <View style={[styles.badge, styles.exitBadge]}>
                                    <Text style={[styles.badgeText, styles.exitBadgeText]}>
                                        SAÍDA
                                    </Text>
                                </View>
                                {item.dataSaida ? (
                                    <Text variant="bodyMedium" style={[styles.timeText, { color: theme.colors.onSurface }]}>
                                        {formatDate(item.dataSaida)}
                                    </Text>
                                ) : (
                                    <Text variant="bodyMedium" style={[styles.timeText, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                                        Ainda no estacionamento
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                Nenhuma movimentação
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                Você ainda não possui histórico de movimentações.
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="alert-circle" size={64} color={theme.colors.error} />
            <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                Erro ao carregar
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {error}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Histórico" />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <>
                    {/* Search Bar */}
                    <Searchbar
                        placeholder="Buscar por placa ou estacionamento"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        iconColor={theme.colors.primary}
                        elevation={1}
                    />

                    {/* Total Counter */}
                    <View style={styles.counterContainer}>
                        <Text variant="bodyMedium" style={styles.counterText}>
                            Total de movimentações: <Text style={styles.counterNumber}>{totalElements}</Text>
                        </Text>
                    </View>

                    {/* Movement List */}
                    <FlatList
                        data={filteredMovements}
                        renderItem={renderMovementCard}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => <Divider />}
                        ListEmptyComponent={renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.colors.primary]}
                            />
                        }
                        contentContainerStyle={filteredMovements.length === 0 ? styles.emptyList : { paddingBottom: 16, paddingHorizontal: 16 }}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    cardContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    cardContent: {
        flexDirection: 'row',
        gap: 12,
    },
    iconContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    headerSection: {
        marginBottom: 12,
    },
    parkingName: {
        fontWeight: '600',
    },
    timesSection: {
        gap: 8,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 70,
        alignItems: 'center',
    },
    entryBadge: {
        backgroundColor: '#E8F5E9',
    },
    exitBadge: {
        backgroundColor: '#E3F2FD',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    exitBadgeText: {
        color: '#2196F3',
    },
    timeText: {
        flex: 1,
    },
    searchBar: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    counterContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    counterText: {
        color: '#666',
    },
    counterNumber: {
        fontWeight: 'bold',
        color: '#075E54',
    },
});
