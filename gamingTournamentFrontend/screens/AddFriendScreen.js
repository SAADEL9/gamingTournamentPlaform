
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
    StatusBar
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from "../api/api";
import { auth } from "../firebase";
import { COLORS, SHADOWS } from "../constants/theme";

export default function AddFriendScreen({ navigation }) {
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
        console.log("DEBUG: Sending Friend Request");
        console.log("Sender (user.uid):", user?.uid);
        console.log("Receiver (item.firebaseUid):", item?.firebaseUid);
        console.log("Receiver Object:", item);

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
            console.log("Success", "Friend request sent!");
        }

        catch (error) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || error.message || "Failed to send friend request to user");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (

        <View style={styles.userCard}>
            <Image
                source={{ uri: item.photoUrl || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.displayName || "Unknown User"}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddFriend(user, item)}
            >
                <Text onPress={() => handleAddFriend(user, item)} style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id || item.email}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        searchQuery && !loading ? <Text style={styles.emptyText}>No users found</Text> : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchButton: {
        backgroundColor: '#007bff',
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
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
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
        color: '#666',
    },
    addButton: {
        backgroundColor: '#28a745',
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
        color: '#666',
    }
});