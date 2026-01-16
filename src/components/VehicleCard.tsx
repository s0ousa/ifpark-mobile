import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme, Chip, Button } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import { Vehicle } from '../services/VehicleService';

type VehicleCardProps = {
    vehicle: Vehicle;
    showActions?: boolean;
    onApprove?: (vehicleId: string) => void;
    onReject?: (vehicleId: string) => void;
    onPress?: () => void;
};

export default function VehicleCard({ vehicle, showActions = false, onApprove, onReject, onPress }: VehicleCardProps) {
    const theme = useTheme();

    const getStatusBadge = () => {
        switch (vehicle.statusAprovacao) {
            case 'APROVADO':
                return {
                    label: 'Aprovado',
                    backgroundColor: '#4CAF5020',
                    textColor: '#4CAF50',
                };
            case 'PENDENTE':
                return {
                    label: 'Pendente',
                    backgroundColor: '#FFA72620',
                    textColor: '#FFA726',
                };
            case 'REJEITADO':
                return {
                    label: 'Rejeitado',
                    backgroundColor: '#F4433620',
                    textColor: '#F44336',
                };
            default:
                return {
                    label: 'Desconhecido',
                    backgroundColor: '#E0E0E0',
                    textColor: '#666666',
                };
        }
    };

    const badge = getStatusBadge();

    const cardContent = (
        <View
            style={{
                marginHorizontal: 16,
                marginBottom: 12,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Car Icon */}
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: `${theme.colors.secondary}15`,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                    }}
                >
                    <Icon name="car" size={24} color={theme.colors.secondary} />
                </View>

                {/* Vehicle Info */}
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 2 }}>
                        {vehicle.placa}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {vehicle.modelo}
                    </Text>
                </View>

                {/* Status Badge */}
                <Chip
                    mode="flat"
                    compact
                    style={{
                        backgroundColor: badge.backgroundColor,
                    }}
                    textStyle={{
                        color: badge.textColor,
                    }}
                >
                    {badge.label}
                </Chip>
            </View>

            {/* Action Buttons - Only show for pending vehicles when showActions is true */}
            {showActions && vehicle.statusAprovacao === 'PENDENTE' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    <Button
                        mode="contained"
                        onPress={() => onApprove?.(vehicle.id)}
                        style={{ flex: 1, backgroundColor: theme.colors.secondary }}
                        icon="check"
                    >
                        Aprovar
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => onReject?.(vehicle.id)}
                        style={{ flex: 1, borderColor: theme.colors.error }}
                        textColor={theme.colors.error}
                        icon="close"
                    >
                        Rejeitar
                    </Button>
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
}
