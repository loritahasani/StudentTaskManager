<<<<<<< HEAD
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '/StudentTaskManager/screens/HomeScreen';
import AddTaskScreen from '/StudentTaskManager/screens/AddTaskScreen';
import AnalyticsScreen from '/StudentTaskManager/screens/AnalyticsScreen';

// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Create Native Stack Navigator for HomeScreen and AddTaskScreen
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'format-list-checks';
            if (route.name === 'Analytics') iconName = 'chart-arc';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
=======
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
>>>>>>> 8125529ebf0df06b0242f3cb85e17431061924e5
