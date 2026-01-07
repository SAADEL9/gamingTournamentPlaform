import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import api from "../api/api";
import { useTheme } from "../context/ThemeContext";

const ADMIN_EMAIL = "admin@admin.com";

export default function ProfileScreen() {
    const { colors, theme } = useTheme();
    const navigation = useNavigation();
    const user = auth.currentUser;

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPhotoURL(user.photoURL || null);

            // Auto-sync user to backend to ensure they exist in DB
            api.post('/user/sync', {
                email: user.email,
                displayName: user.displayName || "",
                photoUrl: user.photoURL || null,
                firebaseUid: user.uid
            }).catch(err => console.error("Auto-sync failed:", err));
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // AppNavigator will automatically handle the switch to Auth screen
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const uploadImageAsync = async (base64Image) => {
        try {
            const fileRef = ref(storage, `profile_images/${user.uid}/${Date.now()}`);
            // uploadString requires format 'base64' if the string is raw base64
            // or 'data_url' if it includes "data:image/..." prefix.
            // ImagePicker base64 is usually raw.
            await uploadString(fileRef, base64Image, 'base64');

            const downloadUrl = await getDownloadURL(fileRef);
            return downloadUrl;
        } catch (error) {
            console.error("Error uploading image: ", error);
            throw error;
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
            base64: true,
        });

        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
            setImageBase64(result.assets[0].base64);
        }
    };

    const saveProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            let url = photoURL;
            if (imageBase64) {
                url = await uploadImageAsync(imageBase64);
            }

            await updateProfile(user, {
                displayName: displayName,
                photoURL: url
            });

            // Sync with backend if needed, or just update local auth state is handled by firebase
            // Ideally we should also call the backend /sync endpoint if we want the backend to know about the new photo URL immediately
            await api.post('/user/sync', {
                email: user.email,
                displayName: displayName,
                photoUrl: url,
                firebaseUid: user.uid
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
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>No user logged in.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Main Header */}
            <View style={[styles.navHeader, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: colors.text }]}>Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={isEditing ? pickImage : null} disabled={!isEditing} style={styles.avatarContainer}>
                        {photoURL ? (
                            <Image
                                source={{ uri: photoURL }}
                                style={[styles.avatar, { backgroundColor: colors.surface }]}
                                onError={() => setPhotoURL(null)} // Fallback to placeholder on error
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <MaterialCommunityIcons name="account" size={60} color="#FFF" />
                            </View>
                        )}
                        {isEditing && (
                            <View style={[styles.editBadge, { backgroundColor: colors.text, borderColor: colors.background }]}>
                                <MaterialCommunityIcons name="camera" size={20} color={colors.background} />
                            </View>
                        )}
                    </TouchableOpacity>

                    {isEditing ? (
                        <TextInput
                            style={[styles.inputTitle, { color: colors.text, borderBottomColor: colors.primary }]}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Your Name"
                            placeholderTextColor={colors.textSecondary}
                        />
                    ) : (
                        <Text style={[styles.title, { color: colors.text }]}>{user.displayName || "User"}</Text>
                    )}

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{user.email}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{displayName || "Not set"}</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Member Since</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}</Text>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        {isEditing ? (
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton, { backgroundColor: colors.border }]}
                                    onPress={() => {
                                        setIsEditing(false);
                                        setDisplayName(user.displayName || "");
                                        setPhotoURL(user.photoURL || null);
                                    }}
                                >
                                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.primary }]}
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
                                        style={[styles.primaryButton, { backgroundColor: colors.text, marginBottom: 15 }]}
                                        onPress={() => navigation.navigate('Admin')}
                                    >
                                        <Text style={styles.buttonText}>Admin Dashboard</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: colors.primary, marginBottom: 15 }]}
                                    onPress={() => navigation.navigate('myTournaments')}
                                >
                                    <Text style={styles.buttonText}>My Tournaments</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: colors.success, marginBottom: 15 }]}
                                    onPress={() => navigation.navigate('FriendRequests')}
                                >
                                    <Text style={styles.buttonText}>Friend Requests</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
                                    <Text style={styles.buttonText}>Log Out</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    navTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        marginBottom: 4,
    },
    inputTitle: {
        fontSize: 26,
        fontWeight: "800",
        marginBottom: 4,
        borderBottomWidth: 1,
        textAlign: 'center',
        minWidth: 200
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
    },
    card: {
        borderRadius: 24,
        padding: 24,
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
    },
    editLink: {
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
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
    },
    primaryButton: {
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
        alignItems: "center",
    },
    cancelButton: {
        // backgroundColor handled dynamically
    },
    saveButton: {
        // backgroundColor handled dynamically
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700'
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700'
    }
});
