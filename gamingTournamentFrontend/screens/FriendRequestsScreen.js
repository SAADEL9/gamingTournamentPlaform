import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../api/api';
import { auth } from '../firebase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function FriendRequestsScreen() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;
    const navigation = useNavigation();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get(`/friend-request/list/${user.uid}`);
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
            Alert.alert("Error", "Failed to load friend requests.");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-circle" size={40} color={COLORS.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.senderText}>Request from</Text>
                    <Text style={styles.senderId}>{item.senderId}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actions}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => Alert.alert("Coming Soon", "Accept logic not implemented yet")}>
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => Alert.alert("Coming Soon", "Reject logic not implemented yet")}>
                    <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Friend Requests</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => String(item.id || Math.random())}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-off-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No pending requests.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: COLORS.surface,
        ...SHADOWS.medium,
        zIndex: 10
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: COLORS.card
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    senderText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    senderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.card,
        marginBottom: 12
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10
    },
    acceptButton: {
        backgroundColor: COLORS.success,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    rejectButton: {
        backgroundColor: COLORS.error,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        gap: 10
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 16,
    },
});
