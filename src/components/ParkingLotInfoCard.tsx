import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ParkingLot } from '../services/ParkingLotService';

type ParkingLotInfoCardProps = {
    parkingLot: ParkingLot;
};

export default function ParkingLotInfoCard({ parkingLot }: ParkingLotInfoCardProps) {
    const theme = useTheme();

    const occupancyRate = (parkingLot.vagasOcupadas / parkingLot.capacidadeTotal) * 100;

    const statusColor = useMemo(() => {
        if (occupancyRate >= 80) return theme.colors.error;
        if (occupancyRate >= 60) return '#FB8C00'; // Orange
        return theme.colors.success || '#4CAF50'; // Green
    }, [occupancyRate, theme]);

    return (
        <View
            style={{
                backgroundColor: '#FFFFFF',
                marginHorizontal: 16,
                marginBottom: 12,
                borderRadius: 12,
                padding: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            {/* Header with name and status indicator */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>
                    {parkingLot.nome}
                </Text>
                <View
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: statusColor,
                    }}
                />
            </View>

            {/* Available spots info */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Disponíveis
                </Text>
                <Text variant="headlineMedium" style={{ color: statusColor }}>
                    {parkingLot.vagasLivres}
                </Text>
            </View>

            {/* Progress bar - represents OCCUPANCY */}
            <View style={{ marginBottom: 4 }}>
                <View
                    style={{
                        height: 8,
                        backgroundColor: '#E0E0E0',
                        borderRadius: 4,
                        overflow: 'hidden',
                    }}
                >
                    <View
                        style={{
                            height: '100%',
                            width: `${Math.min(occupancyRate, 100)}%`,
                            backgroundColor: statusColor,
                            borderRadius: 4,
                        }}
                    />
                </View>
            </View>

            {/* Capacity label */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Ocupadas: {parkingLot.vagasOcupadas}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Capacidade: {parkingLot.capacidadeTotal}
                </Text>
            </View>
        </View>
    );
}
