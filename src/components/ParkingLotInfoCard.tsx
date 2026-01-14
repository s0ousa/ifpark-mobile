import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ParkingLot } from '../services/ParkingLotService';

type ParkingLotInfoCardProps = {
    parkingLot: ParkingLot;
};

export default function ParkingLotInfoCard({ parkingLot }: ParkingLotInfoCardProps) {
    const theme = useTheme();

    const percentageOccupied = (parkingLot.vagasOcupadas / parkingLot.capacidadeTotal) * 100;
    const percentageAvailable = 100 - percentageOccupied;

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
                        backgroundColor: parkingLot.vagasLivres > 0 ? theme.colors.tertiary : theme.colors.error,
                    }}
                />
            </View>

            {/* Available spots info */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Disponíveis
                </Text>
                <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                    {parkingLot.vagasLivres}
                </Text>
            </View>

            {/* Progress bar */}
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
                            width: `${percentageAvailable}%`,
                            backgroundColor: theme.colors.tertiary,
                            borderRadius: 4,
                        }}
                    />
                </View>
            </View>

            {/* Capacity label */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    0
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {parkingLot.capacidadeTotal} vagas
                </Text>
            </View>
        </View>
    );
}
