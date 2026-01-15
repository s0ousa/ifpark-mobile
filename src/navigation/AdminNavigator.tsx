import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AdminCampusScreen from '../screens/admin/AdminCampusScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import ParkingLotManagementScreen from '../screens/admin/ParkingLotManagementScreen';
import ParkingLotDetailsScreen from '../screens/porter/ParkingLotDetailsScreen';
import PorterProfileScreen from '../screens/porter/PorterProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CampusStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminCampus" component={AdminCampusScreen} />
            <Stack.Screen name="ParkingLotManagement" component={ParkingLotManagementScreen} />
            <Stack.Screen name="ParkingLotDetails" component={ParkingLotDetailsScreen} />
        </Stack.Navigator>
    );
}

export function AdminNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => (
                <BottomNavigation.Bar
                    navigationState={state}
                    safeAreaInsets={insets}
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
                        return options.tabBarLabel !== undefined
                            ? options.tabBarLabel.toString()
                            : options.title !== undefined
                                ? options.title
                                : route.name;
                    }}
                    style={{
                        backgroundColor: '#FFFFFF',
                    }}
                    activeColor={theme.colors.primary}
                    inactiveColor="#757575"
                    activeIndicatorStyle={{
                        backgroundColor: `${theme.colors.primary}20`,
                        width: 64,
                        height: 32,
                    }}
                    compact={false}
                />
            )}
        >
            <Tab.Screen
                name="Campus"
                component={CampusStack}
                options={{
                    tabBarLabel: 'Campus',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="domain" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Users"
                component={AdminUsersScreen}
                options={{
                    tabBarLabel: 'Usuários',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={PorterProfileScreen}
                options={{
                    tabBarLabel: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
