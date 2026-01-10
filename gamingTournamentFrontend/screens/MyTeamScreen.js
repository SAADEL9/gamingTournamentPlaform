import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { SHADOWS } from '../constants/theme';

export default function MyTeamScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const user = auth.currentUser;
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyTeam();
        }
    }, [user]);

    const fetchMyTeam = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/team/my-team/${user.email}`);
            if (res.status === 204) {
                setTeam(null);
            } else {
                setTeam(res.data);
            }
        } catch (error) {
            console.error("Error fetching team", error);
            // 404 means no team usually, or handled by 204
            if (error.response && error.response.status === 404) {
                setTeam(null);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={[colors.surface, colors.background]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Team</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {!team ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-group-outline" size={80} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You are not part of any team yet.</Text>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('Tournaments')} // Assuming they join teams via tournaments or a separate flow
                        >
                            <Text style={styles.createButtonText}>Find a Tournament</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.teamContainer}>
                        <LinearGradient
                            colors={colors.gradientCard}
                            style={[styles.teamCard, SHADOWS.medium]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.teamHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <MaterialCommunityIcons name="shield-account" size={40} color="#FFF" />
                                </View>
                                <Text style={styles.teamName}>{team.name}</Text>
                                <Text style={styles.teamId}>ID: {team.id?.substring(team.id.length - 6)}</Text>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.membersLabel}>Team Members</Text>
                            <View style={styles.membersList}>
                                {team.members && team.members.map((member, index) => (
                                    <View key={index} style={styles.memberRow}>
                                        <MaterialCommunityIcons name="account-circle" size={24} color="#FFF" />
                                        <Text style={styles.memberName}>{member}</Text>
                                        {member === user.email && (
                                            <View style={styles.youBadge}>
                                                <Text style={styles.youText}>YOU</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },

    emptyState: { alignItems: 'center', marginTop: 100, gap: 20 },
    emptyText: { fontSize: 16 },
    createButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    createButtonText: { color: 'white', fontWeight: 'bold' },

    teamContainer: { alignItems: 'center' },
    teamCard: { width: '100%', borderRadius: 24, padding: 24 },
    teamHeader: { alignItems: 'center', marginBottom: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    teamName: { fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center' },
    teamId: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 5 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%', marginVertical: 20 },

    membersLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    membersList: { gap: 12 },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12 },
    memberName: { color: '#FFF', fontSize: 16, fontWeight: '600', flex: 1 },
    youBadge: { backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    youText: { color: '#000', fontSize: 10, fontWeight: 'bold' }
});
