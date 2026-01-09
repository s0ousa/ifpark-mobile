import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestHomeScreen from '../screens/TestHomeScreen';

const Stack = createNativeStackNavigator();

export function AdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AdminHome"
                component={TestHomeScreen}
                options={{ title: 'Administração do Campus' }}
            />
        </Stack.Navigator>
    );
}
