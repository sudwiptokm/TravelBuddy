import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MessageBubble from '../components/MessageBubble';
import {
  Message,
  getMessages,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from '../utils/chat';
import { supabase } from '../utils/supabase';

type ChatScreenParams = {
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string;
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as ChatScreenParams;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState<{
    name: string;
    avatar?: string;
  }>({
    name: params?.recipientName || 'Travel Buddy',
    avatar: params?.recipientAvatar,
  });

  const flatListRef = useRef<FlatList>(null);
  const { conversationId } = params;

  const [user, setUser] = useState<User | null>(null);

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  }

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    // Load messages
    const loadMessages = async () => {
      setLoading(true);
      try {
        const fetchedMessages = await getMessages(conversationId);
        setMessages(fetchedMessages);

        // Mark messages as read
        await markMessagesAsRead(conversationId);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Mark as read if the app is open
      if (newMessage.sender_id !== user?.id) {
        markMessagesAsRead(conversationId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      await sendMessage(conversationId, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === user?.id;

    return <MessageBubble message={item} isCurrentUser={isCurrentUser} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          {recipient.avatar ? (
            <Image source={{ uri: recipient.avatar }} className="mr-2 h-10 w-10 rounded-full" />
          ) : (
            <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <Text className="font-bold text-white">{recipient.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text className="text-lg font-bold">{recipient.name}</Text>
        </View>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          className="flex-1 p-4"
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-row items-center border-t border-gray-200 p-2">
          <TextInput
            className="flex-1 rounded-full bg-gray-100 px-4 py-2"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity
            className="ml-2 rounded-full bg-blue-600 p-2"
            onPress={handleSendMessage}
            disabled={newMessage.trim() === ''}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
