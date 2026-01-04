import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, FlatList } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from "../firebase";
import api from "../api/api";
import { useNavigation } from "@react-navigation/native";

export default function TournamentDetailScreen({ route }) {
    const { tournament } = route.params;
    const navigation = useNavigation();
    const user = auth.currentUser;
    const [joining, setJoining] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);

    // Team inputs
    const [teamName, setTeamName] = useState("");
    const [teammateEmail, setTeammateEmail] = useState("");
    const [teammates, setTeammates] = useState([]);

    // Saved Teammates
    const [savedTeammates, setSavedTeammates] = useState([]);
    const [loadingTeammates, setLoadingTeammates] = useState(false);

    const teamSize = tournament.teamSize || 1;
    const isTeamMode = teamSize > 1;

    // Check if user is already a participant
    const isJoined = isTeamMode
        ? tournament.teams?.some(t => t.members?.includes(user?.email))
        : tournament.participants?.includes(user?.email);

    useEffect(() => {
        if (showTeamModal && user) {
            fetchSavedTeammates();
        }
    }, [showTeamModal]);

    const fetchSavedTeammates = async () => {
        setLoadingTeammates(true);
        try {
            const res = await api.get(`/user/${user.email}`);
            if (res.data && res.data.teammates) {
                setSavedTeammates(res.data.teammates);
            }
        } catch (e) {
            console.log("Error fetching teammates", e);
        } finally {
            setLoadingTeammates(false);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            Alert.alert("Login Required", "You must be logged in to join tournaments.");
            return;
        }

        if (isTeamMode) {
            setShowTeamModal(true);
            return;
        }

        submitJoin(null, null);
    };

    const submitJoin = async (tName, tMates) => {
        setJoining(true);
        try {
            await api.post(`/tournament/${tournament.id || tournament._id}/join`, {
                email: user.email,
                teamName: tName,
                teammates: tMates
            });
            Alert.alert("Success", "You have joined the tournament!");
            setShowTeamModal(false);
            navigation.goBack();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data || "Failed to join tournament";
            Alert.alert("Error", typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setJoining(false);
        }
    };

    const handleAddTeammate = (emailToAdd) => {
        const email = emailToAdd || teammateEmail;
        if (!email.includes('@')) {
            Alert.alert("Invalid Email", "Please enter a valid email");
            return;
        }
        if (teammates.includes(email)) {
            Alert.alert("Duplicate", "This teammate is already added.");
            return;
        }
        if (teammates.length >= teamSize - 1) { // -1 because current user is also part of team
            Alert.alert("Team Full", `Max team size is ${teamSize}`);
            return;
        }
        setTeammates([...teammates, email]);
        setTeammateEmail("");
    };

    const submitTeamJoin = () => {
        if (!teamName) {
            Alert.alert("Required", "Please enter a team name");
            return;
        }
        if (teammates.length + 1 !== teamSize) {
            Alert.alert("Incomplete Team", `You need exactly ${teamSize} members (including yourself).`);
            return;
        }
        submitJoin(teamName, teammates);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return '#48BB78';
            case 'in progress': return '#ED8936';
            case 'closed': return '#E53E3E';
            default: return '#A0AEC0';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3748" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tournament Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.banner}>
                    <MaterialCommunityIcons name="trophy-award" size={80} color="#ECC94B" />
                </View>

                <View style={styles.titleSection}>
                    <Text style={styles.gameTitle}>{tournament.game}</Text>
                    <Text style={styles.name}>{tournament.name}</Text>

                    <View style={styles.badgesRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(tournament.status) }]}>{tournament.status}</Text>
                        </View>
                        {isTeamMode && (
                            <View style={[styles.statusBadge, { backgroundColor: '#4299E120', marginLeft: 8 }]}>
                                <Text style={[styles.statusText, { color: '#4299E1' }]}>{teamSize}v{teamSize}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="account-group" size={24} color="#4A90E2" />
                            <View>
                                <Text style={styles.detailLabel}>
                                    {isTeamMode ? "Teams" : "Players"}
                                </Text>
                                <Text style={styles.detailValue}>
                                    {isTeamMode ? (tournament.teams?.length || 0) : (tournament.participants?.length || 0)} / {tournament.maxPlayers}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.dividerVertical} />
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="cash" size={24} color="#48BB78" />
                            <View>
                                <Text style={styles.detailLabel}>Prize Pool</Text>
                                <Text style={styles.detailValue}>{tournament.prize}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Join Button */}
                <View style={styles.footer}>
                    {isJoined ? (
                        <View style={styles.joinedBadge}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#48BB78" />
                            <Text style={styles.joinedText}>You have joined this tournament</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.joinButton,
                                (tournament.status?.toLowerCase() !== 'open' || joining) && styles.disabledButton
                            ]}
                            onPress={handleJoin}
                            disabled={tournament.status?.toLowerCase() !== 'open' || joining}
                        >
                            {joining ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.joinButtonText}>
                                        {tournament.status?.toLowerCase() === 'open' ? (isTeamMode ? 'Register Team' : 'Join Tournament') : 'Registration Closed'}
                                    </Text>
                                    {tournament.status?.toLowerCase() === 'open' && (
                                        <MaterialCommunityIcons name="login" size={20} color="#FFF" />
                                    )}
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Team Registration Modal */}
            <Modal
                visible={showTeamModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Register Team ({teamSize}v{teamSize})</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Team Name"
                            value={teamName}
                            onChangeText={setTeamName}
                        />

                        <Text style={styles.modalSubTitle}>Add Teammates ({teammates.length + 1}/{teamSize})</Text>

                        {/* Saved Teammates List */}
                        {savedTeammates.length > 0 && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 12, color: '#718096', marginBottom: 5 }}>From your saved teammates:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                    {savedTeammates.map(mate => (
                                        <TouchableOpacity
                                            key={mate}
                                            style={[styles.savedMateChip, teammates.includes(mate) && styles.savedMateChipSelected]}
                                            onPress={() => !teammates.includes(mate) && handleAddTeammate(mate)}
                                        >
                                            <MaterialCommunityIcons name="account-plus" size={16} color={teammates.includes(mate) ? "white" : "#4A90E2"} />
                                            <Text style={[styles.savedMateText, teammates.includes(mate) && { color: 'white' }]}>{mate}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.inviteRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Or enter email manually..."
                                value={teammateEmail}
                                onChangeText={setTeammateEmail}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => handleAddTeammate(null)} style={styles.addButton}>
                                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 100, marginVertical: 10 }}>
                            {teammates.map((mate, idx) => (
                                <View key={idx} style={styles.mateRow}>
                                    <Text>{mate}</Text>
                                    <TouchableOpacity onPress={() => setTeammates(teammates.filter((_, i) => i !== idx))}>
                                        <MaterialCommunityIcons name="close" size={20} color="#E53E3E" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTeamModal(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={submitTeamJoin}>
                                <Text style={styles.confirmText}>Join</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
    content: { padding: 20 },
    banner: { height: 180, backgroundColor: '#2D3748', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
    titleSection: { alignItems: 'center', marginBottom: 30 },
    gameTitle: { fontSize: 16, color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    name: { fontSize: 28, fontWeight: '800', color: '#2D3748', textAlign: 'center', marginBottom: 12 },
    badgesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontWeight: '700', textTransform: 'uppercase', fontSize: 12 },
    card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 30 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    dividerVertical: { width: 1, height: '100%', backgroundColor: '#E2E8F0', marginHorizontal: 15 },
    detailLabel: { fontSize: 12, color: '#718096', fontWeight: '500' },
    detailValue: { fontSize: 16, color: '#2D3748', fontWeight: '700' },
    footer: { marginTop: 'auto' },
    joinButton: { backgroundColor: '#4A90E2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, gap: 8, shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    disabledButton: { backgroundColor: '#CBD5E0', shadowOpacity: 0, elevation: 0 },
    joinButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
    joinedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, backgroundColor: '#F0FFF4', borderRadius: 16, borderWidth: 1, borderColor: '#C6F6D5' },
    joinedText: { color: '#2F855A', fontWeight: '700', fontSize: 16 },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%' },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#2D3748' },
    input: { backgroundColor: '#EDF2F7', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16 },
    modalSubTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#718096' },
    inviteRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    addButton: { backgroundColor: '#4A90E2', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    mateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#F7FAFC', marginBottom: 8, borderRadius: 8 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelButton: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#E2E8F0', alignItems: 'center' },
    confirmButton: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
    cancelText: { fontWeight: '700', color: '#4A5568' },
    confirmText: { fontWeight: '700', color: 'white' },
    savedMateChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, backgroundColor: '#EBF8FF', borderWidth: 1, borderColor: '#BEE3F8' },
    savedMateChipSelected: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
    savedMateText: { color: '#2B6CB0', fontSize: 12, fontWeight: '600' }
});
