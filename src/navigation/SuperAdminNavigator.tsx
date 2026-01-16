import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/material-design-icons';
import SuperAdminCampiScreen from '../screens/superadmin/SuperAdminCampiScreen';
import AdminCampusScreen from '../screens/admin/AdminCampusScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserRegisterScreen from '../screens/admin/AdminUserRegisterScreen';
import UserDetailsScreen from '../screens/admin/UserDetailsScreen';
import UserEditScreen from '../screens/admin/UserEditScreen';
import UserVehiclesScreen from '../screens/admin/UserVehiclesScreen';
import AdminVehiclesScreen from '../screens/admin/AdminVehiclesScreen';
import ParkingLotManagementScreen from '../screens/admin/ParkingLotManagementScreen';
import ParkingLotDetailsScreen from '../screens/porter/ParkingLotDetailsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import { CameraScreen } from '../screens/CameraScreen';
import VisitorRegistrationScreen from '../screens/porter/VisitorRegistrationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CampiStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SuperAdminCampi" component={SuperAdminCampiScreen} />
            <Stack.Screen name="AdminCampus" component={AdminCampusScreen} />
            <Stack.Screen name="ParkingLotManagement" component={ParkingLotManagementScreen} />
            <Stack.Screen name="ParkingLotDetails" component={ParkingLotDetailsScreen} />
            <Stack.Screen name="VisitorRegistration" component={VisitorRegistrationScreen} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
        </Stack.Navigator>
    );
}

function UsersStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminUserRegister" component={AdminUserRegisterScreen} />
            <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
            <Stack.Screen name="UserEdit" component={UserEditScreen} />
            <Stack.Screen name="UserVehicles" component={UserVehiclesScreen} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
            <Stack.Screen name="UserEdit" component={UserEditScreen} />
        </Stack.Navigator>
    );
}

function VehiclesStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminVehicles" component={AdminVehiclesScreen} />
            <Stack.Screen name="UserVehicles" component={UserVehiclesScreen} />
        </Stack.Navigator>
    );
}

export function SuperAdminNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => {
                // Logic to hide tab bar for specific screens in Campi stack
                const campiRoute = state.routes.find(r => r.name === 'Campi');
                let shouldHideTabBar = false;

                if (campiRoute?.state) {
                    const stackState = campiRoute.state as any;
                    // Check if stackState.routes exists and has items
                    if (stackState.routes && stackState.routes.length > 0 && typeof stackState.index === 'number') {
                        const currentRoute = stackState.routes[stackState.index];
                        shouldHideTabBar = ['CameraScreen', 'VisitorRegistration', 'ParkingLotDetails'].includes(currentRoute.name);
                    }
                }

                if (shouldHideTabBar) {
                    return null;
                }

                return (
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
                );
            }}
        >
            <Tab.Screen
                name="Campi"
                component={CampiStack}
                options={{
                    tabBarLabel: 'Campi',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="domain" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Users"
                component={UsersStack}
                options={{
                    tabBarLabel: 'Usuários',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Vehicles"
                component={VehiclesStack}
                options={{
                    tabBarLabel: 'Veículos',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="car-multiple" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
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
