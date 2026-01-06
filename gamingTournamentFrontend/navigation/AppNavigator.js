import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from "../screens/TournamentsScreen";
import AuthScreen from "../screens/AuthScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminScreen from "../screens/AdminScreen";
import AddEditTournamentScreen from "../screens/AddEditTournamentScreen";
import TournamentDetailScreen from "../screens/TournamentDetailScreen";
import MyTournamentsScreen from "../screens/myTournamentsScreen";
import AddFriendScreen from "../screens/AddFriendScreen";
import FriendRequestsScreen from "../screens/FriendRequestsScreen";

import DrawerNavigator from "./DrawerNavigator";

const ADMIN_EMAIL = "admin@gmail.com";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; // Or a splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 🛑 Not Logged In
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : user.email === ADMIN_EMAIL ? (
          // 🛡️ Admin Stack
          <>
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard', headerShown: true }} />
            <Stack.Screen name="AddEditTournament" component={AddEditTournamentScreen} options={{ title: 'Manage Tournament', headerShown: true }} />
          </>
        ) : (
          // 👤 User Stack (Wrapped in Drawer)
          <>
            <Stack.Screen name="Root" component={DrawerNavigator} />
            {/* Screens that should be pushed ON TOP of drawer (like details) */}
            <Stack.Screen
              name="TournamentDetail"
              component={TournamentDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
