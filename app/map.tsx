import useLocation from "@/hooks/useLocation";
import { database, DATABASE_ID, TASK_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache } from "@/type/database.type";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import MapView, { Marker } from 'react-native-maps';

const DiftTask = ["jardinage", "babysitting", "repassage", "nettoyage", "cours de musique", "cours de danse"];
type DiftTask = (typeof DiftTask)[number];

export default function map(){
    const [tache, setTache] = useState<Tache[]>();
    const { user } = useAuth()
    const router = useRouter();
    const [selectedTheme, setSelectedTheme] = useState<DiftTask | "all">("all");
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const {latitude, longitude, errorMsg} = useLocation();

    const defaultLat = 48.8566; // Paris
    const defaultLng = 2.3522;

    // Région contrôlée pour MapView
    const [region, setRegion] = useState({
      latitude: latitude ?? defaultLat,
      longitude: longitude ?? defaultLng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

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

    // Filtrer les tâches avec coordonnées valides et thème sélectionné
    const validTasks = tache?.filter(item =>
      item.latitude &&
      item.longitude &&
      (selectedTheme === "all" || item.Tache === selectedTheme)
    ) || [];

    // Met à jour la région quand le filtre ou les tâches changent
    useEffect(() => {
      if (validTasks.length > 0) {
        setRegion({
          latitude: validTasks[0].latitude,
          longitude: validTasks[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else if (latitude && longitude) {
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        setRegion({
          latitude: defaultLat,
          longitude: defaultLng,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        });
      }
    }, [selectedTheme, tache, latitude, longitude]);

    if (!tache || tache.length === 0) {
      return <View />; // ou un loader
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Bouton filtre flottant */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowThemeMenu(true)}
            >
              <MaterialCommunityIcons name="filter-variant" size={28} color="#3372DE" />
            </TouchableOpacity>

            {/* Menu latéral custom */}
            {showThemeMenu && (
              <View style={styles.themeMenu}>
                <Text style={styles.themeMenuTitle}>Filtrer par thème</Text>
                <TouchableOpacity onPress={() => { setSelectedTheme('all'); setShowThemeMenu(false); }}>
                  <Text style={[styles.themeMenuItem, selectedTheme === 'all' && styles.themeMenuItemSelected]}>Tous les thèmes</Text>
                </TouchableOpacity>
                {DiftTask.map(theme => (
                  <TouchableOpacity key={theme} onPress={() => { setSelectedTheme(theme); setShowThemeMenu(false); }}>
                    <Text style={[styles.themeMenuItem, selectedTheme === theme && styles.themeMenuItemSelected]}>{theme}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowThemeMenu(false)} style={styles.themeMenuCloseBtn}>
                  <Text style={styles.themeMenuCloseText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            )}

            {validTasks.length === 0 ? (
              <View style={styles.noTaskContainer}>
                <Text style={styles.noTaskText}>Aucune tâche pour ce thème</Text>
              </View>
            ) : (
              <MapView
                style={styles.map}
                region={region}
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
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    map : {
        flex: 1,
    },
    filterButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        elevation: 4,
    },
    themeMenu: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 200,
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 30,
        elevation: 8,
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    themeMenuTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 16,
        color: '#3372DE',
    },
    themeMenuItem: {
        paddingVertical: 10,
        color: '#222',
    },
    themeMenuItemSelected: {
        color: '#3372DE',
        fontWeight: 'bold',
    },
    themeMenuCloseBtn: {
        marginTop: 24,
    },
    themeMenuCloseText: {
        color: '#888',
        textAlign: 'right',
    },
    noTaskContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noTaskText: {
        color: '#888',
        fontSize: 16,
    },
})