import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, StatusBar } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { auth } from "../firebase";

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;

  const MenuCard = ({ title, icon, color, route, description }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate(route)}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={[COLORS.surface, COLORS.card]}
        style={styles.card}
      >
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header Section */}
      <LinearGradient
        colors={[COLORS.surface, COLORS.background]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.displayName || 'Gamer'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <MaterialCommunityIcons name="account-circle-outline" size={40} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured / Hero */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Tournaments')}
          style={styles.heroContainer}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80' }}
            style={styles.heroImage}
            imageStyle={{ borderRadius: 24 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.heroOverlay}
            >
              <View style={styles.hotBadge}>
                <MaterialCommunityIcons name="fire" size={16} color="white" />
                <Text style={styles.hotText}>TRENDING</Text>
              </View>
              <Text style={styles.heroTitle}>Join the Weekly Championship</Text>
              <Text style={styles.heroSubtitle}>Compete for glory and huge prizes</Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Dashboard</Text>

        <View style={styles.grid}>
          <MenuCard
            title="Browse"
            icon="trophy-outline"
            color={COLORS.primary}
            route="Tournaments"
            description="Find active tournaments"
          />
          <MenuCard
            title="My Games"
            icon="gamepad-variant-outline"
            color={COLORS.secondary}
            route="myTournaments"
            description="Track your matches"
          />
          <MenuCard
            title="Friends"
            icon="account-group-outline"
            color={COLORS.success}
            route="FriendRequests"
            description="Manage social connections"
          />
          <MenuCard
            title="Find Players"
            icon="account-search-outline"
            color={COLORS.warning}
            route="AddFriend"
            description="Discover new teammates"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    padding: 5,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  username: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  heroContainer: {
    height: 200,
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    padding: 20,
    borderRadius: 24,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
    gap: 4,
  },
  hotText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  heroTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: '#E0E0E0',
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  cardContainer: {
    width: '47%',
    marginBottom: 15,
    ...SHADOWS.light,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    minHeight: 140,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
