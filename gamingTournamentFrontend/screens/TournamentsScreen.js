import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl, StatusBar, Image } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "../api/api";
import { auth } from "../firebase";

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
    case 'open': return '#48BB78'; // Green
    case 'in progress': return '#ED8936'; // Orange
    case 'closed': return '#E53E3E'; // Red
    default: return '#A0AEC0'; // Gray
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
    const user = auth.currentUser;
    navigation.setOptions({
      headerTitle: "Tournois Disponibles",
      headerStyle: { backgroundColor: '#F7FAFC', elevation: 0, shadowOpacity: 0 },
      headerTitleStyle: { fontWeight: '800', fontSize: 22, color: '#2D3748' },
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginRight: 15 }}>
          <View style={styles.profileButton}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={28} color="#4A90E2" />
            )}
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#4A90E2' }]}>
          <MaterialCommunityIcons name="controller-classic" size={24} color="#FFF" />
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
            <MaterialCommunityIcons name="account-group" size={18} color="#718096" />
            <Text style={styles.metaText}>{item.maxPlayers} Joueurs</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="trophy" size={18} color="#ECC94B" />
            <Text style={styles.metaText}>{item.prize}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('TournamentDetail', { tournament: item })}
        >
          <Text style={styles.joinButtonText}>Voir Détails</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Chargement des tournois...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#E53E3E" />
        <Text style={styles.errorText}>Oups ! Une erreur est survenue.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTournaments}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-broken" size={60} color="#CBD5E0" />
            <Text style={styles.emptyText}>Aucun tournoi disponible pour le moment.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC"
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
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#EDF2F7'
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
    color: '#718096',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tournamentName: {
    fontSize: 18,
    color: '#2D3748',
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
    backgroundColor: '#EDF2F7',
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
    color: '#4A5568',
    fontWeight: '500'
  },
  joinButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  },
  loadingText: {
    marginTop: 12,
    color: '#718096',
    fontSize: 16
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 16
  },
  errorDetail: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  emptyText: {
    marginTop: 16,
    color: '#A0AEC0',
    fontSize: 16,
    textAlign: 'center',
    width: '70%'
  },
  profileButton: {
    padding: 4
  }
});

