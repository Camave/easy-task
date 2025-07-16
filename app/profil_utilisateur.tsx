import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { MessagingService } from "@/service/messagingService";
import { Tache, User_P } from "@/type/database.type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Query, } from "react-native-appwrite";
import { Button } from "react-native-paper";

export default function ProfilUtilisateur() {
  const { userId } = useLocalSearchParams();
  const USER_ID_TO_SHOW = userId as string | undefined;
  const [profil, setProfil] = useState<User_P | null>(null);
  const [taches, setTaches] = useState<Tache[]>([]);
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

  let photoUrl: string | null = null;
  if (profil?.photo_id) {
    photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profil.photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {photoUrl && (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{profil?.nom}</Text>
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
          <View key={idx} style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.Title}</Text>
            <Text style={styles.taskTheme}>{item.Tache}</Text>
            <Text style={styles.taskDesc}>{item.Description}</Text>
          </View>
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
