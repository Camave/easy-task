import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache, User_P } from "@/type/database.type";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button } from "react-native-paper";
import StarRating from "react-native-star-rating-widget";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

export default function Profil() {
  const { signOut, user } = useAuth();
  const [tache, setTache] = useState<Tache[]>();
  const [User_profil, setUser_profil] = useState<User_P[]>([]);
  const [allProfils, setAllProfils] = useState<User_P[]>([]);
  const [tachesOuPostule, setTachesOuPostule] = useState<Tache[]>([]);
  const [tachesOuJeSuisChoisi, setTachesOuJeSuisChoisi] = useState<Tache[]>([]);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'demandes', title: 'Mes demandes' },
    { key: 'realiser', title: 'À réaliser' },
  ]);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      fetchProfils();
      fetchAllProfils();
      fetchTachesOuPostule();
      fetchTachesOuJeSuisChoisi(); // Ajout de la récupération des tâches où je suis choisi
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

  const fetchTachesOuPostule = async () => {
    try {
      if (!user) return;
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.contains("acceptedBy", user.$id)]
      );
      setTachesOuPostule(response.documents as Tache[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTachesOuJeSuisChoisi = async () => {
    try {
      if (!user) return;
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.equal("chosenUserId", user.$id)]
      );
      setTachesOuJeSuisChoisi(response.documents as Tache[]);
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

  // Calcul de la moyenne des notes reçues par l'utilisateur connecté
  const tachesNoteesPourMoi = tachesOuJeSuisChoisi.filter(
    (item) => Number(item.rating) > 0
  );
  const moyenne =
    tachesNoteesPourMoi.length > 0
      ? tachesNoteesPourMoi.reduce((acc, curr) => acc + Number(curr.rating), 0) / tachesNoteesPourMoi.length
      : 0;

  // Onglet 1 : Mes demandes
  const DemandesRoute = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>T'es demandes :</Text>
      {tache && tache.length > 0 ? (
        tache.map((item, idx) => (
          <View key={idx} style={{ marginBottom: 12, backgroundColor: '#F2F2F2', padding: 8, borderRadius: 8 }}>
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
            {/* BOUTON MARQUER COMME TERMINÉE */}
            {item.status !== "terminée" && (
              <Button
                mode="contained"
                style={{ marginTop: 8, backgroundColor: '#7EACEF' }}
                onPress={async () => {
                  try {
                    await database.updateDocument(
                      DATABASE_ID,
                      TASK_COLLECTION_ID,
                      item.$id,
                      { status: "terminée" }
                    );
                    fetchHabits();
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Marquer comme terminée
              </Button>
            )}
            {item.status === "terminée" && (
              <Text style={{ color: '#388E3C', fontWeight: 'bold', marginTop: 8 }}>Tâche terminée</Text>
            )}
            {/* SYSTÈME DE NOTATION PAR ÉTOILES */}
            {item.status === "terminée" && item.chosenUserId && (!Number(item.rating) || Number(item.rating) === 0) && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Note le prestataire :</Text>
                <StarRating
                  rating={Number(item.rating) || 0}
                  onChange={async (rating) => {
                    try {
                      await database.updateDocument(
                        DATABASE_ID,
                        TASK_COLLECTION_ID,
                        item.$id,
                        { rating }
                      );
                      fetchHabits();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  starSize={32}
                  color="#FFD700"
                  enableHalfStar={false}
                  maxStars={5}
                />
              </View>
            )}
            {/* Affichage de la note si déjà noté */}
            {item.status === "terminée" && item.chosenUserId && Number(item.rating) > 0 && (
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', marginRight: 8 }}>Note donnée :</Text>
                <StarRating
                  rating={Number(item.rating)}
                  onChange={() => {}}
                  starSize={24}
                  color="#FFD700"
                  enableHalfStar={false}
                  maxStars={5}
                  starStyle={{ pointerEvents: 'none' }}
                />
              </View>
            )}
          </View>
        ))
      ) : (
        <Text style={{ color: '#888', marginTop: 16 }}>Aucune tâche à afficher</Text>
      )}
    </ScrollView>
  );

  // Onglet 2 : À réaliser
  const RealiserRoute = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Tâches où tu as postulé :</Text>
      {tachesOuPostule.length > 0 ? (
        tachesOuPostule.map((item, idx) => {
          // Chercher le profil du créateur de la tâche
          const profilCreateur = allProfils.find(p => p.User_id === item.User_id);
          let statut = '';
          let statutColor = '#888';
          if (item.chosenUserId === user?.$id) {
            statut = 'Accepté';
            statutColor = '#388E3C'; // vert
          } else if (item.chosenUserId && item.chosenUserId !== user?.$id) {
            statut = 'Refusé';
            statutColor = '#d32f2f'; // rouge
          } else {
            statut = 'En attente';
            statutColor = '#888'; // gris
          }
          return (
            <View key={"chosen-" + idx} style={{ marginBottom: 12, backgroundColor: '#F2F2F2', padding: 8, borderRadius: 8 }}>
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
              <Text style={{ fontWeight: 'bold', marginTop: 4, color: statutColor }}>Statut : {statut}</Text>
            </View>
          );
        })
      ) : (
        <Text style={{ color: '#888' }}>Aucune tâche où tu as postulé pour le moment.</Text>
      )}
    </ScrollView>
  );

  const renderScene = SceneMap({
    demandes: DemandesRoute,
    realiser: RealiserRoute,
  });

  return (
    <View style={[styles.page, { flex: 1 }]}> 
      <View style={styles.headerRow}>
        <View style={styles.profileInfo}>
          {photoUrl && (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatar}
            />
          )}
          {/* Ligne nom + moyenne */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={styles.name}>{User_profil[0]?.nom}</Text>
            {tachesNoteesPourMoi.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <MaterialCommunityIcons name="star" size={18} color="#FFD700" style={{ marginRight: 2 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{moyenne.toFixed(2)} / 5</Text>
              </View>
            )}
          </View>
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
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={(props: any) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#000' }}
            style={{ backgroundColor: '#fff' }}
            labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}
            activeColor="#000"
            inactiveColor="#888"
          />
        )}
        style={{ backgroundColor: '#fff', flex: 1, marginTop:-60 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 6,
    marginBottom: 70,
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
