import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";

export default function HomeScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const user = auth.currentUser;

  const MenuCard = ({ title, icon, color, route, description }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(route)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.username, { color: colors.text }]}>{user?.displayName || 'Gamer'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={[styles.profileButton, { borderColor: colors.border }]}>
            <Image
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Hero / Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Tournaments')}
          style={[styles.hero, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TRENDING</Text>
            </View>
            <Text style={styles.heroTitle}>Weekly Championship</Text>
            <Text style={styles.heroSubtitle}>Compete for glory & prizes</Text>
          </View>
          <MaterialCommunityIcons name="trophy" size={80} color="rgba(255,255,255,0.2)" style={styles.heroIcon} />
        </TouchableOpacity>

        {/* Dashboard Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dashboard</Text>

        <View style={styles.grid}>
          <MenuCard
            title="Browse Tournaments"
            icon="trophy-outline"
            color={colors.primary}
            route="Tournaments"
            description="Find your next challenge"
          />
          <MenuCard
            title="My Games"
            icon="gamepad-variant-outline"
            color={colors.secondary}
            route="myTournaments"
            description="Track your matches"
          />
          <MenuCard
            title="Friends"
            icon="account-group-outline"
            color={colors.success}
            route="FriendRequests"
            description="Social connections"
          />
          <MenuCard
            title="Find Players"
            icon="account-search-outline"
            color={colors.warning}
            route="AddFriend"
            description="Discover teammates"
          />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  username: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 2,
    borderRadius: 50,
    borderWidth: 1,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  hero: {
    height: 160,
    borderRadius: 24,
    marginBottom: 35,
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    zIndex: 10,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  heroIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    // Minimal shadow for white premium feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
  },
});
