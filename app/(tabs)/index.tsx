import { database, DATABASE_ID, TASK_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache } from "@/type/database.type";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button, Text } from "react-native-paper";


export default function Index() {  
  const { signOut, user } = useAuth()
  const [tache, setTache] = useState<Tache[]>()

  useEffect(() => {
    fetchHabits();
  }, [user])

  const fetchHabits =async () => {
    try{
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.notEqual("User_id", user?.$id ?? "")]
      );
      setTache(response.documents as Tache[])
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View style={styles.view}>
      <View>
        <Text variant="headlineSmall">Tache possible</Text>
        <Button mode = "text" onPress={signOut} icon="logout">Sign Out</Button>
        {tache?.length == 0 ? (
          <View><Text>Pas de tache aujourd'hui</Text></View>
        ) : (
          tache?.map((tache, key) => (
          <View key={key}>
            <Text> {tache.Title} </Text>
            <Text> {tache.Description} </Text>
            <View>
              <View>
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="black" />
              <Text> {tache.Tache} </Text>
              </View>
            </View>
          </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view:  {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  
});
