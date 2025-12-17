import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from "../screens/TournamentsScreen";

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
       
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Tournaments" component={TournamentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>)
    }