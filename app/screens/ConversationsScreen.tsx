import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationItem from '../components/ConversationItem';
import { Conversation, getConversations, updateOnlineStatus } from '../utils/chat';

// Add this type definition for your navigation
type RootStackParamList = {
  Chat: {
    conversationId: string;
    recipientName: string;
    recipientAvatar: string | null;
  };
  UsersList: undefined;
};

export default function ConversationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        // Update online status
        await updateOnlineStatus();

        // Get conversations
        const fetchedConversations = await getConversations();
        setConversations(fetchedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Refresh when screen is focused
    const unsubscribe = navigation.addListener('focus', loadConversations);
    return unsubscribe;
  }, [navigation]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants[0];

    return (
      <ConversationItem
        conversation={item}
        onPress={() => {
          navigation.navigate('Chat', {
            conversationId: item.id,
            recipientName:
              otherParticipant?.full_name || otherParticipant?.username || 'Unknown User',
            recipientAvatar: otherParticipant?.avatar_url,
          });
        }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <Text className="text-2xl font-bold text-blue-600">Messages</Text>
        <TouchableOpacity className="p-2" onPress={() => navigation.navigate('UsersList')}>
          <Ionicons name="create-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-500">
            No conversations yet. Start chatting with other travelers!
          </Text>
          <TouchableOpacity
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2"
            onPress={() => navigation.navigate('UsersList')}>
            <Text className="font-bold text-white">Find Travelers</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
        />
      )}
    </SafeAreaView>
  );
}
