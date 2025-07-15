import useLocation from "@/hooks/useLocation";
import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache, User_P } from "@/type/database.type";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import MapView, { Marker } from 'react-native-maps';
import { Button, Text } from "react-native-paper";

export default function Index() {  
  const { user } = useAuth()
  const [tache, setTache] = useState<Tache[]>();
  const [allProfils, setAllProfils] = useState<User_P[]>([]);

  const router = useRouter();

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

  const handleAcceptTask = async (taskId: string) => {
    if (!user) return;
    try {
      const task = tache?.find(t => t.$id === taskId);
      if (!task) return;
      if (task.acceptedBy?.includes(user.$id)) return; // déjà accepté
      await database.updateDocument(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        taskId,
        { acceptedBy: [...(task.acceptedBy || []), user.$id] }
      );
      fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  // On n'utilise plus windowHeight pour la hauteur des cartes

  const renderItem = ({ item }: { item: Tache }) => {
    const profil = allProfils.find(p => p.User_id === item.User_id);
    const dejaAccepte = item.acceptedBy?.includes(user?.$id ?? "");
    
    return (
      <View style={styles.taskContainer}> 
        {/* Contenu principal (titre, carte, profil, description) */}
        <View style={styles.mainContent}>
          {/* Titre au-dessus de la carte */}
          <Text style={styles.title}>{item.Title}</Text>
          
          {/* Carte */}
          {(item.latitude !== undefined && item.longitude !== undefined) && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.latitude,
                longitude: item.longitude,
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

          {/* Thème de la tâche */}
          <View style={styles.themeBadge}>
            <Text style={styles.themeBadgeText}>{item.Tache}</Text>
          </View>
          
          {/* Profil sous la carte */}
          <TouchableOpacity
            style={styles.profileContainer}
            activeOpacity={0.7}
            onPress={() => {
              if (profil?.User_id) {
                router.push(`/profil_utilisateur?userId=${profil.User_id}`);
              }
            }}
          >
            {profil?.photo_id ? (
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profil.photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}` }}
                style={styles.profileAvatar}
              />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={56} color="#3372DE" style={{ marginRight: 10 }} />
            )}
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileName}>{profil?.nom ?? 'Utilisateur inconnu'}</Text>
              {profil?.age && <Text style={styles.profileAge}>{profil.age} ans</Text>}
            </View>
          </TouchableOpacity>

          {/* Description scrollable */}
          <ScrollView 
            style={styles.descriptionContainer} 
            contentContainerStyle={styles.descriptionContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.descriptionText}>{item.Description}</Text>
          </ScrollView>
        </View>
        
        {/* Bouton Accepter en bas, centré */}
        <Button 
          mode={dejaAccepte ? "outlined" : "contained"}
          disabled={dejaAccepte}
          onPress={() => handleAcceptTask(item.$id)}
          style={[styles.acceptButton, { alignSelf: 'center', marginTop: 24 }]}
          labelStyle={[styles.buttonLabel, { color: dejaAccepte ? '#3372DE' : '#fff' }]}
        >
          {dejaAccepte ? "Déjà accepté" : "Accepter"}
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tache?.filter(item => !item.chosenUserId || item.chosenUserId === "")}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        horizontal={false}
        snapToAlignment="start"
        style={styles.flatList}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Pas de tâche aujourd'hui</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  taskContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 80, // Laisse la place à la barre du bas
    justifyContent: 'flex-start',
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    marginTop: 16,
    alignSelf: 'center',
    color: '#3372DE',
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  profileAge: {
    color: '#888',
    fontSize: 15,
  },
  descriptionContainer: {
    flex: 1,
    marginTop: 16,
  },
  descriptionContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  descriptionText: {
    color: '#444',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // plus besoin de buttonContainer
  acceptButton: {
    minWidth: 140,
    borderRadius: 8,
  },
  buttonLabel: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  themeBadge: {
    alignSelf: 'center',
    backgroundColor: '#E9ECF2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
  },
  themeBadgeText: {
    color: '#3372DE',
    fontWeight: 'bold',
    fontSize: 15,
  },
});