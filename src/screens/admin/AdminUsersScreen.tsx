import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator, Searchbar, FAB, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import UserCard, { UserData } from '../../components/UserCard';
import { CampusService } from '../../services/CampusService';
import Select from '../../components/Select';
import { CampusData } from '../../components/CampusInfoCard';
import { UserService } from '../../services/UserService';
import { useAuthStore } from '../../store/useAuthStore';

type StatusFilter = 'ALL' | 'ATIVO' | 'PENDENTE' | 'REJEITADO';

export default function AdminUsersScreen({ navigation }: any) {
    const theme = useTheme();
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    // Super Admin Filter
    const [campusFilter, setCampusFilter] = useState<string>('ALL');
    const [campusOptions, setCampusOptions] = useState<{ label: string; value: string }[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            loadUsers();
            if (currentUser?.papel === 'ROLE_SUPER_ADMIN') {
                loadCampuses();
            }
        }, [])
    );

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, statusFilter, campusFilter]);

    const loadCampuses = async () => {
        try {
            const response = await CampusService.listCampuses();
            const campuses: CampusData[] = response.content || [];
            // Remove the 'Todos' option from the list itself if we handle it via placeholder or initial state
            // But Select component needs options. Let's send raw options and handle 'ALL' display via placeholder or initial
            const options = campuses.map(c => ({ label: c.nome, value: c.id }));
            setCampusOptions(options);
        } catch (error) {
            console.error('Erro ao carregar campi para filtro:', error);
        }
    };

    const loadUsers = async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const response = await UserService.getAllUsers(0, 100); // Get all users
            setUsers(response.content);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar usuários');
        } finally {
            if (isRefreshing) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    const onRefresh = () => {
        loadUsers(true);
        if (currentUser?.papel === 'ROLE_SUPER_ADMIN') {
            loadCampuses();
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter out the currently logged-in user
        if (currentUser?.id) {
            filtered = filtered.filter(user => user.id !== currentUser.id);
        }

        // Campus Filter (Super Admin only)
        if (campusFilter !== 'ALL') {
            filtered = filtered.filter(user => user.campus.id === campusFilter);
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(user => user.pessoa.status === statusFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.pessoa.nome.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.pessoa.cpf.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
            );
        }

        setFilteredUsers(filtered);
    };

    const getFilterLabel = (filter: StatusFilter) => {
        switch (filter) {
            case 'ALL':
                return 'Todos';
            case 'ATIVO':
                return 'Aprovados';
            case 'PENDENTE':
                return 'Pendentes';
            case 'REJEITADO':
                return 'Rejeitados';
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <AppHeader title="Usuários" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16, color: '#666' }}>Carregando usuários...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <AppHeader title="Usuários" />
                <View style={styles.centerContent}>
                    <Icon name="alert-circle" size={48} color={theme.colors.error} />
                    <Text style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>{error}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Usuários" />

            <View style={{ flex: 1 }}>
                <Searchbar
                    placeholder="Buscar por nome, email ou CPF"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    iconColor={theme.colors.primary}
                    elevation={1}
                />

                {currentUser?.papel === 'ROLE_SUPER_ADMIN' && (
                    <View style={styles.filterRow}>
                        <View style={{ flex: 1 }}>
                            <Select
                                label="Filtrar por Campus"
                                value={campusFilter === 'ALL' ? '' : campusFilter}
                                options={campusOptions}
                                onSelect={setCampusFilter}
                                icon="domain"
                                placeholder="Todos os Campi"
                            />
                        </View>
                        {campusFilter !== 'ALL' && (
                            <TouchableOpacity onPress={() => setCampusFilter('ALL')} style={styles.clearFilterButton}>
                                <Icon name="close-circle" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {(['ALL', 'ATIVO', 'PENDENTE', 'REJEITADO'] as StatusFilter[]).map((filter) => (
                            <Chip
                                key={filter}
                                selected={statusFilter === filter}
                                onPress={() => setStatusFilter(filter)}
                                selectedColor={theme.colors.tertiary}
                                style={{
                                    backgroundColor: statusFilter === filter ? theme.colors.secondary : theme.colors.outline
                                }}
                                textStyle={{
                                    fontSize: 13,
                                    color: statusFilter === filter ? '#FFFFFF' : theme.colors.onSurface
                                }}
                                showSelectedOverlay
                            >
                                {getFilterLabel(filter)}
                            </Chip>
                        ))}
                    </View>
                </View>

                {/* Users List */}
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <UserCard
                            user={item}
                            onPress={() => {
                                navigation.navigate('UserDetails', { userId: item.id });
                            }}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="account-off" size={64} color={theme.colors.onSurfaceVariant} />
                            <Text variant="titleMedium" style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>
                                Nenhum usuário encontrado
                            </Text>
                            <Text variant="bodyMedium" style={{ marginTop: 8, color: '#999', textAlign: 'center' }}>
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Tente ajustar os filtros'
                                    : 'Não há usuários cadastrados'}
                            </Text>
                        </View>
                    }
                />

                <FAB
                    icon="plus"
                    style={{
                        position: 'absolute',
                        margin: 16,
                        right: 0,
                        bottom: 36,
                        borderRadius: 50,
                        backgroundColor: theme.colors.secondary,
                    }}
                    color="white"
                    onPress={() => navigation.navigate('AdminUserRegister')}
                    customSize={64}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    searchBar: {
        margin: 16,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    clearFilterButton: {
        marginLeft: 8,
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    }
});
