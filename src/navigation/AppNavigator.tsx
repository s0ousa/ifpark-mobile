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

    console.log('User papel:', user.papel);
    console.log('User object:', JSON.stringify(user, null, 2));

    switch (user.papel) {
        case 'ROLE_VIGIA':
            console.log('Navigating to PorterNavigator');
            return <PorterNavigator />;
        case 'ROLE_ADMIN':
            console.log('Navigating to AdminNavigator');
            return <AdminNavigator />;
        case 'ROLE_SUPER_ADMIN':
            console.log('Navigating to SuperAdminNavigator');
            return <SuperAdminNavigator />;
        case 'ROLE_COMUM':
            console.log('Navigating to DriverNavigator');
            return <DriverNavigator />;
        default:
            console.log('Navigating to DriverNavigator (default)');
            return <DriverNavigator />;
    }
}
