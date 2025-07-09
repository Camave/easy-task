import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return(
    <Tabs screenOptions=
    {{headerStyle: {backgroundColor: "#f5f5f5"}, 
    headerShadowVisible : false,
    tabBarStyle:{
      backgroundColor: "#f5f5f5",
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarActiveTintColor: "#6200ee",
    tabBarInactiveTintColor: "#666666",
    }}>
      <Tabs.Screen 
      name="index" 
      options={{
        title: "Home", 
        tabBarIcon: ({color}) => {
          return (
          <AntDesign name="home" size={24} color={color} />
          )
        }
      }}
      />
      <Tabs.Screen 
        name="login" 
        options={{
          title: "Ajouts", 
          tabBarIcon: ({color}) => {
            return (
            <FontAwesome6 name="plus-square" size={24} color={color} />
            )
          }
        }}
      /><Tabs.Screen 
        name="ajout" 
        options={{
          title: "Ajouts", 
          tabBarIcon: ({color}) => {
            return (
            <FontAwesome6 name="plus-square" size={24} color={color} />
            )
          }
        }}
      />
    </Tabs> 
  );
}
