import { database, DATABASE_ID, TASK_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, Menu, Text, TextInput, useTheme } from "react-native-paper";

const DiftTask = ["jardinage", "babysitting", "repassage", "nettoyage", "cours de musique", "cours de danse", "autre"] as const;
type DiftTask = (typeof DiftTask)[number];

export default function Index() {
    const [Title, setTitle] = useState<string>("");
    const [Description, setDescription] = useState<string>("");
    const [Tache, setTache] = useState<DiftTask>("jardinage");
    const [customTache, setCustomTache] = useState<string>("");
    const [error, seterror] = useState<string>("");
    const {user} = useAuth();
    const router = useRouter();
    const theme = useTheme();
    
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const [taskLatitude, setTaskLatitude] = useState<number | null>(null);
    const [taskLongitude, setTaskLongitude] = useState<number | null>(null);

    const [dateExecution, setDateExecution] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const handleAddLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission de localisation refusée');
          return;
        }
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        setTaskLatitude(location.coords.latitude);
        setTaskLongitude(location.coords.longitude);
        setErrorMsg("");
      } catch (e) {
        setErrorMsg('Erreur lors de la récupération de la position');
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
                    Tache: Tache === "autre" ? customTache : Tache,
                    latitude: taskLatitude,
                    longitude: taskLongitude,
                    Task_count : 0,
                    Last_completed: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    acceptedBy: [],
                    chosenUserId: null,
                    dateExecution: dateExecution ? dateExecution.toISOString() : null,
                    status: "en cours",
                    rating: null,
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
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}
                style={{ borderWidth: 2, borderColor: '#3372DE', backgroundColor: '#E9ECF2' }}
                labelStyle={{ fontWeight: 'bold', color: '#3372DE', fontSize: 16 }}
                icon={() => (
                  <MaterialCommunityIcons name="chevron-down" size={22} color="#3372DE" style={{ marginLeft: 8 }} />
                )}
              >
                {Tache === "autre" ? (customTache ? customTache : "Autre") : Tache}
              </Button>
            }
          >
            {DiftTask.map((task) => (
              <Menu.Item
                key={task}
                onPress={() => {
                  setTache(task);
                  setMenuVisible(false);
                }}
                title={task.charAt(0).toUpperCase() + task.slice(1)}
              />
            ))}
          </Menu>
        </View>
        {Tache === "autre" && (
          <TextInput
            label="Précise ta tâche"
            value={customTache}
            onChangeText={setCustomTache}
            style={style.text}
          />
        )}
        <Button
        mode="outlined"
        onPress={handleAddLocation}
        style={{ marginTop: 10, marginBottom: 18 }}
      >
        Utiliser ma position actuelle
      </Button>
        {errorMsg ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errorMsg}</Text> : null}
        <View style={{ marginBottom: 16 }}>
          <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
            {dateExecution ? `Date choisie : ${dateExecution.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Choisir date et heure'}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={dateExecution || new Date()}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateExecution(selectedDate);
              }}
            />
          )}
        </View>
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
