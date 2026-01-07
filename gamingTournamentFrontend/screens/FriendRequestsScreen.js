import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { SHADOWS } from '../constants/theme';

export default function FriendRequestsScreen() {
    const { colors } = useTheme();
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
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-circle" size={40} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={[styles.senderText, { color: colors.textSecondary }]}>Request from</Text>
                    <Text style={[styles.senderId, { color: colors.text }]}>{item.senderName || item.senderId}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.senderEmail}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.success }]} onPress={() => Alert.alert("Coming Soon", "Accept logic not implemented yet")}>
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rejectButton, { backgroundColor: colors.error }]} onPress={() => Alert.alert("Coming Soon", "Reject logic not implemented yet")}>
                    <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Friend Requests</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => String(item.id || Math.random())}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-off-outline" size={60} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No pending requests.</Text>
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
        // Removed bad padding and replaced with standard view styling
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        ...SHADOWS.light,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    senderText: {
        fontSize: 12,
    },
    senderId: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        marginBottom: 12
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10
    },
    acceptButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    rejectButton: {
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
        fontSize: 16,
    },
});
