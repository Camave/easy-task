import useLocation from "@/hooks/useLocation";
import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache, User_P } from "@/type/database.type";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import MapView, { Marker } from 'react-native-maps';
import { Text } from "react-native-paper";


export default function Index() {  
  const { user } = useAuth()
  const [tache, setTache] = useState<Tache[]>();
  const [allProfils, setAllProfils] = useState<User_P[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchHabits();  
      fetchAllProfils();
    }, [user])
  );

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

  const fetchAllProfils = async () => {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID
      );
      setAllProfils(response.documents as User_P[]);
    } catch (error) {
      console.error(error);
    }
  };

  const {latitude, longitude, errorMsg} = useLocation();

  const renderItem = ({ item }: { item: Tache }) => {
    // Cherche le profil de la personne qui a créé la tâche
    const profil = allProfils.find(p => p.User_id === item.User_id);
    // Construit l'URL de la photo si elle existe
    let photoUrl: string | null = null;
    if (profil?.photo_id) {
      photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profil.photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    }
    return (
      <View style={[styles.page, { height: Dimensions.get('window').height }]}> 
        {photoUrl && (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 8 }}
          />
        )}
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
          {profil?.nom ?? 'Utilisateur inconnu'}
        </Text>
        <Text variant="headlineSmall">{item.Title}</Text>
        <Text>{item.Description}</Text>
        <View>
          <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="black" />
          <Text>{item.Tache}</Text>
        </View>
        {(item.latitude !== undefined && item.longitude !== undefined) && (
          <MapView
            style={{ width: Dimensions.get('window').width, height: 300 }}
            initialRegion={{
              latitude: latitude || 0,
              longitude: longitude || 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              title={item.Title}
              description={item.Description}
            />
          </MapView>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={tache}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        horizontal={false}
        snapToAlignment="start"
        decelerationRate="fast"
        style={{ flex: 1 }}
        ListEmptyComponent={<View style={styles.page}><Text>Pas de tache aujourd'hui</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});