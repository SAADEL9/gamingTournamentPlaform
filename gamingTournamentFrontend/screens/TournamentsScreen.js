import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl, StatusBar, Image, ImageBackground } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import api from "../api/api";
import { auth } from "../firebase";
import { COLORS, SHADOWS } from "../constants/theme";

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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return COLORS.success;
    case 'in progress': return COLORS.warning;
    case 'closed': return COLORS.error;
    default: return COLORS.textSecondary;
  }
};

export default function TournamentsScreen() {
  const navigation = useNavigation();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    navigation.setOptions({
      headerShown: false // Custom header in drawer or screen itself
    });
  }, [navigation]);


  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('TournamentDetail', { tournament: item })}
      style={{ marginBottom: 20 }}
    >
      <LinearGradient
        colors={COLORS.gradientCard}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.surface }]}>
            <MaterialCommunityIcons name="controller-classic" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.gameTitle}>{item.game}</Text>
            <Text style={styles.tournamentName} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group" size={18} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.maxPlayers} Players</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="trophy" size={18} color={COLORS.warning} />
              <Text style={styles.metaText}>{item.prize}</Text>
            </View>
          </View>

          <View style={styles.joinButton}>
            <Text style={styles.joinButtonText}>View Details</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.secondary} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Tournaments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTournaments}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tournaments</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-broken" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No tournaments available right now.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.background
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surface,
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
    color: COLORS.secondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  tournamentName: {
    fontSize: 18,
    color: COLORS.text,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: COLORS.textSecondary,
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
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold'
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 16
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 16
  },
  errorDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    width: '70%'
  },
});

