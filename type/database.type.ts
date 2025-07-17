import { Models } from "react-native-appwrite";

export interface Tache extends Models.Document{
    User_id: string,
    Title: string,
    Description: string,
    Tache: string,
    Ville:string,
    latitude: number,
    longitude: number,
    Task_count : number,
    Last_completed: string,
    created_at: string,
    acceptedBy?: string[];
    chosenUserId?: string | null;
    dateExecution?: string;
}

export interface User_P extends Models.Document{
    nom : string,
    age : number,
    bio:string,
    User_id: string, 
    photo_id:string,
}

export interface Message extends Models.Document{
    $id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
    $createdAt: string;
    $updatedAt: string;
  }
  
export interface Conversation extends Models.Document{
    $id: string;
    participants: string[];
    lastMessage: string;
    lastMessageTime: string;
    createdAt: string;
    $createdAt: string;
    $updatedAt: string;
}
