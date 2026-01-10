import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
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

export default function CreateTeamScreen({ navigation }) {
    const { colors } = useTheme();
    const [teamName, setTeamName] = useState("");
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        if (!user) return;
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

    const toggleFriendSelection = (email) => {
        if (selectedFriends.includes(email)) {
            setSelectedFriends(prev => prev.filter(e => e !== email));
        } else {
            setSelectedFriends(prev => [...prev, email]);
        }
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            Alert.alert("Error", "Please enter a team name.");
            return;
        }

        setSubmitting(true);
        try {
            // Create team with only the creator
            const response = await api.post("/team/create", {
                name: teamName,
                members: [user.email]
            });

            const newTeam = response.data;

            // Send invitations to selected friends
            if (selectedFriends.length > 0) {
                const invitePromises = selectedFriends.map(friendEmail =>
                    api.post("/team-request/create", {
                        teamId: newTeam.id,
                        senderEmail: user.email,
                        receiverEmail: friendEmail
                    })
                );
                await Promise.all(invitePromises);
                Alert.alert(
                    "Team Created!",
                    `Your team "${teamName}" is ready. Invitations have been sent to your friends.`,
                    [{ text: "Awesome", onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert(
                    "Team Created!",
                    `Your team "${teamName}" has been created successfully.`,
                    [{ text: "Done", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error("Error creating team:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to create team.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedFriends.includes(item.email);
        return (
            <TouchableOpacity
                style={[
                    styles.friendCard,
                    { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border }
                ]}
                onPress={() => toggleFriendSelection(item.email)}
            >
                <Image
                    source={{ uri: item.photoUrl || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{item.displayName || "Unknown User"}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
                </View>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                    size={24}
                    color={isSelected ? colors.primary : colors.textMuted}
                />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Create Team</Text>
                <TouchableOpacity onPress={handleCreateTeam} disabled={submitting}>
                    {submitting ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={[styles.createActionText, { color: colors.primary }]}>Create</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Team Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter team name"
                    placeholderTextColor={colors.textMuted}
                    value={teamName}
                    onChangeText={setTeamName}
                />

                <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Invite Friends ({selectedFriends.length} selected)</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.firebaseUid || item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No friends found to add.</Text>
                            </View>
                        }
                    />
                )}
            </View>
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
    createActionText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
    listContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        ...SHADOWS.light,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 14,
    },
});
