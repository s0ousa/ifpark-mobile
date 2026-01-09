import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

import { AuthStack } from './AuthStack';
import { DriverNavigator } from './DriverNavigator';
import { PorterNavigator } from './PorterNavigator';
import { AdminNavigator } from './AdminNavigator';
import { SuperAdminNavigator } from './SuperAdminNavigator';

export function AppNavigator() {
    const { user, loading, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!user) {
        return <AuthStack />;
    }

    switch (user.papel) {
        case 'ROLE_VIGIA':
            return <PorterNavigator />;
        case 'ROLE_ADMIN':
            return <AdminNavigator />;
        case 'ROLE_SUPER_ADMIN':
            return <SuperAdminNavigator />;
        case 'ROLE_COMUM':
            return <DriverNavigator />;
        default:
            return <DriverNavigator />;
    }
}
