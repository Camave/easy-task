// services/messagingService.ts
import {
    CONVERSATIONS_COLLECTION_ID,
    database,
    DATABASE_ID,
    MESSAGES_COLLECTION_ID,
} from '../lib/appwrite';

import type { Conversation, Message } from '../type/database.type';

import { ID, Query } from 'react-native-appwrite';

  
export class MessagingService {

// Récupérer toutes les conversations d'un utilisateur
static async getConversations(userId: string): Promise<Conversation[]> {
    try {
    const response = await database.listDocuments(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        [
        Query.contains('participants', userId),
        Query.orderDesc('lastMessageTime')
        ]
    );
    return response.documents as Conversation[];
    } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    throw error;
    }
}

// Récupérer les messages d'une conversation
static async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
    const response = await database.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
        Query.equal('conversationId', conversationId),
        Query.orderDesc('timestamp'),
        Query.limit(limit)
        ]
    );
    return (response.documents as Message[]).reverse(); // Inverser pour afficher du plus ancien au plus récent
    } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw error;
    }
}

// Envoyer un message
static async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    try {
    const message = await database.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        'unique()',
        {
        conversationId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        read: false
        }
    );

    // Mettre à jour la conversation avec le dernier message
    await this.updateConversationLastMessage(conversationId, content);
    
    return message as Message;
    } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
    }
}

// Mettre à jour le dernier message d'une conversation
static async updateConversationLastMessage(conversationId: string, lastMessage: string): Promise<void> {
    try {
    await database.updateDocument(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        conversationId,
        {
        lastMessage,
        lastMessageTime: new Date().toISOString()
        }
    );
    } catch (error) {
    console.error('Erreur lors de la mise à jour de la conversation:', error);
    }
}

// Créer une nouvelle conversation
static async createConversation(participants: string[]): Promise<Conversation> {
    try {
    const conversation = await database.createDocument(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        'unique()',
        {
        id: ID.unique(),
        participants,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
        }
    );
    return conversation as Conversation;
    } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    throw error;
    }
}

// Trouver une conversation existante entre deux utilisateurs
static async findConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    try {
    const response = await database.listDocuments(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        [
        Query.contains('participants', userId1),
        Query.contains('participants', userId2)
        ]
    );
    return response.documents.length > 0 ? response.documents[0] as Conversation : null;
    } catch (error) {
    console.error('Erreur lors de la recherche de conversation:', error);
    throw error;
    }
}
}