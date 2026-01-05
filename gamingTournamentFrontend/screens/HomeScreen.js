import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#2D3748' }}>Home Screen</Text>

      <View style={{ width: '100%', gap: 15 }}>
        <Button
          title="Browse Tournaments"
          onPress={() => navigation.navigate("Tournaments")}
          color="#4A90E2"
        />
        <Button
          title="My Tournaments"
          onPress={() => navigation.navigate("myTournaments")}
          color="#4A90E2"
        />
        <Button
          title="My Profile"
          onPress={() => navigation.navigate("Profile")}
          color="#2D3748"
        />
        <Button
          title="Find Friends"
          onPress={() => navigation.navigate("AddFriend")}
          color="#4299E1"
        />
      </View>
    </View>
  );
}
