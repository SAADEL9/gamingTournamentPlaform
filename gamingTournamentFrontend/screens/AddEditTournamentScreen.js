import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import api from "../api/api";

export default function AddEditTournamentScreen({ navigation, route }) {
    const tournamentToEdit = route.params?.tournament;
    const isEditing = !!tournamentToEdit;

    const [name, setName] = useState("");
    const [game, setGame] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("");
    const [entryFee, setEntryFee] = useState("");
    const [prize, setPrize] = useState("");
    const [status, setStatus] = useState("Open");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setName(tournamentToEdit.name);
            setGame(tournamentToEdit.game);
            setMaxPlayers(String(tournamentToEdit.maxPlayers));
            setEntryFee(String(tournamentToEdit.entryFee));
            setPrize(tournamentToEdit.prize);
            setStatus(tournamentToEdit.status);
        }
    }, [isEditing, tournamentToEdit]);

    const handleSubmit = async () => {
        if (!name || !game || !maxPlayers) {
            Alert.alert("Error", "Please fill in all required fields (Name, Game, Max Players)");
            return;
        }

        const payload = {
            name,
            game,
            maxPlayers: parseInt(maxPlayers),
            entryFee: parseInt(entryFee) || 0,
            prize,
            status,
            startTime: new Date().toISOString(), // Default to now for simplicity, can add date picker later
        };

        try {
            setLoading(true);

            if (isEditing) {
                const id = tournamentToEdit.id || tournamentToEdit._id;
                const idStr = typeof id === 'object' ? id.toString() : String(id);
                // Clean the ID string to prevent encoding issues
                const cleanId = idStr.replace(/['"]+/g, '');

                await api.put(`/tournament/update/${cleanId}`, payload);
                Alert.alert("Success", "Tournament updated successfully", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                await api.post("/tournament/create", payload);
                Alert.alert("Success", "Tournament created successfully", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to save tournament");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>{isEditing ? "Edit Tournament" : "New Tournament"}</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Tournament Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Summer Championship" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Game *</Text>
                <TextInput style={styles.input} value={game} onChangeText={setGame} placeholder="e.g. Valorant, FIFA" />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Max Players *</Text>
                    <TextInput
                        style={styles.input}
                        value={maxPlayers}
                        onChangeText={setMaxPlayers}
                        placeholder="e.g. 16"
                        keyboardType="numeric"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Entry Fee</Text>
                    <TextInput
                        style={styles.input}
                        value={entryFee}
                        onChangeText={setEntryFee}
                        placeholder="e.g. 50"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Prize Pool</Text>
                <TextInput style={styles.input} value={prize} onChangeText={setPrize} placeholder="e.g. $1000" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusContainer}>
                    {['Open', 'In Progress', 'Completed'].map((s) => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.statusOption, status === s && styles.statusActive]}
                            onPress={() => setStatus(s)}
                        >
                            <Text style={[styles.statusText, status === s && styles.statusTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>{loading ? "Saving..." : isEditing ? "Update Tournament" : "Create Tournament"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#FAFAFA",
    },
    row: { flexDirection: "row" },
    statusContainer: { flexDirection: "row", gap: 10 },
    statusOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
    },
    statusActive: {
        backgroundColor: "#4A90E2",
        borderColor: "#4A90E2",
    },
    statusText: { color: "#666", fontWeight: "500" },
    statusTextActive: { color: "#fff" },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#4A90E2",
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#4A90E2",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buttonDisabled: { opacity: 0.7 },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
