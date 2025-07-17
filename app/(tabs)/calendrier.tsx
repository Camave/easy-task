import { database, DATABASE_ID, TASK_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Tache } from "@/type/database.type";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function Calendrier() {
  const { user } = useAuth();
  const [taches, setTaches] = useState<Tache[]>([]); // acceptées
  const [createdTaches, setCreatedTaches] = useState<Tache[]>([]); // créées
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const fetchTaches = async () => {
      if (!user) return;
      const response = await database.listDocuments(
        DATABASE_ID,
        TASK_COLLECTION_ID,
        []
      );
      const allTaches = response.documents as Tache[];
      // Tâches où tu as été choisi
      const accepted = allTaches.filter(
        t => t.chosenUserId === user.$id && t.dateExecution
      );
      // Tâches que tu as créées
      const created = allTaches.filter(
        t => t.User_id === user.$id && t.dateExecution
      );
      setTaches(accepted);
      setCreatedTaches(created);
    };
    fetchTaches();
  }, [user]);

  // Marquer les dates dans le calendrier
  const markedDates: Record<string, any> = {};
  createdTaches.forEach(t => {
    if (t.dateExecution) {
      const date = t.dateExecution.slice(0, 10);
      markedDates[date] = { marked: true, dots: [{ color: '#4CAF50' }] }; // vert
    }
  });
  taches.forEach(t => {
    if (t.dateExecution) {
      const date = t.dateExecution.slice(0, 10);
      if (markedDates[date] && markedDates[date].dots) {
        // Si déjà marqué (créée + acceptée), on met deux points de couleur
        markedDates[date].dots.push({ color: '#3372DE' });
      } else {
        markedDates[date] = { marked: true, dots: [{ color: '#3372DE' }] }; // bleu
      }
    }
  });

  // Tâches du jour sélectionné (acceptées + créées)
  const tachesDuJour = [
    ...taches.filter(t => t.dateExecution && t.dateExecution.slice(0, 10) === selectedDate),
    ...createdTaches.filter(t => t.dateExecution && t.dateExecution.slice(0, 10) === selectedDate)
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Calendar
        markingType="multi-dot"
        markedDates={{
          ...markedDates,
          [selectedDate]: { ...(markedDates[selectedDate] || {}), selected: true, selectedColor: '#7EACEF' }
        }}
        onDayPress={day => setSelectedDate(day.dateString)}
        theme={{
          todayTextColor: '#3372DE',
          selectedDayBackgroundColor: '#7EACEF',
        }}
      />
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 12 }}>
        Tâches du {new Date(selectedDate).toLocaleDateString('fr-FR')}
      </Text>
      <FlatList
        data={tachesDuJour}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#E9ECF2', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#3372DE' }}>{item.Title}</Text>
            <Text>{item.Description}</Text>
            <Text style={{ color: '#888' }}>
              {item.dateExecution && new Date(item.dateExecution).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center' }}>Aucune tâche ce jour-là</Text>}
      />
    </View>
  );
} 