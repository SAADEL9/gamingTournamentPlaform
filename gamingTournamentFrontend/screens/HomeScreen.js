import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import api from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../constants/theme";

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const user = auth.currentUser;
  const [nextMatch, setNextMatch] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNextMatch();
    }, [user])
  );

  const fetchNextMatch = async () => {
    if (!user) return;
    setLoadingMatch(true);
    try {
      const response = await api.get(`/matches/user/${user.email}`);
      const matches = response.data;
      // Get the first PENDING match
      const upcoming = matches.find(m => m.status === 'PENDING' || m.status === 'READY');
      setNextMatch(upcoming);
    } catch (error) {
      console.error("Error fetching next match:", error);
    } finally {
      setLoadingMatch(false);
    }
  };

  // Mock Data for Games
  const games = [
    { id: '1', name: 'FIFA 24', icon: 'soccer', color: '#E53E3E' },
    { id: '2', name: 'Call of Duty', icon: 'target', color: '#DD6B20' },
    { id: '3', name: 'League', icon: 'sword', color: '#3182CE' },
    { id: '4', name: 'Valorant', icon: 'triangle', color: '#D53F8C' },
  ];

  // Mock Data for Featured Tournaments
  const featuredTournaments = [
    { id: '1', title: 'Weekend Championship', game: 'FIFA 24', prize: '$500', participants: '128' },
    { id: '2', title: 'Nightly Customs', game: 'COD: Warzone', prize: '$100', participants: '60' },
    { id: '3', title: 'Bronze Cup', game: 'League of Legends', prize: '$250', participants: '32' },
  ];

  const FeaturedCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Tournaments')}
      style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.featuredImagePlaceholder, { backgroundColor: colors.primary }]}>
        <MaterialCommunityIcons name="trophy" size={50} color="rgba(255,255,255,0.8)" />
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      <View style={styles.featuredContent}>
        <Text style={[styles.featuredGame, { color: colors.primary }]}>{item.game}</Text>
        <Text style={[styles.featuredTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={styles.featuredMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="trophy-outline" size={14} color={colors.warning} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.prize}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.participants} Players</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const GameCategory = ({ item }) => (
    <TouchableOpacity style={[styles.gameCategory, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.gameIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={[styles.gameName, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Ready to play?</Text>
            <Text style={[styles.username, { color: colors.text }]}>{user?.displayName || 'Gamer'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate("FriendRequests")}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
              <View style={[styles.badgeDot, { backgroundColor: colors.error }]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={[styles.profileButton, { borderColor: colors.border }]}>
              <Image
                source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Match Notification */}
        {nextMatch && (
          <TouchableOpacity
            style={[styles.nextMatchCard, { backgroundColor: colors.info + '15', borderColor: colors.info }]}
            onPress={() => navigation.navigate('TournamentDetail', { id: nextMatch.tournamentId })}
          >
            <View style={[styles.nextMatchBadge, { backgroundColor: colors.info }]}>
              <MaterialCommunityIcons name="sword-cross" size={16} color="#FFF" />
              <Text style={styles.nextMatchBadgeText}>NEXT MATCH</Text>
            </View>
            <View style={styles.nextMatchInfo}>
              <Text style={[styles.nextMatchOpponent, { color: colors.text }]}>
                Vs. {nextMatch.player1Id === user.email ? nextMatch.player2Name : nextMatch.player1Name}
              </Text>
              <Text style={[styles.nextMatchStatus, { color: colors.textSecondary }]}>
                Ready to play! Tap to enter results.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.info} />
          </TouchableOpacity>
        )}

        {/* Quick Actions (Replacing Dashboard Grid with streamlined buttons) */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("Tournaments")}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>Quick Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={() => navigation.navigate("myTournaments")}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>My Matches</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Tournaments</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Tournaments")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={featuredTournaments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FeaturedCard item={item} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        />

        {/* Categories */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 16 }]}>Browse by Game</Text>
        <View style={styles.gamesGrid}>
          {games.map(game => (
            <GameCategory key={game.id} item={game} />
          ))}
        </View>

        {/* Recent Activity Banner */}
        <View style={[styles.promoBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>Find Teammates</Text>
            <Text style={[styles.promoDesc, { color: colors.textSecondary }]}>Connect with players and build your squad.</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AddFriend")}>
              <Text style={[styles.promoLink, { color: colors.primary }]}>Search Players &rarr;</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="account-group" size={48} color={colors.primary} style={{ opacity: 0.8 }} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 1,
    borderColor: '#FFF'
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 2,
    borderRadius: 50,
    borderWidth: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600'
  },
  carousel: {
    gap: 16,
    paddingRight: 20
  },
  featuredCard: {
    width: 260,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredImagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  featuredContent: {
    padding: 16
  },
  featuredGame: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500'
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  gameCategory: {
    width: (width - 48 - 12) / 2, // 2 columns
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600'
  },
  promoBanner: {
    marginTop: 30,
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: 20
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  promoDesc: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20
  },
  promoLink: {
    fontWeight: '700',
    fontSize: 14
  },
  nextMatchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12
  },
  nextMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  nextMatchBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900'
  },
  nextMatchInfo: {
    flex: 1
  },
  nextMatchOpponent: {
    fontSize: 16,
    fontWeight: '700'
  },
  nextMatchStatus: {
    fontSize: 12,
    marginTop: 2
  }
});
