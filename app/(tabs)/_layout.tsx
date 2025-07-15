import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "transparent", // 🎯 Transparence du haut
        },
        headerTransparent: true, // ✅ Important : active la transparence
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
            <EvilIcons name="user" size={37} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
