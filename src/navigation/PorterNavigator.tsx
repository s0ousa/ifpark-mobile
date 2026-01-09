import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestHomeScreen from '../screens/TestHomeScreen';

const Stack = createNativeStackNavigator();

export function PorterNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="PorterHome"
                component={TestHomeScreen}
                options={{ title: 'Área da Portaria' }}
            />
        </Stack.Navigator>
    );
}
