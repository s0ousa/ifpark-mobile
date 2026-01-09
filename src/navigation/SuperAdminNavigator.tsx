import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestHomeScreen from '../screens/TestHomeScreen';

const Stack = createNativeStackNavigator();

export function SuperAdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SuperAdminHome"
                component={TestHomeScreen}
                options={{ title: 'Super Admin' }}
            />
        </Stack.Navigator>
    );
}
