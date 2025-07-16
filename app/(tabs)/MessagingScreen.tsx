// screens/MessagingScreen.tsx
import ChatScreen from '@/app/ChatScreen';
import ConversationsList from '@/components/ConversationList';
import { account, database, DATABASE_ID, USER_COLLECTION_ID } from '@/lib/appwrite';
import { MessagingService } from '@/service/messagingService';
import type { Conversation, User_P } from '@/type/database.type';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-native-appwrite';

const MessagingScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const initialConversationId = params.conversationId as string | undefined;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User_P | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [otherParticipantName, setOtherParticipantName] = useState<string>('Utilisateur inconnu');

  useEffect(() => {
    getCurrentUser();
  }, []);

  // Si un conversationId est passé, charge la conversation correspondante
  useEffect(() => {
    const fetchConversation = async () => {
      if (initialConversationId && currentUser) {
        try {
          const conversations = await MessagingService.getConversations(currentUser.$id);
          const conv = conversations.find(c => c.$id === initialConversationId);
          if (conv) setSelectedConversation(conv);
        } catch (err) {
          // ignore si pas trouvé
        }
      }
    };
    fetchConversation();
  }, [initialConversationId, currentUser]);

  // Ajoute un effet qui se déclenche à chaque fois que selectedConversation ou currentUser change
  useEffect(() => {
    const fetchOtherParticipantName = async () => {
      if (selectedConversation && currentUser) {
        const otherId = selectedConversation.participants.find(p => p !== currentUser.$id);
        if (otherId) {
          try {
            const response = await database.listDocuments(
              DATABASE_ID,
              USER_COLLECTION_ID,
              [Query.equal('User_id', otherId)]
            );
            const profil = response.documents[0] as User_P | undefined;
            setOtherParticipantName(profil?.nom || 'Utilisateur inconnu');
          } catch {
            setOtherParticipantName('Utilisateur inconnu');
          }
        }
      }
    };
    fetchOtherParticipantName();
  }, [selectedConversation, currentUser]);

  const getCurrentUser = async (): Promise<void> => {
    try {
      // 1. Récupère l'utilisateur natif Appwrite
      const user = await account.get();
      // 2. Récupère le profil User_P dans ta base de données
      let userProfile: User_P | null = null;
      try {
        userProfile = await database.getDocument(
          DATABASE_ID,
          USER_COLLECTION_ID,
          user.$id
        ) as User_P;
        setCurrentUser(userProfile);
        setError(null);
      } catch (err: any) {
        // Gestion de l'erreur si le document n'existe pas
        if (err && err.message && err.message.includes('could not be found')) {
          setError("Profil utilisateur introuvable. Veuillez contacter l'administrateur ou compléter votre inscription.");
          setCurrentUser(null);
        } else {
          throw err;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setCurrentUser(null);
      console.error('Erreur récupération utilisateur:', err);
      // Rediriger vers l'écran de connexion
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation): void => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = (): void => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Utilisateur non connecté'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {selectedConversation ? (
        <ChatScreen
          conversation={selectedConversation}
          currentUserId={currentUser.$id}
          onBack={handleBackToConversations}
          otherParticipantName={otherParticipantName}
        />
      ) : (
        <ConversationsList
          currentUserId={currentUser.$id}
          onConversationSelect={handleConversationSelect}
        />
      )}
    </SafeAreaView>
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
    textAlign: 'center',
  },
});

export default MessagingScreen;