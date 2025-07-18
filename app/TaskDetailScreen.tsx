import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache, User_P } from "@/type/database.type";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { Button } from "react-native-paper";

export const options = { headerShown: false };

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState<Tache | null>(null);
  const [profil, setProfil] = useState<User_P | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      try {
        const response = await database.listDocuments(
          DATABASE_ID,
          TASK_COLLECTION_ID,
          []
        );
        const found = (response.documents as Tache[]).find(t => t.$id === taskId);
        setTask(found || null);
        if (found) {
          // Récupérer le profil du créateur
          const userRes = await database.listDocuments(
            DATABASE_ID,
            USER_COLLECTION_ID,
            [ ]
          );
          const prof = (userRes.documents as User_P[]).find(p => p.User_id === found.User_id);
          setProfil(prof || null);
        }
      } catch (error) {
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const dejaAccepte = task?.acceptedBy?.includes(user?.$id ?? "");

  const handleAcceptTask = async () => {
    if (!user || !task) return;
    setAcceptLoading(true);
    try {
      if (task.acceptedBy?.includes(user.$id)) return;
      await database.updateDocument(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        task.$id,
        { acceptedBy: [...(task.acceptedBy || []), user.$id] }
      );
      setTask({ ...task, acceptedBy: [...(task.acceptedBy || []), user.$id] });
    } catch (e) {
      // Optionnel : afficher une erreur
    } finally {
      setAcceptLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#3372DE" /></View>;
  }
  if (!task) {
    return <View style={styles.center}><Text>Tâche introuvable</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{task.Title}</Text>
      {/* horaire */}
      {task.dateExecution && (
        <Text style={{textAlign: 'center', color: '#3372DE', marginBottom: 10}}>
          {new Date(task.dateExecution).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
        </Text>
      )}
      {/* Carte avec bouton agrandir */}
      <View style={{ position: 'relative', width: '100%' }}>
        {task.latitude && task.longitude && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: task.latitude,
              longitude: task.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: task.latitude, longitude: task.longitude }}
              title={task.Title}
              description={task.Description}
            />
          </MapView>
        )}
        {/* Bouton agrandir en bas à droite de la carte */}
        <View style={styles.expandButtonOverlay}>
          <TouchableOpacity
            onPress={() => router.push(`/map?taskId=${task.$id}`)}
            style={styles.expandButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-expand" size={28} color="#3372DE" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Badge thème */}
      <View style={styles.themeBadge}>
        <Text style={styles.themeBadgeText}>{task.Tache}</Text>
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
      {/* Description */}
      <ScrollView 
        style={styles.descriptionContainer} 
        contentContainerStyle={styles.descriptionContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.descriptionText}>{task.Description}</Text>
      </ScrollView>
      {/* Bouton Accepter */}
      <Button 
        mode={dejaAccepte ? "outlined" : "contained"}
        disabled={dejaAccepte}
        loading={acceptLoading}
        onPress={handleAcceptTask}
        style={[styles.acceptButton, { alignSelf: 'center', marginTop: 24 }]}
        labelStyle={[styles.buttonLabel, { color: dejaAccepte ? '#3372DE' : '#fff' }]}
      >
        {dejaAccepte ? "Déjà accepté" : "Accepter"}
      </Button>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#3372DE',
    marginBottom: 8,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  expandButtonOverlay: {
    position: 'absolute',
    bottom: 30,
    right: 18,
    zIndex: 10,
  },
  expandButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
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
    width: '100%',
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
  acceptButton: {
    minWidth: 140,
    borderRadius: 8,
  },
  buttonLabel: {
    fontWeight: 'bold',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
}); 