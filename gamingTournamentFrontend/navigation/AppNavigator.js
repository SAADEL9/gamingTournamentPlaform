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
      <Stack.Navigator>
        {!user ? (
          // 🛑 Not Logged In
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : user.email === ADMIN_EMAIL ? (
          // 🛡️ Admin Stack
          <>
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="AddEditTournament" component={AddEditTournamentScreen} options={{ title: 'Manage Tournament' }} />
          </>
        ) : (
          // 👤 User Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="myTournaments" component={MyTournamentsScreen} options={{ title: 'My Tournaments' }} />
            <Stack.Screen name="Tournaments" component={TournamentsScreen} options={{ title: 'Tournaments' }} />
            <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Public Profile' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
