import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator, Chip, Searchbar, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import { UserService } from '../../services/UserService';
import { Driver, DriversResponse } from '../../types/Driver';

export default function PorterDriversScreen() {
    const theme = useTheme();

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchDrivers = async (pageNum: number = 0, refresh: boolean = false) => {
        try {
            setError(null);
            if (refresh) {
                setRefreshing(true);
            } else if (pageNum === 0) {
                setLoading(true);
            }

            const response: DriversResponse = await UserService.getDrivers(pageNum, 10);

            if (pageNum === 0 || refresh) {
                setDrivers(response.content);
            } else {
                setDrivers(prev => [...prev, ...response.content]);
            }

            setPage(response.number);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar motoristas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDrivers(0);
        }, [])
    );

    const handleRefresh = () => {
        fetchDrivers(0, true);
    };

    const handleLoadMore = () => {
        if (!loading && page < totalPages - 1) {
            fetchDrivers(page + 1);
        }
    };

    const filteredDrivers = drivers.filter(driver =>
        driver.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.veiculos.some(v => v.placa.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderDriverCard = ({ item }: { item: Driver }) => (
        <View>
            <View
                style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                {/* Icon */}
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${theme.colors.secondary}15`,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                    }}
                >
                    <Icon name="car" size={20} color={theme.colors.secondary} />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    {/* Name with status icon */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text variant="bodyLarge" style={{ marginRight: 4 }}>
                            {item.nome}
                        </Text>
                        {item.status === 'PENDENTE' && (
                            <Icon
                                name="clock-outline"
                                size={16}
                                color="#FFA726"
                            />
                        )}
                        {item.tipo === 'VISITANTE' && (
                            <Chip
                                mode="flat"
                                compact
                                style={{
                                    backgroundColor: `${theme.colors.primary}20`,
                                    height: 24,
                                    marginLeft: 4,
                                }}
                                textStyle={{ color: theme.colors.primary, fontSize: 11, marginVertical: 0 }}
                            >
                                VISITANTE
                            </Chip>
                        )}
                    </View>

                    {/* Vehicles */}
                    {item.veiculos.length > 0 ? (
                        <View style={{ marginLeft: 12 }}>
                            {item.veiculos.map((veiculo, index) => (
                                <View
                                    key={veiculo.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: index === 0 ? 0 : 2
                                    }}
                                >
                                    <Text
                                        variant="bodySmall"
                                        style={{ color: theme.colors.onSurfaceVariant }}
                                    >
                                        {veiculo.placa} • {veiculo.modelo}
                                    </Text>
                                    {veiculo.statusAprovacao === 'APROVADO' && (
                                        <Icon
                                            name="check-circle"
                                            size={14}
                                            color={theme.colors.tertiary}
                                            style={{ marginLeft: 4 }}
                                        />
                                    )}
                                    {veiculo.statusAprovacao === 'PENDENTE' && (
                                        <Icon
                                            name="clock-outline"
                                            size={14}
                                            color="#FFA726"
                                            style={{ marginLeft: 4 }}
                                        />
                                    )}
                                    {veiculo.statusAprovacao === 'REJEITADO' && (
                                        <Icon
                                            name="close-circle"
                                            size={14}
                                            color={theme.colors.error}
                                            style={{ marginLeft: 4 }}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', marginLeft: 12 }}>
                            Nenhum veículo cadastrado
                        </Text>
                    )}
                </View>
            </View>
            <Divider />
        </View>
    );

    if (loading && drivers.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <AppHeader title="Motoristas" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Carregando motoristas...</Text>
                </View>
            </View>
        );
    }

    if (error && drivers.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <AppHeader title="Motoristas" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
                        {error}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16, textAlign: 'center' }}>
                        Não foi possível carregar a lista de motoristas
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <AppHeader title="Motoristas" />

            <FlatList
                data={filteredDrivers}
                renderItem={renderDriverCard}
                keyExtractor={item => item.id}
                ListHeaderComponent={
                    <View>
                        <View >
                            <Searchbar
                                placeholder="Buscar por nome ou placa"
                                onChangeText={setSearchQuery}
                                value={searchQuery}
                                style={{ backgroundColor: '#F5F5F5' }}
                                iconColor={theme.colors.primary}
                                inputStyle={{ color: theme.colors.onSurface }}
                            />
                        </View>

                        {/* Legend */}
                        <View style={{

                            padding: 12,
                            borderRadius: 8,
                        }}>
                            <Text variant="labelSmall" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                                Legenda
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="check-circle" size={14} color={theme.colors.tertiary} />
                                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                                        Aprovado
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="clock-outline" size={14} color="#FFA726" />
                                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                                        Pendente
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="close-circle" size={14} color={theme.colors.error} />
                                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                                        Rejeitado
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                }
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && drivers.length > 0 ? (
                        <View style={{ paddingVertical: 16 }}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: 40 }}>
                        <Icon name="account-search" size={64} color={theme.colors.onSurfaceVariant} />
                        <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                            Nenhum motorista encontrado
                        </Text>
                        <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                            Tente ajustar sua busca
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
