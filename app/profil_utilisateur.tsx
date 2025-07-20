import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { MessagingService } from "@/service/messagingService";
import { Tache, User_P } from "@/type/database.type";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Query, } from "react-native-appwrite";
import { Button } from "react-native-paper";

export default function ProfilUtilisateur() {
  const { userId } = useLocalSearchParams();
  const USER_ID_TO_SHOW = userId as string | undefined;
  const [profil, setProfil] = useState<User_P | null>(null);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [tachesOuIlEstChoisi, setTachesOuIlEstChoisi] = useState<Tache[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const [loadingConv, setLoadingConv] = useState(false);

  const handleStartConversation = async () => {
    if (!user || !USER_ID_TO_SHOW) return;
    setLoadingConv(true);
    try {
      // Cherche une conversation existante
      let conversation = await MessagingService.findConversation(user.$id, USER_ID_TO_SHOW);
      // Sinon, la crée
      if (!conversation) {
        conversation = await MessagingService.createConversation([user.$id, USER_ID_TO_SHOW]);
      }
      // Redirige vers la messagerie/chat avec cette conversation
      router.push({
        pathname: '/(tabs)/MessagingScreen',
        params: { conversationId: conversation.$id }
      });
    } catch (err) {
      alert("Erreur lors de l'ouverture de la conversation");
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (typeof USER_ID_TO_SHOW !== 'string' || !USER_ID_TO_SHOW) return;
    fetchProfil(USER_ID_TO_SHOW);
    fetchTaches(USER_ID_TO_SHOW);
    fetchTachesOuIlEstChoisi(USER_ID_TO_SHOW); // Ajout récupération des tâches où il est prestataire
  }, [USER_ID_TO_SHOW]);

  const fetchProfil = async (userId: string) => {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID,
        [Query.equal("User_id", userId)]
      );
      setProfil(response.documents[0] as User_P);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTaches = async (userId: string) => {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.equal("User_id", userId)]
      );
      setTaches(response.documents as Tache[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTachesOuIlEstChoisi = async (userId: string) => {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.equal("chosenUserId", userId)]
      );
      setTachesOuIlEstChoisi(response.documents as Tache[]);
    } catch (error) {
      console.error(error);
    }
  };

  let photoUrl: string | null = null;
  if (profil?.photo_id) {
    photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profil.photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
  }

  // Calcul de la moyenne des notes reçues en tant que prestataire
  const tachesNotees = tachesOuIlEstChoisi.filter(
    t => Number(t.rating) > 0
  );
  const moyenne = tachesNotees.length > 0
    ? tachesNotees.reduce((acc, curr) => acc + Number(curr.rating), 0) / tachesNotees.length
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {photoUrl && (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={styles.name}>{profil?.nom}</Text>
          {moyenne !== null && (
            <>
              <MaterialCommunityIcons name="star" size={18} color="#FFD700" style={{ marginLeft: 8, marginRight: 2 }} />
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{moyenne.toFixed(2)} / 5</Text>
            </>
          )}
        </View>
        <Text style={styles.age}>{profil?.age} ans</Text>
        <Text style={styles.bio}>{profil?.bio}</Text>
      </View>
      <View style={styles.divider} />
      {user && user.$id !== USER_ID_TO_SHOW && (
        <View style={{ marginBottom: 16 }}>
          <Button
            mode="contained"
            onPress={handleStartConversation}
            loading={loadingConv}
            disabled={loadingConv}
          >
            {`Discuter avec ${profil?.nom || "cet utilisateur"}`}
          </Button>
        </View>
      )}
      <Text style={styles.sectionTitle}>Tâches publiées</Text>
      {taches.length > 0 ? (
        taches.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.taskCard}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/TaskDetailScreen', params: { taskId: item.$id } })}
          >
            <Text style={styles.taskTitle}>{item.Title}</Text>
            <Text style={styles.taskTheme}>{item.Tache}</Text>
            <Text style={styles.taskDesc}>{item.Description}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={{ color: '#888', marginTop: 16 }}>Aucune tâche publiée</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#3372DE',
  },
  age: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
    textAlign: 'center',
    maxWidth: 260,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 12,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#3372DE',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  taskCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  taskTheme: {
    color: '#3372DE',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  taskDesc: {
    color: '#444',
    fontSize: 14,
  },
});
