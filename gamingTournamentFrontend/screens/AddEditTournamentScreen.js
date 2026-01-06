import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Switch } from "react-native";
import api from "../api/api";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

    // Team Settings
    const [isTeamMode, setIsTeamMode] = useState(false);
    const [teamSize, setTeamSize] = useState("2"); // Default to 2 for teams
    const handleGenerateBracket = async (id) => {
        try {
            await api.post(`/tournament/generate-bracket/${id}`);
            window.alert("Generated\n\nThe bracket has been generated.");
        } catch (err) {
            console.error(err);
            window.alert("Error\n\nFailed to generate bracket");
        }
    }
    useEffect(() => {
        if (isEditing) {
            setName(tournamentToEdit.name);
            setGame(tournamentToEdit.game);
            setMaxPlayers(String(tournamentToEdit.maxPlayers));
            setEntryFee(String(tournamentToEdit.entryFee));
            setPrize(tournamentToEdit.prize);
            setStatus(tournamentToEdit.status);

            const size = tournamentToEdit.teamSize || 1;
            setIsTeamMode(size > 1);
            setTeamSize(String(size > 1 ? size : 2));
        }
    }, [isEditing, tournamentToEdit]);

    const handleSubmit = async () => {
        if (!name || !game || !maxPlayers) {
            Alert.alert("Error", "Please fill in all required fields (Name, Game, Max Players)");
            return;
        }

        const tSize = isTeamMode ? parseInt(teamSize) : 1;

        const payload = {
            name,
            game,
            maxPlayers: parseInt(maxPlayers),
            entryFee: parseInt(entryFee) || 0,
            prize,
            status,
            startTime: new Date().toISOString(),
            teamSize: tSize
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

            {/* Team Mode Switch */}
            <View style={styles.card}>
                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.cardTitle}>Team Tournament?</Text>
                        <Text style={styles.cardSubtitle}>{isTeamMode ? "Yes, players join as teams" : "No, individual (1v1)"}</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#767577", true: "#4A90E2" }}
                        thumbColor={isTeamMode ? "#fff" : "#f4f3f4"}
                        onValueChange={setIsTeamMode}
                        value={isTeamMode}
                    />
                </View>

                {isTeamMode && (
                    <View style={{ marginTop: 15 }}>
                        <Text style={styles.label}>Team Size (Players per team)</Text>
                        <View style={styles.teamSizeRow}>
                            {['2', '3', '4', '5'].map(size => (
                                <TouchableOpacity
                                    key={size}
                                    style={[styles.sizeOption, teamSize === size && styles.sizeOptionActive]}
                                    onPress={() => setTeamSize(size)}
                                >
                                    <Text style={[styles.sizeText, teamSize === size && styles.sizeTextActive]}>{size}v{size}</Text>
                                </TouchableOpacity>
                            ))}
                            <TextInput
                                style={[styles.input, { width: 60, textAlign: 'center', marginBottom: 0 }]}
                                value={teamSize}
                                onChangeText={setTeamSize}
                                keyboardType="numeric"
                                placeholder="Custom"
                            />
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Max {isTeamMode ? "Teams" : "Players"} *</Text>
                    <TextInput
                        style={styles.input}
                        value={maxPlayers}
                        onChangeText={setMaxPlayers}
                        placeholder={isTeamMode ? "e.g. 8 Teams" : "e.g. 16 Players"}
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
                    {['Open', 'In Progress', 'Completed', 'Closed'].map((s) => (
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
            <TouchableOpacity

                onPress={() => handleGenerateBracket(item.id)}
            >
                <Text >generate bracket</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F7FAFC" },
    content: { padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#2D3748" },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: "600", color: "#4A5568", marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: "white",
        color: "#2D3748"
    },
    row: { flexDirection: "row" },
    statusContainer: { flexDirection: "row", flexWrap: 'wrap', gap: 10 },
    statusOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "white",
    },
    statusActive: {
        backgroundColor: "#4A90E2",
        borderColor: "#4A90E2",
    },
    statusText: { color: "#718096", fontWeight: "600" },
    statusTextActive: { color: "white" },
    submitButton: {
        padding: 18,
        borderRadius: 16,
        backgroundColor: "#4A90E2",
        alignItems: "center",
        marginTop: 30,
        marginBottom: 40,
        shadowColor: "#4A90E2",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    buttonDisabled: { opacity: 0.7 },
    submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

    // Card for switch
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 4
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#718096'
    },

    // Team Size
    teamSizeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8
    },
    sizeOption: {
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EDF2F7'
    },
    sizeOptionActive: {
        backgroundColor: '#4A90E2'
    },
    sizeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A5568'
    },
    sizeTextActive: {
        color: 'white'
    }
});
