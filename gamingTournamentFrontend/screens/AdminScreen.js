import React, { useState, useCallback, useLayoutEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import api from "../api/api";
import { useTheme } from "../context/ThemeContext";
import { SHADOWS } from "../constants/theme";

export default function AdminScreen({ navigation }) {
    const { colors } = useTheme();

    const [tournaments, setTournaments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('tournaments'); // 'tournaments' | 'users'

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false // Custom header
        });
    }, [navigation]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, uRes] = await Promise.all([
                api.get("/tournament"),
                api.get("/user/search?query=") // Hack to get all users
            ]);
            setTournaments(tRes.data);
            setUsers(uRes.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch dashboard data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleDeleteTournament = async (id) => {
        Alert.alert(
            "Delete Tournament",
            "Are you sure you want to delete this tournament? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/tournament/delete/${id}`);
                            setTournaments(prev => prev.filter(t => (t.id || t._id) !== id));
                            Alert.alert("Deleted", "Tournament removed.");
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete tournament.");
                        }
                    }
                }
            ]
        );
    };

    const handleGenerateBracket = async (id) => {
        try {
            await api.post(`/matches/generate/${id}`);
            Alert.alert("Success", "Bracket generated successfully.");
        } catch (err) {
            Alert.alert("Error", "Failed to generate bracket.");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return colors.success;
            case 'in progress': return colors.warning;
            case 'completed': return colors.info;
            default: return colors.textSecondary;
        }
    };

    const renderStatCard = (title, value, icon, color) => (
        <LinearGradient
            colors={[colors.surface, colors.surface]}
            style={[styles.statCard, SHADOWS.medium, { borderColor: color, borderBottomWidth: 4 }]}
        >
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
            </View>
        </LinearGradient>
    );

    const renderTournamentItem = ({ item }) => (
        <View style={[styles.card, SHADOWS.light, { backgroundColor: colors.surface }]}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.gameText, { color: colors.secondary }]}>{item.game}</Text>
                <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        <MaterialCommunityIcons name="calendar" size={14} /> {new Date(item.startTime).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        <MaterialCommunityIcons name="account-group" size={14} /> {item.maxPlayers} Max
                    </Text>
                </View>
            </View>

            <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => navigation.navigate("AddEditTournament", { tournament: { ...item, id: item.id || item._id } })}
                >
                    <MaterialCommunityIcons name="pencil" size={16} color={colors.text} />
                    <Text style={[styles.buttonText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => handleGenerateBracket(item.id || item._id)}
                >
                    <MaterialCommunityIcons name="tournament" size={16} color={colors.primary} />
                    <Text style={[styles.buttonText, { color: colors.primary }]}>Bracket</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => handleDeleteTournament(item.id || item._id)}
                >
                    <MaterialCommunityIcons name="delete" size={16} color={colors.error} />
                    <Text style={[styles.buttonText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderUserItem = ({ item }) => (
        <View style={[styles.userRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.userInitials}>{item.displayName?.substring(0, 2).toUpperCase() || "??"}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.displayName}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
            <TouchableOpacity style={[styles.miniBtn, { backgroundColor: colors.border }]}>
                <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={[colors.surface, colors.background]} style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
                    <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.error + '20' }]}>
                        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
                    {renderStatCard("Tournaments", tournaments.length, "trophy", colors.primary)}
                    {renderStatCard("Users", users.length, "account-group", colors.secondary)}
                    {renderStatCard("Active", tournaments.filter(t => t.status?.toLowerCase() === 'open' || t.status?.toLowerCase() === 'in progress').length, "play-circle", colors.success)}
                </ScrollView>
            </LinearGradient>

            {/* Tabs */}
            <View style={[styles.tabContainer, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tournaments' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('tournaments')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'tournaments' ? colors.primary : colors.textSecondary }]}>Tournaments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'users' ? colors.primary : colors.textSecondary }]}>Users</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <FlatList
                data={activeTab === 'tournaments' ? tournaments : users}
                keyExtractor={(item) => String(item.id || item._id)}
                renderItem={activeTab === 'tournaments' ? renderTournamentItem : renderUserItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {activeTab === 'tournaments' ? "No tournaments found." : "No users found."}
                        </Text>
                    </View>
                }
            />

            {/* FAB */}
            {activeTab === 'tournaments' && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }, SHADOWS.medium]}
                    onPress={() => navigation.navigate("AddEditTournament")}
                >
                    <MaterialCommunityIcons name="plus" size={32} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: { paddingTop: 50, paddingBottom: 10 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    logoutBtn: { padding: 8, borderRadius: 12 },

    statsContainer: { paddingHorizontal: 20, gap: 15, paddingBottom: 10 },
    statCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, width: 140, gap: 12, marginRight: 15 },
    statIcon: { padding: 10, borderRadius: 12 },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 12 },

    tabContainer: { flexDirection: 'row', paddingHorizontal: 20 },
    tab: { paddingVertical: 15, marginRight: 20 },
    tabText: { fontSize: 16, fontWeight: '600' },

    listContent: { padding: 20, paddingBottom: 100 },

    // Tournament Card
    card: { borderRadius: 20, padding: 20, marginBottom: 16 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    gameText: { fontSize: 14, fontWeight: "600", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    metaRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
    metaText: { fontSize: 13 },
    cardActions: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingTop: 15, borderTopWidth: 1 },
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    buttonText: { fontSize: 12, fontWeight: "600" },

    // User Row
    userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
    userAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    userInitials: { color: 'white', fontWeight: 'bold' },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '600' },
    userEmail: { fontSize: 12 },
    miniBtn: { padding: 8, borderRadius: 20 },

    fab: { position: "absolute", bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" },

    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16 }
});
