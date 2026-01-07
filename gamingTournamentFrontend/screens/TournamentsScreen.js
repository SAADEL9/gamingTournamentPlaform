import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl, StatusBar } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/api";
import { useTheme } from "../context/ThemeContext";
import { SHADOWS } from "../constants/theme";

const sanitizeTournament = (item, index) => {
  try {
    return {
      _id: item._id || item.id || `fallback-id-${index}-${Math.random()}`,
      id: item.id || item._id,
      name: String(item.name || "Tournament"),
      game: String(item.game || "Game"),
      maxPlayers: Number(item.maxPlayers) || 0,
      prize: String(item.prize || "N/A"),
      status: String(item.status || "Pending"),
      participants: Array.isArray(item.participants) ? item.participants : [],
      teamSize: Number(item.teamSize) || 1,
      teams: Array.isArray(item.teams) ? item.teams : [],
    };
  } catch (e) {
    return { _id: `error-${index}`, name: "Error" };
  }
};

export default function TournamentsScreen() {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return colors.success;
      case 'in progress': return colors.warning;
      case 'closed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const loadTournaments = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const res = await api.get("/tournament");
      if (Array.isArray(res.data)) {
        setTournaments(res.data.map((item, index) => sanitizeTournament(item, index)));
      } else {
        setTournaments([]);
      }
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message || "Cannot connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTournaments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('TournamentDetail', { tournament: item })}
      style={{ marginBottom: 20 }}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
            <MaterialCommunityIcons name="controller-classic" size={24} color={colors.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text style={[styles.gameTitle, { color: colors.primary }]}>{item.game}</Text>
            <Text style={[styles.tournamentName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group" size={18} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.maxPlayers} Players</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="trophy" size={18} color={colors.warning} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.prize}</Text>
            </View>
          </View>

          <View style={styles.joinButton}>
            <Text style={[styles.joinButtonText, { color: colors.secondary }]}>View Details</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.secondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Tournaments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>Oops! Something went wrong.</Text>
        <Text style={[styles.errorDetail, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadTournaments}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tournaments</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-broken" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No tournaments available right now.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center'
  },
  gameTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  divider: {
    height: 1,
    marginBottom: 16
  },
  cardBody: {
    gap: 16
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500'
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    width: '70%'
  },
});

