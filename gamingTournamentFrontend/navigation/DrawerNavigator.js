import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Image, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';

import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import MyTournamentsScreen from '../screens/myTournamentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import FriendsScreen from '../screens/FriendsScreen';
import CreateTeamScreen from '../screens/CreateTeamScreen';
import TeamRequestsScreen from '../screens/TeamRequestsScreen';
import MyTeamScreen from '../screens/MyTeamScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    const { colors, theme, toggleTheme } = useTheme();
    const user = auth.currentUser;

    const handleSignOut = () => {
        auth.signOut();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: colors.surface }}>
                {/* User Profile Header */}
                <View style={[styles.drawerHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <Image
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                        style={[styles.profileImage, { borderColor: colors.primary }]}
                    />
                    <Text style={[styles.userName, { color: colors.text }]}>{user?.displayName || 'Gamer'}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
                </View>

                {/* Drawer Items */}
                <View style={styles.drawerItemsContainer}>
                    <DrawerItem
                        label="Home"
                        icon={({ color }) => <MaterialCommunityIcons name="home" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Home')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.textSecondary}
                    />
                    <DrawerItem
                        label="Tournaments"
                        icon={({ color }) => <MaterialCommunityIcons name="trophy" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Tournaments')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.textSecondary}
                    />
                    <DrawerItem
                        label="My Tournaments"
                        icon={({ color }) => <MaterialCommunityIcons name="gamepad-variant" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('myTournaments')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.textSecondary}
                    />

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <DrawerItem
                        label="Profile"
                        icon={({ color }) => <MaterialCommunityIcons name="account" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Profile')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.textSecondary}
                    />
                    <DrawerItem
                        label="Friends"
                        icon={({ color }) => <MaterialCommunityIcons name="account-multiple" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('Friends')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.textSecondary}
                    />
                    <DrawerItem
                        label="Find Players"
                        icon={({ color }) => <MaterialCommunityIcons name="account-search" color={color} size={24} />}
                        onPress={() => props.navigation.navigate('AddFriend')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.textSecondary}
                    />
                </View>

                {/* Theme Toggle */}
                <View style={[styles.themeToggle, { borderTopColor: colors.border }]}>
                    <View style={styles.themeToggleRow}>
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.textSecondary} />
                        <Text style={[styles.themeText, { color: colors.text }]}>Dark Mode</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: colors.primary }}
                            thumbColor={theme === 'dark' ? "#f4f3f4" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleTheme}
                            value={theme === 'dark'}
                        />
                    </View>
                </View>
            </DrawerContentScrollView>

            {/* Footer */}
            <View style={[styles.drawerFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                    <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
                    <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function DrawerNavigator() {
    const { colors } = useTheme();

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0 },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: 'bold', color: colors.text },
                drawerStyle: { backgroundColor: colors.background },
                drawerActiveBackgroundColor: colors.surface,
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.textSecondary,
                sceneContainerStyle: { backgroundColor: colors.background },
            }}
        >
            <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} /> }} />
            <Drawer.Screen name="Tournaments" component={TournamentsScreen} options={{ title: 'Browse Tournaments' }} />
            <Drawer.Screen name="myTournaments" component={MyTournamentsScreen} options={{ title: 'My Tournaments' }} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="FriendRequests" component={FriendRequestsScreen} options={{ title: 'Pending Requests' }} />
            <Drawer.Screen name="Friends" component={FriendsScreen} options={{ title: 'My Friends' }} />
            <Drawer.Screen name="AddFriend" component={AddFriendScreen} options={{ title: 'Find Players' }} />
            <Drawer.Screen name="CreateTeam" component={CreateTeamScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="TeamRequests" component={TeamRequestsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="MyTeam" component={MyTeamScreen} options={{ drawerItemStyle: { display: 'none' }, title: "My Team" }} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
        borderWidth: 2,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userEmail: {
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
        marginVertical: 10,
        marginHorizontal: 20,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    themeToggle: {
        padding: 20,
        borderTopWidth: 1,
    },
    themeToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    themeText: {
        flex: 1,
        marginLeft: 10,
        fontWeight: '500',
        fontSize: 16,
    }
});
