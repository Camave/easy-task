// hooks/useMessaging.ts
import { useEffect, useState } from 'react';
import { client, CONVERSATIONS_COLLECTION_ID, DATABASE_ID, MESSAGES_COLLECTION_ID } from '../lib/appwrite';
import { MessagingService } from '../service/messagingService';
import type { Conversation, Message } from '../type/database.type';


interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useMessages = (conversationId: string, currentUserId: string): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    
    loadMessages();
    const unsubscribe = setupRealtimeUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId]);

  const loadMessages = async (): Promise<void> => {
    try {
      setLoading(true);
      const msgs = await MessagingService.getMessages(conversationId);
      setMessages(msgs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur chargement messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newMsg = response.payload as Message;
          if (newMsg.conversationId === conversationId) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      }
    );

    return () => unsubscribe();
  };

  const sendMessage = async (content: string): Promise<void> => {
    try {
      await MessagingService.sendMessage(conversationId, currentUserId, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: loadMessages
  };
};

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  createConversation: (participants: string[]) => Promise<Conversation>;
  refetch: () => Promise<void>;
}

export const useConversations = (userId: string): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    loadConversations();
    const unsubscribe = setupRealtimeUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const loadConversations = async (): Promise<void> => {
    try {
      setLoading(true);
      const convs = await MessagingService.getConversations(userId);
      setConversations(convs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur chargement conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${CONVERSATIONS_COLLECTION_ID}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          loadConversations();
        }
      }
    );

    return () => unsubscribe();
  };

  const createConversation = async (participants: string[]): Promise<Conversation> => {
    try {
      const newConv = await MessagingService.createConversation(participants);
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    conversations,
    loading,
    error,
    createConversation,
    refetch: loadConversations
  };
};