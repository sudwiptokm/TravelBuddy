import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Conversation } from '../utils/chat';

type ConversationItemProps = {
  conversation: Conversation;
  onPress: () => void;
};

export default function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  // Get the other participant (assuming 1-on-1 chats)
  const otherParticipant = conversation.participants[0];

  // Format the last message time
  const lastMessageTime = conversation.lastMessage
    ? new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Check if the user is online (within the last 5 minutes)
  const isOnline = otherParticipant
    ? new Date().getTime() - new Date(otherParticipant.last_online).getTime() < 5 * 60 * 1000
    : false;

  return (
    <TouchableOpacity className="border-b border-gray-200 p-4" onPress={onPress}>
      <View className="flex-row items-center">
        <View className="relative">
          {otherParticipant?.avatar_url ? (
            <Image
              source={{ uri: otherParticipant.avatar_url }}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-300">
              <Text className="text-lg font-bold text-white">
                {otherParticipant?.username.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {isOnline && (
            <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white bg-green-500" />
          )}
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold">
              {otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
            </Text>
            {lastMessageTime && <Text className="text-xs text-gray-500">{lastMessageTime}</Text>}
          </View>

          {conversation.lastMessage && (
            <Text className="text-gray-500" numberOfLines={1}>
              {conversation.lastMessage.content}
            </Text>
          )}
        </View>

        {conversation.unreadCount > 0 && (
          <View className="ml-2 h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1">
            <Text className="text-xs font-bold text-white">{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
