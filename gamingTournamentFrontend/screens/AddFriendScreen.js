
import React, { useState } from "react";
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

export default function AddFriendScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(false);
    const user = auth.currentUser;
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await api.get(`/user/search?query=${searchQuery}`);
            const filteredResults = response.data.filter(u => u.firebaseUid !== auth.currentUser?.uid);
            setResults(filteredResults);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || error.message || "Failed to search users");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (user, item) => {
        if (!user?.uid || !item?.firebaseUid) {
            Alert.alert("Error", "Missing User ID. Sender: " + user?.uid + ", Receiver: " + item?.firebaseUid);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/friend-request/create", {
                senderid: user.uid,
                receiverid: item.firebaseUid
            });
            Alert.alert("Success", "Friend request sent!");
        }

        catch (error) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || error.message || "Failed to send friend request to user");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.userCard, { backgroundColor: colors.card, shadowColor: theme === 'dark' ? '#000' : '#ccc' }]}>
            <Image
                source={{ uri: item.photoUrl || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.displayName || "Unknown User"}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.success }]}
                onPress={() => handleAddFriend(user, item)}
            >
                <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Find Players</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Search by name or email"
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id || item.email}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        searchQuery && !loading ? <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text> : null
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
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
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
    },
    searchButton: {
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    addButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    }
});