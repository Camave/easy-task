import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache, User_P } from "@/type/database.type";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button } from "react-native-paper";

export default function Profil() {
  const { signOut, user } = useAuth();
  const [tache, setTache] = useState<Tache[]>();
  const [User_profil, setUser_profil] = useState<User_P[]>([]);
  const [allProfils, setAllProfils] = useState<User_P[]>([]);
  const [tachesOuChoisi, setTachesOuChoisi] = useState<Tache[]>([]);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      fetchProfils();
      fetchAllProfils();
      fetchTachesOuChoisi();
    }, [user])
  );

  const fetchHabits = async () => {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.equal("User_id", user?.$id ?? "")]
      );
      setTache(response.documents as Tache[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProfils = async () => {
    try {
      if (!user) return;
      const response = await database.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID,
        [Query.equal("User_id", user.$id)]
      );
      setUser_profil(response.documents as User_P[]);
    } catch (error) {
      console.error(error);
    }
  };

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

  const fetchTachesOuChoisi = async () => {
    try {
      if (!user) return;
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.equal("chosenUserId", user.$id)]
      );
      setTachesOuChoisi(response.documents as Tache[]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChooseUser = async (taskId: string, userId: string) => {
    try {
      await database.updateDocument(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        taskId,
        { chosenUserId: userId }
      );
      fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  let photoUrl: string | null = null;
  if (User_profil[0]?.photo_id) {
    photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${User_profil[0].photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.headerRow}>
        <View style={styles.profileInfo}>
          {photoUrl && (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatar}
            />
          )}
          <Text style={styles.name}>{User_profil[0]?.nom}</Text>
          <Text style={styles.age}>{User_profil[0]?.age} ans</Text>
          <Text style={styles.bio}>{User_profil[0]?.bio}</Text>
        </View>
        <View style={styles.buttonCol}>
          <Button mode="contained" onPress={signOut} icon="logout" style={styles.button}>
            Déconnexion
          </Button>
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => router.push("/modifier-profil")}
            style={styles.button}
          >
            Modifier
          </Button>
        </View>
      </View>
      <View style={styles.divider} />
      <View>
        {/* Tâches créées par l'utilisateur connecté */}
        {tache && tache.length > 0 ? (
          tache.map((item, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.Title}</Text>
              <Text>{item.Description}</Text>
              <Text>{item.Tache}</Text>
              {/* Affichage du prestataire choisi */}
              {item.chosenUserId ? (
                <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 4 }}>
                  Prestataire choisi : {(() => {
                    const profilChoisi = allProfils.find(p => p.User_id === item.chosenUserId);
                    return profilChoisi ? profilChoisi.nom : item.chosenUserId;
                  })()}
                </Text>
              ) : null}
              <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Personnes ayant accepté :</Text>
              {item.acceptedBy && item.acceptedBy.length > 0 ? (
                item.acceptedBy.map((userId: string) => {
                  const profil = allProfils.find(p => p.User_id === userId);
                  return (
                    <View key={userId} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ marginRight: 8 }}>{profil?.nom ?? userId}</Text>
                      <Button
                        mode={item.chosenUserId === userId ? "contained" : "outlined"}
                        onPress={() => handleChooseUser(item.$id, userId)}
                        disabled={item.chosenUserId === userId}
                      >
                        {item.chosenUserId === userId ? "Choisi" : "Choisir"}
                      </Button>
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: '#888' }}>Aucune personne n'a encore accepté</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={{ color: '#888', marginTop: 16 }}>Aucune tâche à afficher</Text>
        )}

        {/* Tâches où l'utilisateur connecté a été choisi comme prestataire */}
        <>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 32, marginBottom: 8 }}>Tâches où tu as été choisi comme prestataire :</Text>
          {tachesOuChoisi.length > 0 ? (
            tachesOuChoisi.map((item, idx) => {
              // Chercher le profil du créateur de la tâche
              const profilCreateur = allProfils.find(p => p.User_id === item.User_id);
              return (
                <View key={"chosen-" + idx} style={{ marginBottom: 12, backgroundColor: '#e6ffe6', padding: 8, borderRadius: 8 }}>
                  {/* Affichage du profil du créateur */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    {profilCreateur?.photo_id && (
                      <Image
                        source={{ uri: `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profilCreateur.photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}` }}
                        style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: '#eee' }}
                      />
                    )}
                    <Text style={{ fontWeight: 'bold' }}>
                      {profilCreateur?.nom ? `Proposé par : ${profilCreateur.nom}` : `Proposé par : ${item.User_id}`}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.Title}</Text>
                  <Text>{item.Description}</Text>
                  <Text>{item.Tache}</Text>
                  <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 4 }}>Tu as été choisi comme prestataire !</Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: '#888' }}>Aucune tâche où tu as été choisi pour le moment.</Text>
          )}
        </>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  profileInfo: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 6,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 55,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  age: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
    maxWidth: 200,
  },
  buttonCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 16,
  },
  button: {
    marginBottom: 8,
    minWidth: 120,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 1,
    alignSelf: 'center',
  },
});
