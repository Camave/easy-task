import useLocation from "@/hooks/useLocation";
import { database, DATABASE_ID, TASK_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

const DiftTask = ["jardinage", "babysitting", "repassage", "nettoyage", "cours de musique", "cours de danse"];
type DiftTask = (typeof DiftTask)[number]

export default function Index() {
    const [Title, setTitle] = useState<string>("");
    const [Description, setDescription] = useState<string>("");
    const [Tache, setTache] = useState<DiftTask>("jardinage");
    const [Ville, setVille] = useState<string>("");
    const [error, seterror] = useState<string>("");
    const {user} = useAuth();
    const router = useRouter();
    const theme = useTheme();
    
    const {latitude, longitude, errorMsg} = useLocation();

    const [taskLatitude, setTaskLatitude] = useState<number | null>(null);
    const [taskLongitude, setTaskLongitude] = useState<number | null>(null);

    const handleAddLocation = () => {
    if (latitude !== null && longitude !== null) {
      setTaskLatitude(latitude);
      setTaskLongitude(longitude);
    }
  };

    const handleSubmit = async () => {
        if (!user) return;
        try{
            await database.createDocument(
                DATABASE_ID, 
                TASK_COLLECTION_ID, 
                ID.unique(),
                {
                    User_id: user.$id,
                    Title,
                    Description,
                    Tache,
                    Ville,
                    latitude: taskLatitude,
                    longitude: taskLongitude,
                    Task_count : 0,
                    Last_completed: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                }
            );

            router.back()
        } catch (error){
            if (error instanceof Error) {
                seterror(error.message );
                return;
            }
            seterror("Erreur lors de la création de la tache")
        }
    };

  return (
    <View style={style.view}>
        <TextInput  
                style={style.text}
                label = "Title" 
                mode = "outlined"
                onChangeText={setTitle}
            />

        <TextInput  
                style={style.text}
                label = "Description" 
                mode = "outlined"
                onChangeText={setDescription}
            />
        <View style = {style.segbuttonscontainer}>
            <SegmentedButtons 
                value={Tache}
                onValueChange={(value) => setTache(value as DiftTask)}
                buttons={DiftTask.map((task)=>({value : task, label:task}))}
                />
        </View>
        <View>
            <TextInput
                style={style.text}
                label = "Ville" 
                mode = "outlined"
                onChangeText={setVille}
                value={Ville}
            />
        </View>
        <Button
        mode="outlined"
        onPress={handleAddLocation}
        style={{ marginTop: 10 }}
      >
        Utiliser ma position actuelle
      </Button>
        <Button mode ="contained" onPress = {handleSubmit} disabled={!Title || !Description}>
            Ajouter la tâche
        </Button>
        {error && <Text style = {{color : theme.colors.error}}> {error}</Text>}
    </View>
  );
}

const style = StyleSheet.create({
    view :{
        flex : 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
        justifyContent : "center"
    },
    text: {
        backgroundColor: "#f5f5f5",
        marginBottom :16,
    },
    segbuttonscontainer:{
        marginBottom: 24,
    },
    
});
