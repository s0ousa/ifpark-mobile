import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, useTheme, TextInput, Button, Switch, Card, Divider } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import { ParkingLot } from '../../services/ParkingLotService';

type ParkingLotManagementScreenProps = {
    route: any;
    navigation: any;
};

export default function ParkingLotManagementScreen({ route, navigation }: ParkingLotManagementScreenProps) {
    const theme = useTheme();
    const { parkingLot } = route.params as { parkingLot: ParkingLot | null };

    const isEditing = parkingLot !== null;

    const [nome, setNome] = useState(parkingLot?.nome || '');
    const [capacidadeTotal, setCapacidadeTotal] = useState(parkingLot?.capacidadeTotal.toString() || '');
    const [ativo, setAtivo] = useState(parkingLot?.ativo ?? true);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!nome.trim()) {
            Alert.alert('Erro', 'Por favor, informe o nome do estacionamento');
            return;
        }

        if (!capacidadeTotal.trim() || parseInt(capacidadeTotal) <= 0) {
            Alert.alert('Erro', 'Por favor, informe uma capacidade válida');
            return;
        }

        try {
            setSaving(true);

            // TODO: Implement create/update parking lot service methods
            if (isEditing) {
                // await ParkingLotService.updateParkingLot(parkingLot.id, {
                //     nome,
                //     capacidadeTotal: parseInt(capacidadeTotal),
                //     ativo,
                // });
                Alert.alert('Sucesso', 'Estacionamento atualizado com sucesso!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                // await ParkingLotService.createParkingLot({
                //     nome,
                //     capacidadeTotal: parseInt(capacidadeTotal),
                //     campusId: user.campus.id,
                // });
                Alert.alert('Sucesso', 'Estacionamento criado com sucesso!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao salvar estacionamento');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja desativar este estacionamento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desativar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            // TODO: Implement deactivate parking lot
                            // await ParkingLotService.deactivateParkingLot(parkingLot!.id);
                            Alert.alert('Sucesso', 'Estacionamento desativado com sucesso!', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (err: any) {
                            Alert.alert('Erro', err.message || 'Erro ao desativar estacionamento');
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title={isEditing ? 'Editar Estacionamento' : 'Novo Estacionamento'}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Informações Básicas
                        </Text>

                        <TextInput
                            label="Nome do Estacionamento"
                            value={nome}
                            onChangeText={setNome}
                            mode="outlined"
                            style={styles.input}
                            disabled={saving}
                            placeholder="Ex: Estacionamento Principal"
                        />

                        <TextInput
                            label="Capacidade Total"
                            value={capacidadeTotal}
                            onChangeText={setCapacidadeTotal}
                            mode="outlined"
                            keyboardType="numeric"
                            style={styles.input}
                            disabled={saving}
                            placeholder="Ex: 50"
                        />

                        {isEditing && (
                            <>
                                <Divider style={{ marginVertical: 16 }} />

                                <View style={styles.switchRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyLarge" style={styles.switchLabel}>
                                            Estacionamento Ativo
                                        </Text>
                                        <Text variant="bodySmall" style={styles.switchDescription}>
                                            {ativo ? 'Disponível para uso' : 'Desativado'}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={ativo}
                                        onValueChange={setAtivo}
                                        disabled={saving}
                                        color={theme.colors.primary}
                                    />
                                </View>

                                {parkingLot && (
                                    <>
                                        <Divider style={{ marginVertical: 16 }} />

                                        <View style={styles.statsRow}>
                                            <View style={styles.statItem}>
                                                <Text variant="bodySmall" style={styles.statLabel}>
                                                    Vagas Livres
                                                </Text>
                                                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.success }]}>
                                                    {parkingLot.vagasLivres}
                                                </Text>
                                            </View>

                                            <View style={styles.statItem}>
                                                <Text variant="bodySmall" style={styles.statLabel}>
                                                    Vagas Ocupadas
                                                </Text>
                                                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.error }]}>
                                                    {parkingLot.vagasOcupadas}
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </>
                        )}
                    </Card.Content>
                </Card>

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                        style={styles.saveButton}
                        icon="content-save"
                    >
                        {isEditing ? 'Salvar Alterações' : 'Criar Estacionamento'}
                    </Button>

                    {isEditing && ativo && (
                        <Button
                            mode="outlined"
                            onPress={handleDelete}
                            disabled={saving}
                            style={styles.deleteButton}
                            textColor={theme.colors.error}
                            icon="delete"
                        >
                            Desativar Estacionamento
                        </Button>
                    )}

                    <Button
                        mode="text"
                        onPress={() => navigation.goBack()}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchLabel: {
        fontWeight: '500',
    },
    switchDescription: {
        color: '#666',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#666',
        marginBottom: 8,
    },
    statValue: {
        fontWeight: 'bold',
    },
    actions: {
        gap: 12,
    },
    saveButton: {
        marginBottom: 8,
    },
    deleteButton: {
        borderColor: '#EF5350',
    },
});
