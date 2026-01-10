import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { SHADOWS } from '../constants/theme';

export default function TeamRequestsScreen() {
    const { colors } = useTheme();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;
    const navigation = useNavigation();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        if (!user) return;
        try {
            const response = await api.get(`/team-request/list/${user.email}`);
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching team requests:", error);
            Alert.alert("Error", "Failed to load team invitations.");
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (id) => {
        try {
            await api.post(`/team-request/accept/${id}`);
            Alert.alert("Success", "You have joined the team!");
            fetchRequests();
        } catch (error) {
            console.error("Error accepting team request:", error);
            Alert.alert("Error", "Failed to accept invitation.");
        }
    };

    const rejectRequest = async (id) => {
        try {
            await api.post(`/team-request/reject/${id}`);
            Alert.alert("Success", "Invitation rejected.");
            fetchRequests();
        } catch (error) {
            console.error("Error rejecting team request:", error);
            Alert.alert("Error", "Failed to reject invitation.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="account-group" size={30} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.teamName, { color: colors.text }]}>{item.teamName}</Text>
                    <Text style={[styles.senderText, { color: colors.textSecondary }]}>Invited by {item.senderEmail}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => acceptRequest(item.id)}
                >
                    <Text style={styles.buttonText}>Join Team</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => rejectRequest(item.id)}
                >
                    <Text style={[styles.buttonText, { color: colors.error }]}>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Team Invitations</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="email-outline" size={60} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No pending team invitations.</Text>
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
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    senderText: {
        fontSize: 13,
    },
    divider: {
        height: 1,
        marginBottom: 16
    },
    actions: {
        flexDirection: 'row',
        gap: 12
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: 16
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
    },
});
