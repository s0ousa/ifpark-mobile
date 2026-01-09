import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestHomeScreen from '../screens/TestHomeScreen';

const Stack = createNativeStackNavigator();

export function DriverNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="DriverHome"
                component={TestHomeScreen}
                options={{ title: 'Área do Motorista' }}
            />
        </Stack.Navigator>
    );
}
