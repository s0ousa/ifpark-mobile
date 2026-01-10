import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button, Surface, IconButton, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { ParkingLotService, ParkingLot } from '../../services/ParkingLotService';
import ParkingLotCard from '../../components/ParkingLotCard';
import AppHeader from '../../components/AppHeader';

export default function PorterHomeScreen() {
    const theme = useTheme();
    const { user, signOut } = useAuthStore();

    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchParkingLots = async () => {
        if (!user?.campusId) {
            setError('Campus não identificado');
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await ParkingLotService.getParkingLotsByCampus(user.campusId);
            setParkingLots(response.content);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar estacionamentos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchParkingLots();
    }, [user?.campusId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchParkingLots();
    };

    const handleLogout = async () => {
        await signOut();
    };

    const renderParkingLot = ({ item }: { item: ParkingLot }) => {
        return <ParkingLotCard parkingLot={item} />;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16 }}>Carregando estacionamentos...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 16 }}>
                    {error}
                </Text>
                <Button mode="contained" onPress={fetchParkingLots}>
                    Tentar Novamente
                </Button>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title="Portaria"
                showRightIcon
                rightIcon="logout"
                onRightIconPress={handleLogout}
            />
            <Text variant="titleMedium"
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    color: theme.colors.primary,
                    fontWeight: 'bold'
                }}
            >
                Estacionamentos {parkingLots.length > 0 ? parkingLots[0].campus.nome : ''}
            </Text>
            <Divider />
            <FlatList
                data={parkingLots}
                renderItem={renderParkingLot}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                style={{ backgroundColor: theme.colors.background }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.tertiary]}
                    />
                }
                ListEmptyComponent={
                    <View style={{ padding: 48, alignItems: 'center' }}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.textSecondary }}>
                            Nenhum estacionamento encontrado
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
