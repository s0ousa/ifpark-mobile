import React, { useState } from 'react';
import { View, StyleSheet, Alert, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator, FAB, Portal, Modal, Button, TextInput, Searchbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import { CampusService } from '../../services/CampusService';
import { ViaCepService } from '../../services/ViaCepService';
import CampusInfoCard, { CampusData } from '../../components/CampusInfoCard';

export default function SuperAdminCampiScreen({ navigation }: any) {
    const theme = useTheme();

    const [campuses, setCampuses] = useState<CampusData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Create Campus Modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [campusName, setCampusName] = useState('');
    const [endereco, setEndereco] = useState({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
    });
    const [saving, setSaving] = useState(false);

    const [loadingCep, setLoadingCep] = useState(false);

    const loadCampuses = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await CampusService.listCampuses();
            setCampuses(response.content || []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar campi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadCampuses();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadCampuses();
    };

    const filteredCampuses = campuses.filter(campus =>
        campus.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campus.endereco.cidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campus.endereco.estado.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCepChange = async (text: string) => {
        let v = text.replace(/\D/g, '');
        v = v.replace(/^(\d{5})(\d)/, '$1-$2');

        setEndereco(prev => ({ ...prev, cep: v }));

        if (v.length === 9) {
            setLoadingCep(true);
            try {
                const addressData = await ViaCepService.getAddress(v);
                if (addressData) {
                    setEndereco(prev => ({
                        ...prev,
                        logradouro: addressData.logradouro,
                        bairro: addressData.bairro,
                        cidade: addressData.localidade,
                        estado: addressData.uf,
                    }));
                }
            } catch (error: any) {
                Alert.alert("Atenção", "CEP não encontrado ou erro ao buscar endereço");
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleCreateCampus = async () => {
        if (!campusName.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o nome do campus');
            return;
        }

        if (!endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado || !endereco.cep) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios do endereço');
            return;
        }

        setSaving(true);
        try {
            // Ensure CEP is formatted correctly or stripped if backend requires
            // Sending with hyphen as per user example "42808-590"
            await CampusService.createCampus({
                nome: campusName,
                endereco: {
                    logradouro: endereco.logradouro,
                    numero: endereco.numero,
                    complemento: endereco.complemento || undefined,
                    bairro: endereco.bairro,
                    cidade: endereco.cidade,
                    estado: endereco.estado,
                    cep: endereco.cep
                }
            });
            Alert.alert('Sucesso', 'Campus criado com sucesso!');
            setCreateModalVisible(false);
            resetForm();
            await loadCampuses();
        } catch (error: any) {
            console.error('Erro ao criar campus:', error);
            Alert.alert('Erro', error.message || 'Erro ao criar campus');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setCampusName('');
        setEndereco({
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        });
    };

    const renderItem = ({ item }: { item: CampusData }) => (
        <CampusInfoCard
            campus={item}
            onPress={() => navigation.navigate('AdminCampus', {
                campusId: item.id,
                campusName: item.nome
            })}
            style={{ marginBottom: 12, marginHorizontal: 16 }}
        />
    );

    const renderEmpty = () => {
        if (loading) return null; // Logic handled by main loading view or filtering
        if (searchQuery.length > 0 && filteredCampuses.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="text-search" size={48} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={styles.emptyStateText}>
                        Nenhum campus encontrado para "{searchQuery}"
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <Icon name="domain" size={64} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={styles.emptyStateText}>
                    Nenhum campus cadastrado
                </Text>
                <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
                    Clique no botão + para criar o primeiro campus
                </Text>
            </View>
        );
    };

    const renderHeader = () => (
        <View>
            <Searchbar
                placeholder="Buscar por nome ou cidade"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={theme.colors.primary}
                inputStyle={{ color: theme.colors.onSurface }}
                elevation={1}
            />
            {!loading && (
                <Text variant="bodyMedium" style={styles.countText}>
                    {filteredCampuses.length} {filteredCampuses.length === 1 ? 'campus encontrado' : 'campi encontrados'}
                </Text>
            )}
        </View>
    );

    if (loading && !refreshing && campuses.length === 0) {
        return (
            <View style={styles.container}>
                <AppHeader title="Campi" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                        Carregando campi...
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <AppHeader title="Campi" />
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16, marginBottom: 16 }}>
                        {error}
                    </Text>
                    <Button mode="contained" onPress={loadCampuses} icon="refresh">
                        Tentar Novamente
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Campi" />

            <FlatList
                data={filteredCampuses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListHeaderComponent={renderHeader()}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            />

            {/* FAB to create new campus */}
            <FAB
                icon="plus"
                customSize={64}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 36,
                    borderRadius: 50,
                    backgroundColor: theme.colors.secondary,
                }}
                color="#FFFFFF"
                onPress={() => setCreateModalVisible(true)}
            />

            {/* Create Campus Modal */}
            <Portal>
                <Modal
                    visible={createModalVisible}
                    onDismiss={() => setCreateModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView>
                        <Text variant="titleLarge" style={styles.modalTitle}>
                            Novo Campus
                        </Text>

                        <TextInput
                            label="Nome do Campus *"
                            value={campusName}
                            onChangeText={setCampusName}
                            mode="outlined"
                            style={styles.input}
                            disabled={saving}
                        />

                        <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>
                            Endereço
                        </Text>

                        <TextInput
                            label="CEP *"
                            value={endereco.cep}
                            onChangeText={handleCepChange}
                            mode="outlined"
                            style={styles.input}
                            disabled={saving}
                            keyboardType="numeric"
                            maxLength={9}
                            right={loadingCep ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                        />

                        <TextInput
                            label="Logradouro *"
                            value={endereco.logradouro}
                            onChangeText={(text) => setEndereco({ ...endereco, logradouro: text })}
                            mode="outlined"
                            style={styles.input}
                            disabled={saving}
                        />

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                                label="Número *"
                                value={endereco.numero}
                                onChangeText={(text) => setEndereco({ ...endereco, numero: text })}
                                mode="outlined"
                                style={[styles.input, { flex: 1 }]}
                                disabled={saving}
                            />
                            <TextInput
                                label="Complemento"
                                value={endereco.complemento}
                                onChangeText={(text) => setEndereco({ ...endereco, complemento: text })}
                                mode="outlined"
                                style={[styles.input, { flex: 2 }]}
                                disabled={saving}
                            />
                        </View>

                        <TextInput
                            label="Bairro *"
                            value={endereco.bairro}
                            onChangeText={(text) => setEndereco({ ...endereco, bairro: text })}
                            mode="outlined"
                            style={styles.input}
                            disabled={saving}
                        />

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                                label="Cidade *"
                                value={endereco.cidade}
                                onChangeText={(text) => setEndereco({ ...endereco, cidade: text })}
                                mode="outlined"
                                style={[styles.input, { flex: 2 }]}
                                disabled={saving}
                            />
                            <TextInput
                                label="UF *"
                                value={endereco.estado}
                                onChangeText={(text) => setEndereco({ ...endereco, estado: text.toUpperCase() })}
                                mode="outlined"
                                style={[styles.input, { flex: 1 }]}
                                disabled={saving}
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                mode="text"
                                onPress={() => {
                                    setCreateModalVisible(false);
                                    resetForm();
                                }}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleCreateCampus}
                                loading={saving}
                                disabled={saving || !campusName.trim()}
                            >
                                Criar
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    searchBar: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    countText: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        padding: 48,
        marginTop: 64,
    },
    emptyStateText: {
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    modal: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        maxHeight: '90%',
    },
    modalTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
});
