import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, FlatList, ImageBackground, StatusBar } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from "../firebase";
import api from "../api/api";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES, SHADOWS } from "../constants/theme";

export default function TournamentDetailScreen({ route }) {
    const { colors } = useTheme();
    const { tournament: initialTournament, id: tournamentId } = route.params || {};
    const [tournament, setTournament] = useState(initialTournament || null);
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
    const [loading, setLoading] = useState(false);

    const teamSize = tournament?.teamSize || 1;
    const isTeamMode = teamSize > 1;

    useEffect(() => {
        if (!tournament && (tournamentId || route.params?.id)) {
            fetchTournamentDetails(tournamentId || route.params?.id);
        } else if (tournament) {
            showMatches(tournament.id || tournament._id);
        }
    }, [tournamentId, route.params?.id]);

    const fetchTournamentDetails = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/tournament/${id}`);
            setTournament(res.data);
            showMatches(id);
        } catch (e) {
            console.error("Error fetching tournament details", e);
            Alert.alert("Error", "Could not load tournament details.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    // Match Editing
    const [editMatch, setEditMatch] = useState(null);
    const [score1, setScore1] = useState("");
    const [score2, setScore2] = useState("");
    const [savingScore, setSavingScore] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Check if user is already a participant
    const isJoined = isTeamMode
        ? tournament?.teams?.some(t => t.members?.includes(user?.email))
        : tournament?.participants?.includes(user?.email);

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


    // Group matches by round
    const groupedMatches = matches.reduce((acc, match) => {
        const round = match.round || 1;
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {});

    const openJoinModal = () => {
        if (!user) {
            Alert.alert("Login Required", "You must be logged in to join tournaments.");
            return;
        }
        if (isTeamMode) {
            setShowTeamModal(true);
        } else {
            submitJoin(null, null);
        }
    };


    const renderMatchItem = ({ item }) => {
        const p1Score = item.score1 !== undefined ? item.score1 : '-';
        const p2Score = item.score2 !== undefined ? item.score2 : '-';
        const isCompleted = item.status === 'COMPLETED';
        const winner = item.winnerId;

        return (
            <TouchableOpacity onPress={() => openEditMatch(item)} activeOpacity={0.9}>
                <LinearGradient
                    colors={colors.gradientCard}
                    style={[styles.matchCard, { borderColor: colors.border }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.matchHeader}>
                        <Text style={[styles.matchIdText, { color: colors.textMuted }]}>Match #{item.id?.substring(item.id.length - 4)}</Text>
                        <View style={[styles.matchStatusBadge, { backgroundColor: getStatusColor(item.status) + '30' }]}>
                            <Text style={[styles.matchStatusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                    </View>

                    <View style={styles.matchPlayersRow}>
                        {/* Player 1 */}
                        <View style={[styles.playerSide, winner === item.player1Id && styles.winnerSide]}>
                            <Text style={[styles.playerName, winner === item.player1Id && styles.winnerText, { color: winner === item.player1Id ? colors.success : colors.textSecondary }]} numberOfLines={1}>
                                {item.player1Name || item.player1Id || "Waiting..."}
                            </Text>
                            <Text style={[styles.playerScore, winner === item.player1Id && styles.winnerScore, { color: winner === item.player1Id ? colors.success : colors.text }]}>{p1Score}</Text>
                            {winner === item.player1Id && <MaterialCommunityIcons name="crown" size={16} color={colors.warning} />}
                        </View>

                        <Text style={[styles.vsText, { color: colors.textMuted }]}>VS</Text>

                        {/* Player 2 */}
                        <View style={[styles.playerSide, winner === item.player2Id && styles.winnerSide]}>
                            <Text style={[styles.playerScore, winner === item.player2Id && styles.winnerScore, { color: winner === item.player2Id ? colors.success : colors.text }]}>{p2Score}</Text>
                            <Text style={[styles.playerName, winner === item.player2Id && styles.winnerText, { color: winner === item.player2Id ? colors.success : colors.textSecondary }]} numberOfLines={1}>
                                {item.player2Name || item.player2Id || "Waiting..."}
                            </Text>
                            {winner === item.player2Id && <MaterialCommunityIcons name="crown" size={16} color={colors.warning} />}
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
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
        openJoinModal();
    };

    const submitJoin = async (tName, tMates) => {
        setJoining(true);
        try {
            await api.post(`/tournament/${tournament.id || tournament._id}/join`, {
                email: user.email,
                teamName: tName,
                teammates: tMates
            });
            if (tName) {
                Alert.alert("Success", `Team "${tName}" has been created and registered for the tournament! Invitations have been sent to your teammates.`, [
                    { text: "View Teams", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Success", "You have successfully joined the tournament as a solo participant!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
            setShowTeamModal(false);
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
        Alert.alert("Success", `Friend ${email} selected to be invited!`);
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

    const openEditMatch = (match) => {
        if (match.player1Id === 'BYE' || match.player2Id === 'BYE') return;
        if (!match.player1Id || !match.player2Id) {
            Alert.alert("Wait", "Both players must be ready to enter scores.");
            return;
        }

        // Access Control
        const isParticipant = match.player1Id === user?.email || match.player2Id === user?.email;
        if (!isParticipant) {
            Alert.alert("Access Denied", "Only participants of this match can update the result.");
            return;
        }

        if (match.status === 'COMPLETED') {
            Alert.alert("Completed", `Match finished. Winner: ${match.winnerName}`);
            return;
        }

        if (match.status === 'PENDING_CONFIRMATION') {
            if (match.scoreSubmittedBy === user.email) {
                Alert.alert("Pending", "Waiting for your opponent to confirm the score.");
                return;
            } else {
                setEditMatch(match);
                setScore1(String(match.score1));
                setScore2(String(match.score2));
                setIsConfirming(true);
                return;
            }
        }

        setEditMatch(match);
        setScore1(match.score1 !== undefined ? String(match.score1) : "");
        setScore2(match.score2 !== undefined ? String(match.score2) : "");
        setIsConfirming(false);
    };

    const submitScore = async () => {
        if (!score1 || !score2) {
            Alert.alert("Error", "Please enter both scores.");
            return;
        }

        setSavingScore(true);
        try {
            await api.post(`/matches/${editMatch.id || editMatch._id}/score`, {
                score1: parseInt(score1),
                score2: parseInt(score2),
                submittedBy: user.email
            });
            Alert.alert(
                "Score Submitted",
                `Score submitted! Your opponent must confirm it before it becomes official.`,
                [{ text: "OK" }]
            );
            setEditMatch(null);
            showMatches(tournament.id || tournament._id); // Refresh
        } catch (error) {
            console.error("Error updating score:", error);
            Alert.alert("Error", "Failed to update score.");
        } finally {
            setSavingScore(false);
        }
    };

    const confirmScore = async () => {
        setSavingScore(true);
        try {
            await api.post(`/matches/${editMatch.id || editMatch._id}/confirm`, {
                confirmedBy: user.email
            });
            Alert.alert("Confirmed", "Match score confirmed!", [{ text: "OK" }]);
            setEditMatch(null);
            setIsConfirming(false);
            showMatches(tournament.id || tournament._id);
            fetchTournamentDetails(tournament.id || tournament._id); // Refresh mainly for winner check
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to confirm score");
        } finally {
            setSavingScore(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return colors.success;
            case 'in progress': return colors.warning;
            case 'closed': return colors.error;
            case 'completed': return colors.info;
            case 'pending_confirmation': return colors.warning; // Add this
            default: return colors.textSecondary;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />

            {(loading || !tournament) ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    {/* Header */}
                    <LinearGradient colors={[colors.surface, colors.background]} style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Tournament Arena</Text>
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
                                <Text style={[styles.gameTitle, { color: colors.secondary }]}>{tournament.game}</Text>
                                <Text style={[styles.name, { color: colors.text }]}>{tournament.name}</Text>
                            </LinearGradient>
                        </ImageBackground>

                        {/* Winner Banner */}
                        {tournament.winnerName && (
                            <LinearGradient colors={['#FFD700', '#FFA500']} style={[styles.winnerBanner, SHADOWS.medium]}>
                                <MaterialCommunityIcons name="trophy-award" size={40} color="white" />
                                <View>
                                    <Text style={styles.winnerLabel}>TOURNAMENT CHAMPION</Text>
                                    <Text style={styles.winnerName}>{tournament.winnerName}</Text>
                                </View>
                            </LinearGradient>
                        )}

                        {/* Details Cards */}
                        <View style={[styles.statsContainer, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="account-group" size={24} color={colors.secondary} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {isTeamMode ? (tournament.teams?.length || 0) : (tournament.participants?.length || 0)} <Text style={[styles.statMax, { color: colors.textSecondary }]}>/ {tournament.maxPlayers}</Text>
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isTeamMode ? "Teams" : "Players"}</Text>
                            </View>
                            <View style={[styles.dividerVertical, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="trophy" size={24} color={colors.warning} />
                                <Text style={[styles.statValue, { color: colors.text }]}>{tournament.prize}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Prize Pool</Text>
                            </View>
                            <View style={[styles.dividerVertical, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="format-list-numbered" size={24} color={colors.primaryLight} />
                                <Text style={[styles.statValue, { color: colors.text }]}>{teamSize}v{teamSize}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Format</Text>
                            </View>
                        </View>

                        {/* Bracket / Matches Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Matches & Bracket</Text>
                            <TouchableOpacity onPress={() => showMatches(tournament.id || tournament._id)}>
                                <Text style={[styles.refreshText, { color: colors.secondary }]}><MaterialCommunityIcons name="refresh" /> Refresh</Text>
                            </TouchableOpacity>
                        </View>

                        {matches.length > 0 ? (
                            Object.keys(groupedMatches).map(round => (
                                <View key={round} style={styles.roundContainer}>
                                    <Text style={[styles.roundTitle, { color: colors.textSecondary }]}>Round {round}</Text>
                                    {groupedMatches[round].map(match => (
                                        <View key={match._id || match.id}>
                                            {renderMatchItem({ item: match })}
                                        </View>
                                    ))}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>No matches generated yet.</Text>
                                <TouchableOpacity onPress={() => showMatches(tournament.id || tournament._id)} style={[styles.smallButton, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.smallButtonText, { color: colors.secondary }]}>Load Matches</Text>
                                </TouchableOpacity>
                            </View>
                        )}


                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Sticky Footer for Actions */}
                    <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                        {isJoined ? (
                            <View style={[styles.joinedBadge, { backgroundColor: colors.success + '20', borderColor: colors.success + '40' }]}>
                                <MaterialCommunityIcons name="check-decagram" size={24} color={colors.success} />
                                <Text style={[styles.joinedText, { color: colors.success }]}>Registered for Tournament</Text>
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
                                        colors={tournament.status?.toLowerCase() === 'open' ? colors.gradientPrimary : [colors.textMuted, colors.textMuted]}
                                        style={styles.joinButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={[styles.joinButtonText, { color: '#FFF' }]}>
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
                            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.primaryDark }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Register Team ({teamSize}v{teamSize})</Text>

                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Team Name"
                                    placeholderTextColor={colors.textMuted}
                                    value={teamName}
                                    onChangeText={setTeamName}
                                />

                                <Text style={[styles.modalSubTitle, { color: colors.textSecondary }]}>Invite Teammates ({teammates.length + 1}/{teamSize})</Text>

                                {/* Saved Teammates List */}
                                {savedTeammates.length > 0 && (
                                    <View style={{ marginBottom: 15 }}>
                                        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 5 }}>From your saved teammates:</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                            {savedTeammates.map(mate => (
                                                <TouchableOpacity
                                                    key={mate}
                                                    style={[styles.savedMateChip, { backgroundColor: colors.surface, borderColor: colors.border }, teammates.includes(mate) && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                                    onPress={() => !teammates.includes(mate) && handleAddTeammate(mate)}
                                                >
                                                    <MaterialCommunityIcons name="account-plus" size={16} color={teammates.includes(mate) ? "white" : colors.primary} />
                                                    <Text style={[styles.savedMateText, { color: teammates.includes(mate) ? 'white' : colors.textSecondary }]}>{mate}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View style={styles.inviteRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                        placeholder="Or enter email manually..."
                                        placeholderTextColor={colors.textMuted}
                                        value={teammateEmail}
                                        onChangeText={setTeammateEmail}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => handleAddTeammate(null)} style={[styles.addButton, { backgroundColor: colors.primary }]}>
                                        <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ maxHeight: 100, marginVertical: 10 }}>
                                    {teammates.map((mate, idx) => (
                                        <View key={idx} style={[styles.mateRow, { backgroundColor: colors.background }]}>
                                            <Text style={{ color: colors.text }}>{mate}</Text>
                                            <TouchableOpacity onPress={() => setTeammates(teammates.filter((_, i) => i !== idx))}>
                                                <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.border }]} onPress={() => setShowTeamModal(false)}>
                                        <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.primary }]} onPress={submitTeamJoin}>
                                        <Text style={styles.confirmText}>Send Invites</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Match Result Modal */}
                    <Modal
                        visible={!!editMatch}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setEditMatch(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.primaryDark }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    {isConfirming ? "Confirm Match Score" : "Update Match Result"}
                                </Text>
                                {isConfirming && <Text style={{ textAlign: 'center', color: colors.warning, marginBottom: 10, fontWeight: 'bold' }}>Opponent submitted this score. Confirm?</Text>}

                                <View style={styles.scoreRow}>
                                    <View style={styles.scoreInputGroup}>
                                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]} numberOfLines={1}>{editMatch?.player1Name || editMatch?.player1Id}</Text>
                                        <TextInput
                                            style={[styles.scoreInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                            keyboardType="numeric"
                                            value={score1}
                                            onChangeText={setScore1}
                                            placeholder="0"
                                            placeholderTextColor={colors.textMuted}
                                        />
                                    </View>
                                    <Text style={[styles.scoreVs, { color: colors.textMuted }]}>VS</Text>
                                    <View style={styles.scoreInputGroup}>
                                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]} numberOfLines={1}>{editMatch?.player2Name || editMatch?.player2Id}</Text>
                                        <TextInput
                                            style={[styles.scoreInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                            keyboardType="numeric"
                                            value={score2}
                                            onChangeText={setScore2}
                                            placeholder="0"
                                            placeholderTextColor={colors.textMuted}
                                        />
                                    </View>
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.cancelButton, { backgroundColor: colors.border }]}
                                        onPress={() => setEditMatch(null)}
                                        disabled={savingScore}
                                    >
                                        <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.confirmButton, { backgroundColor: isConfirming ? colors.success : colors.primary }]}
                                        onPress={isConfirming ? confirmScore : submitScore}
                                        disabled={savingScore}
                                    >
                                        {savingScore ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>{isConfirming ? "Confirm" : "Submit Score"}</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { paddingBottom: 100 },

    banner: { height: 220, marginHorizontal: 20, borderRadius: 24, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 20 },
    bannerGradient: { padding: 20, width: '100%' },
    gameTitle: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },
    name: { fontSize: 26, fontWeight: '900', marginTop: 5 },

    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
    statusText: { color: "#FFF", fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

    statsContainer: { flexDirection: 'row', marginHorizontal: 20, padding: 20, borderRadius: 12, justifyContent: 'space-between', marginBottom: 30 },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
    statMax: { fontSize: 12 },
    statLabel: { fontSize: 12, marginTop: 2 },
    dividerVertical: { width: 1, marginHorizontal: 10 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold' },
    refreshText: { fontWeight: '600' },

    roundContainer: { marginBottom: 25, paddingHorizontal: 20 },
    roundTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },

    matchCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
    matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    matchIdText: { fontSize: 10 },
    matchStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    matchStatusText: { fontSize: 10, fontWeight: 'bold' },

    matchPlayersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    playerSide: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 4 },
    winnerSide: { opacity: 1 },
    playerName: { fontWeight: '600', fontSize: 14 },
    winnerText: { fontWeight: 'bold' },
    playerScore: { fontSize: 20, fontWeight: 'bold' },
    winnerScore: {},
    vsText: { fontSize: 10, fontWeight: 'bold', marginHorizontal: 10 },

    emptyState: { alignItems: 'center', marginTop: 30 },
    emptyStateText: { marginBottom: 15 },
    smallButton: { padding: 10, borderRadius: 8 },
    smallButtonText: {},

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
    joinButton: { borderRadius: 16, overflow: 'hidden' },
    joinButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    joinButtonText: { fontSize: 18, fontWeight: 'bold' },
    disabledButton: { opacity: 0.7 },

    joinedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, borderRadius: 16, borderWidth: 1 },
    joinedText: { fontWeight: 'bold', fontSize: 16 },

    // Modal Styles Update
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { borderRadius: 24, padding: 24, width: '100%', borderWidth: 1 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { padding: 16, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1 },
    modalSubTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
    inviteRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    addButton: { width: 54, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    mateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, marginBottom: 8, borderRadius: 8 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    confirmButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelText: { fontWeight: 'bold' },
    confirmText: { fontWeight: 'bold', color: 'white' },
    savedMateChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
    savedMateChipSelected: {},
    savedMateText: { fontSize: 12, fontWeight: '600' },

    // Score Modal Styles
    scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    scoreInputGroup: { flex: 1, alignItems: 'center' },
    scoreInput: { fontSize: 24, fontWeight: 'bold', padding: 15, borderRadius: 12, textAlign: 'center', width: 80, borderWidth: 1 },
    scoreLabel: { fontSize: 12, marginBottom: 8, fontWeight: '600', maxWidth: 100 },
    scoreVs: { fontWeight: '900', fontSize: 18, marginHorizontal: 10 },

    // Winner Banner
    winnerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        gap: 15
    },
    winnerLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        opacity: 0.9,
        letterSpacing: 1
    },
    winnerName: {
        color: 'white',
        fontWeight: '900',
        fontSize: 20,
        textTransform: 'uppercase'
    }
});
