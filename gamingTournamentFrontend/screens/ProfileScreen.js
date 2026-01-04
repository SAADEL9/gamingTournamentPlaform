import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from "react-native";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ADMIN_EMAIL = "admin@admin.com";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const user = auth.currentUser;

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPhotoURL(user.photoURL || null);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace("Auth");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
        }
    };

    const saveProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await updateProfile(user, {
                displayName: displayName,
                photoURL: photoURL
            });
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>No user logged in.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={isEditing ? pickImage : null} disabled={!isEditing} style={styles.avatarContainer}>
                        {photoURL ? (
                            <Image source={{ uri: photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <MaterialCommunityIcons name="account" size={60} color="#FFF" />
                            </View>
                        )}
                        {isEditing && (
                            <View style={styles.editBadge}>
                                <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {isEditing ? (
                        <TextInput
                            style={styles.inputTitle}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Your Name"
                            placeholderTextColor="#A0AEC0"
                        />
                    ) : (
                        <Text style={styles.title}>{user.displayName || "User"}</Text>
                    )}

                    <Text style={styles.subtitle}>{user.email}</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Profile Information</Text>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Display Name</Text>
                        <Text style={styles.value}>{displayName || "Not set"}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user.email}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Member Since</Text>
                        <Text style={styles.value}>{new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}</Text>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        {isEditing ? (
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={() => {
                                        setIsEditing(false);
                                        setDisplayName(user.displayName || "");
                                        setPhotoURL(user.photoURL || null);
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.saveButton]}
                                    onPress={saveProfile}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {user.email === ADMIN_EMAIL && (
                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: '#2D3748', marginBottom: 15 }]}
                                        onPress={() => navigation.navigate('Admin')}
                                    >
                                        <Text style={styles.buttonText}>Admin Dashboard</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#E53E3E' }]} onPress={handleLogout}>
                                    <Text style={styles.buttonText}>Log Out</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E2E8F0',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4A90E2'
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2D3748',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F7FAFC'
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#2D3748",
        marginBottom: 4,
    },
    inputTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#2D3748",
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#4A90E2',
        textAlign: 'center',
        minWidth: 200
    },
    subtitle: {
        fontSize: 16,
        color: "#718096",
        textAlign: "center",
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3748'
    },
    editLink: {
        color: '#4A90E2',
        fontWeight: '600',
        fontSize: 16
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    label: {
        fontSize: 16,
        color: '#718096',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#2D3748',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#EDF2F7',
    },
    primaryButton: {
        backgroundColor: "#4A90E2",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#EDF2F7',
    },
    saveButton: {
        backgroundColor: '#4A90E2',
    },
    cancelButtonText: {
        color: '#4A5568',
        fontSize: 16,
        fontWeight: '700'
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700'
    }
});
