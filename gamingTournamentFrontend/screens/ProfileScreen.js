import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { IconSymbol } from '../components/IconSymbol';
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // After sign out, we can navigate to Auth
            navigation.replace("Auth");
        } catch (error) {
            console.error("Error signing out: ", error);
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
                    <View style={styles.logoContainer}>
                        <IconSymbol size={60} name="person.fill" color="#fff" />
                    </View>
                    <Text style={styles.title}>Welcome!</Text>
                    <Text style={styles.subtitle}>{user.displayName || user.email}</Text>
                </View>

                <View style={styles.card}>
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
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#E53E3E' }]} onPress={handleLogout}>
                            <Text style={styles.buttonText}>Log Out</Text>
                        </TouchableOpacity>
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
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#4A90E2',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#2D3748",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#718096",
        textAlign: "center",
        maxWidth: '80%',
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
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
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    primaryButton: {
        backgroundColor: "#4A90E2",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
});
