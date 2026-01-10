import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from "../api/api";
import { auth } from "../firebase";
import { useTheme } from "../context/ThemeContext";
import { SHADOWS } from "../constants/theme";

export default function FriendsScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get(`/friendship/list/${user.uid}`);
            setFriends(response.data);
        } catch (error) {
            console.error("Error fetching friends:", error);
            Alert.alert("Error", "Failed to load friend list.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        Alert.alert(
            "Remove Friend",
            "Are you sure you want to remove this friend?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/friendship/remove/${user.uid}/${friendId}`);
                            setFriends(prev => prev.filter(f => f.firebaseUid !== friendId));
                            Alert.alert("Success", "Friend removed successfully.");
                        } catch (error) {
                            console.error("Error removing friend:", error);
                            Alert.alert("Error", "Failed to remove friend.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={[styles.friendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image
                source={{ uri: item.photoUrl || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.displayName || "Unknown User"}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.error + '20' }]}
                onPress={() => handleRemoveFriend(item.firebaseUid)}
            >
                <MaterialCommunityIcons name="account-remove" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Friends</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("AddFriendScreen")}
                >
                    <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Find Players</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }]}
                    onPress={() => navigation.navigate("FriendRequestsScreen")}
                >
                    <MaterialCommunityIcons name="bell-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => navigation.navigate("CreateTeam")}
                >
                    <MaterialCommunityIcons name="account-group" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Create Team</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.firebaseUid || item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-group-outline" size={60} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You haven't added any friends yet.</Text>
                            <TouchableOpacity
                                style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate("AddFriendScreen")}
                            >
                                <Text style={styles.emptyAddButtonText}>Find Players</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    quickActions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        ...SHADOWS.light,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
    },
    removeButton: {
        padding: 8,
        borderRadius: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyAddButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    emptyAddButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});