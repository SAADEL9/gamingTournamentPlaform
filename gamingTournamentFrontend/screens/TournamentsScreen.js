import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import api from "../api/api";

const sanitizeTournament = (item, index) => {
  try {
    return {
      _id: item._id || item.id || `fallback-id-${index}-${Math.random()}`,
      name: String(item.name || "Tournament"),
      game: String(item.game || ""),
      maxPlayers: Number(item.maxPlayers) || 0,
      prize: String(item.prize || ""),
      status: String(item.status || ""),
    };
  } catch (e) {
    return { _id: `error-${index}`, name: "Error" };
  }
};

export default function TournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTournaments = async () => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginRight: 10 }}>
          <Text style={{ color: '#4A90E2', fontWeight: 'bold' }}>Profile</Text>
        </TouchableOpacity>
      ),
    });
    loadTournaments();
  }, [navigation]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
        <Text style={styles.hint}>Is backend running at 192.168.11.109:8080?</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item._id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            {item.game && <Text>{item.game}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  item: { padding: 12, marginBottom: 8, borderRadius: 8, backgroundColor: "#f0f0f0" },
  title: { fontSize: 16, fontWeight: "600" },
  error: { color: "red", fontSize: 14, marginBottom: 10 },
  hint: { color: "#666", fontSize: 12 },
});

