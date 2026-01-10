import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text, Surface, useTheme, Icon } from 'react-native-paper';
import { ParkingLot } from '../services/ParkingLotService';

type ParkingLotCardProps = {
    parkingLot: ParkingLot;
};

export default function ParkingLotCard({ parkingLot }: ParkingLotCardProps) {
    const theme = useTheme();

    const occupancyRate = (parkingLot.vagasOcupadas / parkingLot.capacidadeTotal) * 100;

    const statusColor = useMemo(() => {
        if (occupancyRate >= 80) return theme.colors.error;
        if (occupancyRate >= 60) return '#FB8C00';
        return theme.colors.success || '#4CAF50';
    }, [occupancyRate, theme]);

    const isFull = parkingLot.vagasLivres === 0;

    return (
        <Surface
            style={{
                marginBottom: 16,
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                elevation: 3,
                overflow: 'hidden',
            }}
        >

            <View
                style={{
                    height: 6,
                    backgroundColor: statusColor,
                    width: '100%'
                }}
            />

            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text variant="titleMedium" style={{ fontWeight: '400', color: theme.colors.onSurface, marginBottom: 2 }}>
                            {parkingLot.nome}
                        </Text>
                    </View>
                    <Icon source={"chevron-right"} color={theme.colors.textSecondary} size={24} />
                    {/* <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: statusColor,
                        opacity: 0.9
                    }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                            {isFull ? 'Lotado' : 'Disponível'}
                        </Text>
                    </View> */}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                        Vagas Livres
                    </Text>
                    <Text
                        variant="displaySmall"
                        style={{
                            fontWeight: '400',
                            color: statusColor,
                            lineHeight: 40
                        }}
                    >
                        {parkingLot.vagasLivres}
                    </Text>
                </View>

                <View>
                    <View style={{
                        height: 8,
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: 4,
                        overflow: 'hidden',
                        marginBottom: 4
                    }}>
                        <View
                            style={{
                                height: '100%',
                                width: `${Math.min(occupancyRate, 100)}%`,
                                backgroundColor: statusColor,
                                borderRadius: 4
                            }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text variant="labelSmall" style={{ color: theme.colors.textSecondary }}>Ocupadas: {parkingLot.vagasOcupadas}</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.textSecondary }}>Capacidade: {parkingLot.capacidadeTotal}</Text>
                    </View>
                </View>
            </View>
        </Surface>
    );
}
