import React from 'react';
import { View } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import { Movement } from '../services/MovementService';

type MovementCardProps = {
    movement: Movement;
};

export default function MovementCard({ movement }: MovementCardProps) {
    const theme = useTheme();

    // Determina se o veículo ainda está no estacionamento
    const isStillParked = !movement.dataSaida;

    // Cor do ícone baseada na permanência
    const iconColor = isStillParked ? theme.colors.success : '#2196F3';
    const iconBackgroundColor = isStillParked ? '#E8F5E9' : '#E3F2FD';

    // Formata data para exibição
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

    return (
        <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Coluna esquerda: Ícone */}
                <View style={{ alignItems: 'center' }}>
                    {/* Ícone do carro */}
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: iconBackgroundColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Icon
                            source="car"
                            size={20}
                            color={iconColor}
                        />
                    </View>
                </View>

                {/* Coluna direita: Informações */}
                <View style={{ flex: 1 }}>
                    {/* Nome e informações do veículo */}
                    <View style={{ marginBottom: 12 }}>
                        <Text variant="bodyLarge" style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                            {movement.veiculo.pessoa.nome}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary }}>
                            {movement.veiculo.placa} • {movement.veiculo.modelo}
                        </Text>
                    </View>

                    {/* Badges e datas alinhados */}
                    <View style={{ gap: 8 }}>
                        {/* Linha de entrada: Badge + Data */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12,
                                backgroundColor: '#E8F5E9',
                                minWidth: 70,
                                alignItems: 'center'
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                    color: theme.colors.success
                                }}>
                                    ENTRADA
                                </Text>
                            </View>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                                {formatDate(movement.dataEntrada)}
                            </Text>
                        </View>

                        {/* Linha de saída: Badge + Data */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12,
                                backgroundColor: '#E3F2FD',
                                minWidth: 70,
                                alignItems: 'center'
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                    color: '#2196F3'
                                }}>
                                    SAÍDA
                                </Text>
                            </View>
                            {movement.dataSaida ? (
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                                    {formatDate(movement.dataSaida)}
                                </Text>
                            ) : (
                                <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary, flex: 1, fontStyle: 'italic' }}>
                                    Ainda no estacionamento
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
