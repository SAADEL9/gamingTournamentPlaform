import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { auth } from '../firebase';

import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import MyTournamentsScreen from '../screens/myTournamentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    const user = auth.currentUser;

    const handleSignOut = () => {
        auth.signOut();
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: COLORS.surface }}>
                {/* User Profile Header */}
                <View style={styles.drawerHeader}>
                    <Image
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>{user?.displayName || 'Gamer'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Drawer Items */}
                <View style={styles.drawerItemsContainer}>
                    <DrawerItem
                        label="Home"
                        icon={({ color }) => <MaterialCommunityIcons name="home" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Home')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={COLORS.primary}
                        inactiveTintColor={COLORS.textSecondary}
                    />
                    <DrawerItem
                        label="Tournaments"
                        icon={({ color }) => <MaterialCommunityIcons name="trophy" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Tournaments')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={COLORS.primary}
                        inactiveTintColor={COLORS.textSecondary}
                    />
                    <DrawerItem
                        label="My Tournaments"
                        icon={({ color }) => <MaterialCommunityIcons name="gamepad-variant" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('myTournaments')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={COLORS.primary}
                        inactiveTintColor={COLORS.textSecondary}
                    />

                    <View style={styles.divider} />

                    <DrawerItem
                        label="Profile"
                        icon={({ color }) => <MaterialCommunityIcons name="account" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Profile')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={COLORS.primary}
                        inactiveTintColor={COLORS.textSecondary}
                    />
                    <DrawerItem
                        label="Friends"
                        icon={({ color }) => <MaterialCommunityIcons name="account-multiple" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('FriendRequests')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={COLORS.primary}
                        inactiveTintColor={COLORS.textSecondary}
                    />
                    <DrawerItem
                        label="Find Players"
                        icon={({ color }) => <MaterialCommunityIcons name="account-search" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('AddFriend')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={COLORS.primary}
                        inactiveTintColor={COLORS.textSecondary}
                    />
                </View>
            </DrawerContentScrollView>

            {/* Footer */}
            <View style={styles.drawerFooter}>
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                    <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: COLORS.surface, elevation: 0, shadowOpacity: 0 },
                headerTintColor: COLORS.text,
                headerTitleStyle: { fontWeight: 'bold', color: COLORS.text },
                drawerStyle: { backgroundColor: COLORS.background },
                drawerActiveBackgroundColor: COLORS.surface,
                drawerActiveTintColor: COLORS.primary,
                drawerInactiveTintColor: COLORS.textSecondary,
                sceneContainerStyle: { backgroundColor: COLORS.background }, // Sets background for all screens in drawer
            }}
        >
            <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} /> }} />
            <Drawer.Screen name="Tournaments" component={TournamentsScreen} options={{ title: 'Browse Tournaments' }} />
            <Drawer.Screen name="myTournaments" component={MyTournamentsScreen} options={{ title: 'My Tournaments' }} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="FriendRequests" component={FriendRequestsScreen} options={{ title: 'Friends' }} />
            <Drawer.Screen name="AddFriend" component={AddFriendScreen} options={{ title: 'Find Players' }} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        backgroundColor: COLORS.surface,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.card,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    userName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    userEmail: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    drawerItemsContainer: {
        flex: 1,
        paddingTop: 10,
    },
    drawerLabel: {
        fontSize: 16,
        marginLeft: -10,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.card,
        marginVertical: 10,
        marginHorizontal: 20,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.card,
        backgroundColor: COLORS.surface,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    signOutText: {
        fontSize: 16,
        color: COLORS.error,
        fontWeight: 'bold',
    },
});
