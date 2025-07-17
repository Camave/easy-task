import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';



import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName='index'
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff", // blanc opaque
        },
        headerTransparent: false, // le header est bien opaque et au-dessus
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#3372DE",
        tabBarInactiveTintColor: "#666666",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="MessagingScreen"
        options={{
          headerTitle: "Easy Task",
          headerTitleStyle: {
            color: "black",
            fontSize: 20,
            fontWeight: "bold",
          },
          headerTitleAlign: "left",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="message-reply-text-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendrier"
        options={{
          headerTitle: "Easy Task",
          headerTitleStyle: {
            color: "black",
            fontSize: 20,
            fontWeight: "bold",
          },
          headerTitleAlign: "left",
          tabBarIcon: ({ color }) => (
            <AntDesign name="calendar" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Easy Task",
          headerTitleStyle: {
            color: "black",
            fontSize: 20,
            fontWeight: "bold",
          },
          headerTitleAlign: "left",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={28} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="ajout"
        options={{
          headerTitle: "Easy Task",
          headerTitleStyle: {
            color: "black",
            fontSize: 20,
            fontWeight: "bold",
          },
          headerTitleAlign: "left",
          title: "Ajouts",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="plus-square" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          headerTitle: "Easy Task",
          headerTitleStyle: {
            color: "black",
            fontSize: 20,
            fontWeight: "bold",
          },
          headerTitleAlign: "left",
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
