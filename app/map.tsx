import useLocation from "@/hooks/useLocation";
import { database, DATABASE_ID, TASK_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache } from "@/type/database.type";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import MapView, { Marker } from 'react-native-maps';

export default function map(){
    const [tache, setTache] = useState<Tache[]>();
    const { user } = useAuth()
    const router = useRouter();

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const response = await database.listDocuments(
                    DATABASE_ID,
                    TASK_COLLECTION_ID,
                    [Query.notEqual("User_id", user?.$id ?? "")]
                );
                setTache(response.documents as Tache[]);
                console.log('Tâches chargées :', response.documents);
            } catch (error) {
                console.error(error);
            }
        };
        fetchHabits();
    }, [user]);
    
    const {latitude, longitude, errorMsg} = useLocation();

    const defaultLat = 48.8566; // Paris
    const defaultLng = 2.3522;

    if (!tache || tache.length === 0) {
      return <View />; // ou un loader
    }
    // Filtrer les tâches avec coordonnées valides
    const validTasks = tache.filter(item => item.latitude && item.longitude);
    if (validTasks.length === 0) {
      return <View />;
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: latitude ?? validTasks[0].latitude,
                    longitude: longitude ?? validTasks[0].longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
            {validTasks.map(item => (
                <Marker
                    key={item.$id}
                    coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                    title={item.Title}
                    description={item.Description}
                    onPress={() => router.push(`/TaskDetailScreen?taskId=${item.$id}`)}
                />
            ))}
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    map : {
        flex: 1,
    }
})