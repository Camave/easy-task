import { database, DATABASE_ID, TASK_COLLECTION_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache, User_P } from "@/type/database.type";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";

import { useState } from "react";

import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Button } from "react-native-paper";

export default function Profil() {
  const { signOut, user } = useAuth();
  const [tache, setTache] = useState<Tache[]>();
  const [User_profil, setUser_profil] = useState<User_P[]>([])

  const router = useRouter(); 

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      fetchProfils();
    }, [user])
  );

  const fetchHabits =async () => {
    try{
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        [Query.equal("User_id", user?.$id ?? "")]
      );
      setTache(response.documents as Tache[])
    } catch (error) {
      console.error(error)
    }
  }

  const fetchProfils = async () => {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID
      );
      setUser_profil(response.documents as User_P[]);
    } catch (error) {
      console.error(error);
    }
  };

  let photoUrl: string | null = null;
  if (User_profil[0]?.photo_id) {
    photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${User_profil[0].photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
  }

  return (
    <View style={styles.page}>
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
        {tache && tache.length > 0 ? (
          tache.map((item, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.Title}</Text>
              <Text>{item.Description}</Text>
              <Text>{item.Tache}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#888', marginTop: 16 }}>Aucune tâche à afficher</Text>
        )}
      </View>
    </View>
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
