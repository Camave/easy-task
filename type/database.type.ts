import { Models } from "react-native-appwrite";

export interface Tache extends Models.Document{
    User_id: string,
    Title: string,
    Description: string,
    Tache: string,
    Task_count : number,
    Last_completed: string,
    created_at: string,
}