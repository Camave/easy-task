// screens/ChatScreen.tsx
import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { useMessages } from '../hooks/useMessaging';
import type { Conversation, Message } from '../type/database.type';

interface ChatScreenProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
  otherParticipantName?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ 
  conversation, 
  currentUserId, 
  onBack,
  otherParticipantName
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const flatListRef = useRef<FlatList<Message>>(null);

  // Utilisation du hook personnalisé
  const { messages, loading, error, sendMessage } = useMessages(conversation.$id, currentUserId);

  const handleSendMessage = async (): Promise<void> => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      
      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isMyMessage = item.senderId === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des messages...</Text>
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherParticipantName || 'Utilisateur inconnu'}</Text>
      </View>

      {/* Messages */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.$id}
          style={styles.messagesList}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="always"
        />
      </View>

      {/* Input */}
      <SafeAreaViewRN edges={['bottom']} style={{ backgroundColor: '#fff' }}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Tapez votre message..."
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaViewRN>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 5,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  myMessageTime: {
    color: '#B3D9FF',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;