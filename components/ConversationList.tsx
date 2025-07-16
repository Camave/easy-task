// components/ConversationsList.tsx
import { database, DATABASE_ID, USER_COLLECTION_ID } from '@/lib/appwrite';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { useConversations } from '../hooks/useMessaging';
import type { Conversation, User_P } from '../type/database.type';

interface ConversationsListProps {
  currentUserId: string;
  onConversationSelect: (conversation: Conversation) => void;
}

// Ajoute un cache local pour éviter de recharger plusieurs fois le même nom et la photo
const participantCache: Record<string, { nom: string; photo_id?: string }> = {};

const ConversationsList: React.FC<ConversationsListProps> = ({ 
  currentUserId, 
  onConversationSelect 
}) => {
  const { conversations, loading, error } = useConversations(currentUserId);
  const [participantData, setParticipantData] = useState<Record<string, { nom: string; photo_id?: string }>>({});

  useEffect(() => {
    const fetchData = async () => {
      const newData: Record<string, { nom: string; photo_id?: string }> = { ...participantData };
      for (const conv of conversations) {
        const otherId = conv.participants.find(p => p !== currentUserId);
        if (otherId && !newData[otherId]) {
          if (participantCache[otherId]) {
            newData[otherId] = participantCache[otherId];
          } else {
            try {
              const response = await database.listDocuments(
                DATABASE_ID,
                USER_COLLECTION_ID,
                [Query.equal('User_id', otherId)]
              );
              const profil = response.documents[0] as User_P | undefined;
              const nom = profil?.nom || 'Utilisateur inconnu';
              const photo_id = profil?.photo_id;
              newData[otherId] = { nom, photo_id };
              participantCache[otherId] = { nom, photo_id };
            } catch {
              newData[otherId] = { nom: 'Utilisateur inconnu' };
            }
          }
        }
      }
      setParticipantData(newData);
    };
    if (conversations.length > 0) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, currentUserId]);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const renderConversation: ListRenderItem<Conversation> = ({ item }) => {
    const otherId = item.participants.find(p => p !== currentUserId);
    const data = otherId && participantData[otherId] ? participantData[otherId] : { nom: 'Utilisateur inconnu' };
    let photoUrl: string | null = null;
    if (data.photo_id) {
      photoUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${data.photo_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    }
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => onConversationSelect(item)}
      >
        <View style={styles.avatarContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
        <View style={styles.conversationInfo}>
          <Text style={styles.participantName}>
            {data.nom}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Aucun message'}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {formatTime(item.lastMessageTime)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ddd',
  },
  conversationInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default ConversationsList;