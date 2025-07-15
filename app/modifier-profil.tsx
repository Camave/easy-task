import { BUCKET_ID, database, DATABASE_ID, USER_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import * as FileSystem from 'expo-file-system'; // Pour obtenir la taille du fichier
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ID, Query, Storage } from "react-native-appwrite";
import { Button, TextInput, useTheme } from "react-native-paper";

import { client } from "@/lib/appwrite";

const storage = new Storage(client);

export default function ModifierProfil() {
  const [nom, setNom] = useState<string>("");
  const [age, setAge] = useState<number>(0);
  const [bio, setBio] = useState<string>("");
  const [error, seterror] = useState<string>("");
  const [profilId, setProfilId] = useState<string | null>(null); 
  const [image, setImage] = useState<string | null>(null); // Pour l'aperçu local
  const [photoId, setPhotoId] = useState<string | null>(null); // Pour l'ID Appwrite
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const fetchProfil = async () => {
      if (!user) return;
      try {
        const response = await database.listDocuments(
          DATABASE_ID,
          USER_COLLECTION_ID,
          [Query.equal("User_id", user.$id)]
        );
        if (response.documents.length > 0) {
          const profil = response.documents[0];
          setProfilId(profil.$id);
          setNom(profil.nom || "");
          setAge(profil.age || 0);
          setBio(profil.bio || "");
          if (profil.photo_id) {
            setPhotoId(profil.photo_id);
          }
        }
      } catch (error) {
        seterror("Erreur lors du chargement du profil");
      }
    };
    fetchProfil();
  }, [user]);

  // Sélection d'image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!user) return;
    try {
      let uploadedPhotoId = photoId;
      // Si une nouvelle image a été choisie, on l'upload
      if (image && image.startsWith('file://')) {
        const fileName = image.split('/').pop() || 'profile.jpg';
        // On récupère la taille du fichier avec FileSystem
        const fileInfo = await FileSystem.getInfoAsync(image);
        let fileSize = 0;
        if (fileInfo.exists && typeof fileInfo.size === 'number') {
          fileSize = fileInfo.size;
        }
        const file = {
          uri: image,
          type: 'image/jpeg',
          name: fileName,
          size: fileSize,
        };
        const response = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        );
        uploadedPhotoId = response.$id;
        setPhotoId(response.$id);
      }
      if (profilId) {
        await database.updateDocument(
          DATABASE_ID,
          USER_COLLECTION_ID,
          profilId,
          { User_id: user.$id, nom, age, bio, photo_id: uploadedPhotoId }
        );
      } else {
        await database.createDocument(
          DATABASE_ID,
          USER_COLLECTION_ID,
          ID.unique(),
          { User_id: user.$id, nom, age, bio, photo_id: uploadedPhotoId }
        );
      }
      router.back();
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        seterror(error.message);
        return;
      }
      seterror("Erreur lors de la sauvegarde du profil");
    }
  };

  // Générer l'URL d'aperçu si photoId existe
  let photoUrl: string | null = null;
  if (photoId) {
    photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${photoId}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
  }

  return (
    <View>
      <Text style={styles.title}>Crée ou modifie ton profil</Text>
      <Button mode="outlined" onPress={pickImage} style={{ marginBottom: 10 }}>
        Choisir une photo de profil
      </Button>
      {image && (
        <Image source={{ uri: image }} style={styles.avatar} />
      )}
      {!image && photoUrl && (
        <Image source={{ uri: photoUrl }} style={styles.avatar} />
      )}
      <TextInput
        label="Nom"
        value={nom}
        onChangeText={setNom}
      />
      <TextInput
        label="Age"
        value={age ? age.toString() : ""}
        keyboardType="numeric"
        onChangeText={(text) => setAge(Number(text) || 0)}
      />
      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
      />
      <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 10 }}>
        {profilId ? "Modifier le profil" : "Créer le profil"}
      </Button>
      {error && <Text style={{ color: theme.colors.error }}> {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
});