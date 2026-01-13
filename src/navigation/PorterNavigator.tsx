import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';

import PorterHomeScreen from '../screens/porter/PorterHomeScreen';
import ParkingLotDetailsScreen from '../screens/porter/ParkingLotDetailsScreen';
import VisitorRegistrationScreen from '../screens/porter/VisitorRegistrationScreen';
import PorterDriversScreen from '../screens/porter/PorterDriversScreen';
import PorterProfileScreen from '../screens/porter/PorterProfileScreen';
import { CameraScreen } from '../screens/CameraScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator para a tab de Operação
function OperationsStack() {
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
            <Stack.Screen
                name="VisitorRegistration"
                component={VisitorRegistrationScreen}
            />
            <Stack.Screen
                name="CameraScreen"
                component={CameraScreen}
            />
        </Stack.Navigator>
    );
}

export function PorterNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => {
                // Get the focused route in the Operations stack
                const operationsRoute = state.routes.find(r => r.name === 'Operations');
                let shouldHideTabBar = false;

                if (operationsRoute?.state) {
                    const stackState = operationsRoute.state as any;
                    const currentRoute = stackState.routes[stackState.index];

                    // Hide tab bar on specific screens
                    shouldHideTabBar = ['ParkingLotDetails', 'VisitorRegistration', 'CameraScreen'].includes(currentRoute.name);
                }

                // Don't render the tab bar if it should be hidden
                if (shouldHideTabBar) {
                    return null;
                }

                return (
                    <BottomNavigation.Bar
                        navigationState={state}
                        safeAreaInsets={insets}
                        compact={false}
                        style={{
                            backgroundColor: '#FFFFFF',
                        }}
                        activeColor={theme.colors.secondary}
                        activeIndicatorStyle={{
                            backgroundColor: `${theme.colors.secondary}20`,
                            width: 64,
                            height: 32,
                        }}
                        inactiveColor="#999999"
                        onTabPress={({ route, preventDefault }) => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (event.defaultPrevented) {
                                preventDefault();
                            } else {
                                navigation.dispatch({
                                    ...CommonActions.navigate(route.name, route.params),
                                    target: state.key,
                                });
                            }
                        }}
                        renderIcon={({ route, focused, color }) => {
                            const { options } = descriptors[route.key];
                            if (options.tabBarIcon) {
                                return options.tabBarIcon({ focused, color, size: 24 });
                            }
                            return null;
                        }}
                        getLabelText={({ route }) => {
                            const { options } = descriptors[route.key];
                            const label = options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;
                            return typeof label === 'string' ? label : route.name;
                        }}
                    />
                );
            }}
        >
            <Tab.Screen
                name="Operations"
                component={OperationsStack}
                options={{
                    tabBarLabel: 'Operação',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Drivers"
                component={PorterDriversScreen}
                options={{
                    tabBarLabel: 'Motoristas',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={PorterProfileScreen}
                options={{
                    tabBarLabel: 'Meu Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
