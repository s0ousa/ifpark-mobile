import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, useTheme, Divider, Icon, TextInput, FAB, Portal, Modal, Button } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import { ParkingLot } from '../../services/ParkingLotService';

// Mock data para atividade recente
const MOCK_ACTIVITIES = [
    { id: '1', name: 'João Silva Santos', plate: 'ABC-1234', time: '12:30', type: 'exit' },
    { id: '2', name: 'Carlos Mendes Pereira', plate: 'GHI-3456', time: '09:00', type: 'entry' },
    { id: '3', name: 'Maria Oliveira Costa', plate: 'DEF-9012', time: '08:30', type: 'entry' },
    { id: '4', name: 'João Silva Santos', plate: 'ABC-1234', time: '08:15', type: 'entry' },
];

type ParkingLotDetailsScreenProps = {
    route: any;
    navigation: any;
};

export default function ParkingLotDetailsScreen({ route, navigation }: ParkingLotDetailsScreenProps) {
    const theme = useTheme();
    const { parkingLot } = route.params as { parkingLot: ParkingLot };
    const [modalVisible, setModalVisible] = useState(false);
    const [searchPlate, setSearchPlate] = useState('');


    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader
                title={parkingLot.nome}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Contadores */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    {/* Vagas Livres */}
                    <Card style={{ flex: 1, backgroundColor: theme.colors.success, borderRadius: 12 }} mode="elevated">
                        <Card.Content style={{ alignItems: 'flex-start', paddingVertical: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Icon source="check-circle-outline" size={30} color="white" />
                                <Text variant="headlineLarge" style={{ fontWeight: 'bold', color: 'white' }}>
                                    {parkingLot.vagasLivres}
                                </Text>

                            </View>
                            <Text variant="bodyLarge" style={{ color: 'white' }}>
                                Vagas Livres
                            </Text>
                        </Card.Content>
                    </Card>

                    {/* Vagas Ocupadas */}
                    <Card style={{ flex: 1, backgroundColor: theme.colors.error, borderRadius: 12 }} mode="elevated">
                        <Card.Content style={{ alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Icon source="car-outline" size={30} color="white" />

                                <Text variant="headlineLarge" style={{ fontWeight: 'bold', color: 'white' }}>
                                    {parkingLot.vagasOcupadas}
                                </Text>
                            </View>
                            <Text variant="bodyLarge" style={{ color: 'white' }}>
                                Vagas Ocupadas
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, color: theme.colors.onBackground }}>
                        Histórico
                    </Text>
                    <View style={{ marginBottom: 16 }}>
                        <TextInput
                            mode="outlined"
                            placeholder="Buscar por placa ou nome..."
                            left={<TextInput.Icon icon="magnify" />}
                            style={{ backgroundColor: theme.colors.surface }}
                        />
                    </View>
                    <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, overflow: 'hidden' }}>
                        {MOCK_ACTIVITIES.map((activity, index) => (
                            <View key={activity.id}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                                    {/* Ícone */}
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: activity.type === 'entry' ? '#E8F5E9' : '#E3F2FD',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}>
                                        <Icon
                                            source="car"
                                            size={20}
                                            color={activity.type === 'entry' ? theme.colors.success : '#2196F3'}
                                        />
                                    </View>

                                    {/* Informações */}
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyLarge" style={{ fontWeight: '500', color: theme.colors.onSurface }}>
                                            {activity.name}
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
                                            {activity.plate}
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.textTertiary }}>
                                            {activity.time}
                                        </Text>
                                    </View>

                                    {/* Badge */}
                                    <View style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 16,
                                        backgroundColor: activity.type === 'entry' ? '#E8F5E9' : '#E3F2FD'
                                    }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            color: activity.type === 'entry' ? theme.colors.success : '#2196F3'
                                        }}>
                                            {activity.type === 'entry' ? 'Entrada' : 'Saída'}
                                        </Text>
                                    </View>
                                </View>
                                {index < MOCK_ACTIVITIES.length - 1 && <Divider />}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* FAB para Registrar Acesso */}
            <FAB
                icon="plus"
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.colors.secondary,
                }}
                color="white"
                onPress={() => setModalVisible(true)}
            />

            {/* Modal de Registro de Acesso */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: theme.colors.surface,
                        padding: 24,
                        margin: 20,
                        borderRadius: 16,
                    }}
                >
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 20, color: theme.colors.primary }}>
                        Registrar Acesso
                    </Text>

                    <TextInput
                        mode="outlined"
                        label="Placa do Veículo"
                        placeholder="Ex: ABC-1234"
                        value={searchPlate}
                        onChangeText={setSearchPlate}
                        autoCapitalize="characters"
                        maxLength={8}
                        style={{ marginBottom: 20, backgroundColor: theme.colors.surface }}
                    />

                    <View style={{ gap: 12 }}>
                        <Button
                            mode="contained"
                            icon="login"
                            style={{ backgroundColor: theme.colors.success }}
                            onPress={() => {
                                // TODO: Implementar lógica de entrada
                                setModalVisible(false);
                                setSearchPlate('');
                            }}
                        >
                            Registrar Entrada
                        </Button>

                        <Button
                            mode="contained"
                            icon="logout"
                            style={{ backgroundColor: '#2196F3' }}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            onPress={() => {
                                // TODO: Implementar lógica de saída
                                setModalVisible(false);
                                setSearchPlate('');
                            }}
                        >
                            Registrar Saída
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={() => {
                                setModalVisible(false);
                                setSearchPlate('');
                            }}
                        >
                            Cancelar
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}
