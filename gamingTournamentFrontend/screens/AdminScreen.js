import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import api from "../api/api";
import { IconSymbol } from '../components/IconSymbol';

export default function AdminScreen({ navigation }) {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // AppNavigator will automatically handle the switch to Auth screen
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#E53E3E" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/tournament");
            setTournaments(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch tournaments");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTournaments();
        }, [])
    );

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Tournament",
            "This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/tournament/delete/${id}`);
                            setTournaments((prev) => prev.filter((t) => (t.id || t._id) !== id));
                            Alert.alert("Deleted", "The tournament has been removed.");
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "Failed to delete tournament");
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tournaments}
                keyExtractor={(item) => String(item.id || item._id)}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const id = item.id || item._id;
                    const idStr = typeof id === 'object' ? id.toString() : String(id);

                    // Helper for status color
                    const getStatusColor = (status) => {
                        switch (status?.toLowerCase()) {
                            case 'open': return '#48BB78'; // Green
                            case 'in progress': return '#ED8936'; // Orange
                            case 'completed': return '#A0AEC0'; // Gray
                            default: return '#4A90E2'; // Blue
                        }
                    };

                    return (
                        <View style={styles.card}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                <Text style={styles.statusText}>{item.status}</Text>
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.gameText}>{item.game}</Text>
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaText}>📅 {new Date(item.startTime).toLocaleDateString()}</Text>
                                    <Text style={styles.metaText}>👥 {item.maxPlayers} Max</Text>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => navigation.navigate("AddEditTournament", { tournament: { ...item, id: idStr } })}
                                >
                                    <Text style={[styles.buttonText, styles.editButtonText]}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDelete(idStr)}
                                >
                                    <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tournaments yet.</Text>
                        <Text style={styles.emptySubText}>Tap + to create one.</Text>
                    </View>
                }
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("AddEditTournament")}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F7FAFC" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    listContent: { padding: 20, paddingBottom: 100 },
    logoutButton: { marginRight: 10 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#2D3748",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        borderWidth: 1,
        borderColor: "#EDF2F7",
        position: 'relative',
        overflow: 'hidden'
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardContent: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#2D3748",
        marginBottom: 4,
        paddingRight: 80, // Space for badge
    },
    gameText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4A90E2",
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16,
    },
    metaText: {
        fontSize: 13,
        color: "#718096",
    },
    cardActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#EDF2F7",
        paddingTop: 12,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    editButton: { backgroundColor: "#EDF2F7" },
    deleteButton: { backgroundColor: "#FFF5F5" },
    buttonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    editButtonText: { color: "#4A5568" },
    deleteButtonText: { color: "#E53E3E" },

    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#4A90E2",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4A90E2",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    fabText: { fontSize: 32, color: "#fff", lineHeight: 34 },

    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, color: "#718096", fontWeight: '600' },
    emptySubText: { fontSize: 14, color: "#A0AEC0", marginTop: 4 },
});
