import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator, Searchbar, FAB, Chip } from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppHeader from '../../components/AppHeader';
import UserCard, { UserData } from '../../components/UserCard';
import { UserService } from '../../services/UserService';

type StatusFilter = 'ALL' | 'ATIVO' | 'PENDENTE' | 'REJEITADO';

export default function AdminUsersScreen() {
    const theme = useTheme();
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, statusFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await UserService.getAllUsers(0, 100); // Get all users
            setUsers(response.content);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Apply status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(user => user.pessoa.status === statusFilter);
        }

        // Apply search filter
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

    if (loading) {
        return (
            <View style={styles.container}>
                <AppHeader title="Usuários" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Carregando usuários...</Text>
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
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Usuários" />

            <View style={styles.content}>
                {/* Search Bar */}
                <Searchbar
                    placeholder="Buscar por nome, email ou CPF"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    iconColor={theme.colors.primary}
                    inputStyle={{ color: theme.colors.onSurface }}
                />

                {/* Status Filters */}
                <View style={styles.filtersContainer}>

                    <View style={styles.filters}>
                        {(['ALL', 'ATIVO', 'PENDENTE', 'REJEITADO'] as StatusFilter[]).map((filter) => (
                            <Chip
                                key={filter}
                                selected={statusFilter === filter}
                                onPress={() => setStatusFilter(filter)}
                                style={[
                                    styles.filterChip,
                                    statusFilter === filter && { backgroundColor: theme.colors.primary }
                                ]}
                                textStyle={[
                                    styles.filterChipText,
                                    { color: statusFilter === filter ? '#FFFFFF' : theme.colors.onSurface }
                                ]}
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
                                // TODO: Navigate to user details
                                console.log('User clicked:', item.id);
                            }}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="account-off" size={64} color={theme.colors.onSurfaceVariant} />
                            <Text variant="titleMedium" style={styles.emptyText}>
                                Nenhum usuário encontrado
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptySubtext}>
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
                    onPress={() => {
                        // TODO: Navigate to create user screen
                        console.log('Create user clicked');
                    }}
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
    content: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        color: '#666',
        textAlign: 'center',
    },
    searchBar: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        elevation: 2,
        backgroundColor: '#FFFFFF',
    },
    filtersContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    filterLabel: {
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    filters: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    filterChip: {
        height: 32,
    },
    filterChipText: {
        fontSize: 13,
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyText: {
        marginTop: 16,
        color: '#666',
        textAlign: 'center',
    },
    emptySubtext: {
        marginTop: 8,
        color: '#999',
        textAlign: 'center',
    },
});
