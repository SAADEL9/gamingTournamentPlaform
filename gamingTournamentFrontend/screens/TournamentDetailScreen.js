import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, FlatList, ImageBackground, StatusBar } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from "../firebase";
import api from "../api/api";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SIZES, SHADOWS } from "../constants/theme";
import { set } from "zod";

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
    const [matches, setMatches] = useState([]);
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
    const showMatches = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/matches/tournament/${id}`);
            setMatches(res.data);
            setLoading(false);
        } catch (e) {
            console.log("Error fetching matches", e);
        }
    }
    const [loading, setLoading] = useState(false);

    // Group matches by round
    const groupedMatches = matches.reduce((acc, match) => {
        const round = match.round || 1;
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {});


    const renderMatchItem = ({ item }) => {
        const p1Score = item.score1 !== undefined ? item.score1 : '-';
        const p2Score = item.score2 !== undefined ? item.score2 : '-';
        const isCompleted = item.status === 'COMPLETED';
        const winner = item.winnerId;

        return (
            <LinearGradient
                colors={COLORS.gradientCard}
                style={styles.matchCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.matchHeader}>
                    <Text style={styles.matchIdText}>Match #{item.id?.substring(item.id.length - 4)}</Text>
                    <View style={[styles.matchStatusBadge, { backgroundColor: getStatusColor(item.status) + '30' }]}>
                        <Text style={[styles.matchStatusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.matchPlayersRow}>
                    {/* Player 1 */}
                    <View style={[styles.playerSide, winner === item.player1Id && styles.winnerSide]}>
                        <Text style={[styles.playerName, winner === item.player1Id && styles.winnerText]} numberOfLines={1}>
                            {item.player1Id || "Waiting..."}
                        </Text>
                        <Text style={[styles.playerScore, winner === item.player1Id && styles.winnerScore]}>{p1Score}</Text>
                        {winner === item.player1Id && <MaterialCommunityIcons name="crown" size={16} color={COLORS.warning} />}
                    </View>

                    <Text style={styles.vsText}>VS</Text>

                    {/* Player 2 */}
                    <View style={[styles.playerSide, winner === item.player2Id && styles.winnerSide]}>
                        <Text style={[styles.playerScore, winner === item.player2Id && styles.winnerScore]}>{p2Score}</Text>
                        <Text style={[styles.playerName, winner === item.player2Id && styles.winnerText]} numberOfLines={1}>
                            {item.player2Id || "Waiting..."}
                        </Text>
                        {winner === item.player2Id && <MaterialCommunityIcons name="crown" size={16} color={COLORS.warning} />}
                    </View>
                </View>
            </LinearGradient>
        );
    };
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
            case 'open': return COLORS.success;
            case 'in progress': return COLORS.warning;
            case 'closed': return COLORS.error;
            case 'completed': return COLORS.info;
            default: return COLORS.textSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={[COLORS.surface, COLORS.background]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tournament Arena</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                    style={styles.banner}
                    imageStyle={{ borderRadius: 24, opacity: 0.4 }}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.bannerGradient}
                    >
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
                            <Text style={styles.statusText}>{tournament.status}</Text>
                        </View>
                        <Text style={styles.gameTitle}>{tournament.game}</Text>
                        <Text style={styles.name}>{tournament.name}</Text>
                    </LinearGradient>
                </ImageBackground>

                {/* Details Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="account-group" size={24} color={COLORS.secondary} />
                        <Text style={styles.statValue}>
                            {isTeamMode ? (tournament.teams?.length || 0) : (tournament.participants?.length || 0)} <Text style={styles.statMax}>/ {tournament.maxPlayers}</Text>
                        </Text>
                        <Text style={styles.statLabel}>{isTeamMode ? "Teams" : "Players"}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="trophy" size={24} color={COLORS.warning} />
                        <Text style={styles.statValue}>{tournament.prize}</Text>
                        <Text style={styles.statLabel}>Prize Pool</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="format-list-numbered" size={24} color={COLORS.primaryLight} />
                        <Text style={styles.statValue}>{teamSize}v{teamSize}</Text>
                        <Text style={styles.statLabel}>Format</Text>
                    </View>
                </View>

                {/* Bracket / Matches Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Matches & Bracket</Text>
                    <TouchableOpacity onPress={() => showMatches(tournament.id || tournament._id)}>
                        <Text style={styles.refreshText}><MaterialCommunityIcons name="refresh" /> Refresh</Text>
                    </TouchableOpacity>
                </View>

                {matches.length > 0 ? (
                    Object.keys(groupedMatches).map(round => (
                        <View key={round} style={styles.roundContainer}>
                            <Text style={styles.roundTitle}>Round {round}</Text>
                            {groupedMatches[round].map(match => (
                                <View key={match._id || match.id}>
                                    {renderMatchItem({ item: match })}
                                </View>
                            ))}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No matches generated yet.</Text>
                        <TouchableOpacity onPress={() => showMatches(tournament.id || tournament._id)} style={styles.smallButton}>
                            <Text style={styles.smallButtonText}>Load Matches</Text>
                        </TouchableOpacity>
                    </View>
                )}


                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Footer for Actions */}
            <View style={styles.footer}>
                {isJoined ? (
                    <View style={styles.joinedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={24} color={COLORS.success} />
                        <Text style={styles.joinedText}>Registered for Tournament</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.8}
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
                            <LinearGradient
                                colors={tournament.status?.toLowerCase() === 'open' ? COLORS.gradientPrimary : [COLORS.textMuted, COLORS.textMuted]}
                                style={styles.joinButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.joinButtonText}>
                                    {tournament.status?.toLowerCase() === 'open' ? (isTeamMode ? 'Register Team' : 'Join Tournament') : 'Registration Closed'}
                                </Text>
                                {tournament.status?.toLowerCase() === 'open' && (
                                    <MaterialCommunityIcons name="login" size={20} color="#FFF" />
                                )}
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                )}
            </View>


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
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    content: { paddingBottom: 100 },

    banner: { height: 220, marginHorizontal: 20, borderRadius: 24, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 20, ...SHADOWS.medium },
    bannerGradient: { padding: 20, width: '100%' },
    gameTitle: { color: COLORS.secondary, fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },
    name: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginTop: 5 },

    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
    statusText: { color: COLORS.text, fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

    statsContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 20, padding: 20, borderRadius: COLORS.radius, ...SHADOWS.light, justifyContent: 'space-between', marginBottom: 30 },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 5 },
    statMax: { fontSize: 12, color: COLORS.textSecondary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    dividerVertical: { width: 1, backgroundColor: COLORS.card, marginHorizontal: 10 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    refreshText: { color: COLORS.secondary, fontWeight: '600' },

    roundContainer: { marginBottom: 25, paddingHorizontal: 20 },
    roundTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },

    matchCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.card },
    matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    matchIdText: { color: COLORS.textMuted, fontSize: 10 },
    matchStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    matchStatusText: { fontSize: 10, fontWeight: 'bold' },

    matchPlayersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    playerSide: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 4 },
    winnerSide: { opacity: 1 },
    playerName: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
    winnerText: { color: COLORS.success, fontWeight: 'bold' },
    playerScore: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
    winnerScore: { color: COLORS.success },
    vsText: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold', marginHorizontal: 10 },

    emptyState: { alignItems: 'center', marginTop: 30 },
    emptyStateText: { color: COLORS.textMuted, marginBottom: 15 },
    smallButton: { padding: 10, backgroundColor: COLORS.surface, borderRadius: 8 },
    smallButtonText: { color: COLORS.secondary },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, padding: 20, borderTopWidth: 1, borderTopColor: COLORS.card },
    joinButton: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glow },
    joinButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    joinButtonText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
    disabledButton: { opacity: 0.7 },

    joinedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, backgroundColor: 'rgba(0, 230, 118, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
    joinedText: { color: COLORS.success, fontWeight: 'bold', fontSize: 16 },

    // Modal Styles Update
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: COLORS.primaryDark },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.text },
    input: { backgroundColor: COLORS.background, padding: 16, borderRadius: 12, marginBottom: 15, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.card },
    modalSubTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: COLORS.textSecondary },
    inviteRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    addButton: { backgroundColor: COLORS.primary, width: 54, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    mateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: COLORS.background, marginBottom: 8, borderRadius: 8 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center' },
    confirmButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
    cancelText: { fontWeight: 'bold', color: COLORS.textSecondary },
    confirmText: { fontWeight: 'bold', color: 'white' },
    savedMateChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.card },
    savedMateChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    savedMateText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' }
});
