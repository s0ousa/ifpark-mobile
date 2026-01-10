import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PorterHomeScreen from '../screens/porter/PorterHomeScreen';
import ParkingLotDetailsScreen from '../screens/porter/ParkingLotDetailsScreen';

const Stack = createNativeStackNavigator();

export function PorterNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="PorterHome"
                component={PorterHomeScreen}
            />
            <Stack.Screen
                name="ParkingLotDetails"
                component={ParkingLotDetailsScreen}
            />
        </Stack.Navigator>
    );
}
