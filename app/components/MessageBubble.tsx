import { Text, View } from 'react-native';
import { Message } from '../utils/chat';

type MessageBubbleProps = {
  message: Message;
  isCurrentUser: boolean;
};

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      className={`mb-2 max-w-[80%] rounded-lg p-3 ${
        isCurrentUser ? 'self-end bg-blue-600' : 'self-start bg-gray-200'
      }`}>
      <Text className={`${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>{message.content}</Text>
      <Text
        className={`mt-1 text-right text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
        {formattedTime}
      </Text>
    </View>
  );
}
