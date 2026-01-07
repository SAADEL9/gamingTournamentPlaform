import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/api";
import { auth } from "../firebase";
import { useTheme } from "../context/ThemeContext";

export default function MyTournamentsScreen() {
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
      const user = auth.currentUser;

      if (!user?.email) {
        setTournaments([]);
        return;
      }

      console.log("Fetching my tournaments for:", user.email);
      // Ensure the path matches the backend controller: /api/tournament/my-tournaments
      const res = await api.get("/tournament/my-tournaments", {
        params: { userEmail: user.email },
      });

      setTournaments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error:", err.message);
      setError("Impossible de charger les tournois");
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
    const user = auth.currentUser;
    navigation.setOptions({
      headerShown: true, // Re-enable default header but styled
      headerTitle: "My Tournaments",
      headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0 },
      headerTitleStyle: { fontWeight: '800', fontSize: 22, color: colors.text },
      headerTintColor: colors.text,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{ marginRight: 15 }}>
          <View style={styles.profileButton}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={28} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.text }]}
      onPress={() => navigation.navigate("TournamentDetail", { tournament: item })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="controller-classic" size={24} color="#FFF" />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.gameTitle, { color: colors.textSecondary }]}>{item.game || "Game"}</Text>
          <Text style={[styles.tournamentName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || "Joined"}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={18} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.participants?.length || 0} participants</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="trophy" size={18} color={colors.warning} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.prize || "Prizes"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement de vos tournois...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['right', 'left', 'bottom']}>
      {/* Edges prop used to avoid safe area on top since we have a header */}
      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-broken" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Vous n'avez rejoint aucun tournoi pour le moment.</Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("Tournaments")}
            >
              <Text style={styles.browseButtonText}>Parcourir les tournois</Text>
            </TouchableOpacity>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  listContent: {
    padding: 20,
    paddingBottom: 40
  },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
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
    gap: 6
  },
  metaText: {
    fontSize: 15,
    fontWeight: '500'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16
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
    width: '70%',
    marginBottom: 20
  },
  profileButton: {
    padding: 4
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  }
});
