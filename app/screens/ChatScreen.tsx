import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sample data - in a real app, this would come from your backend
const sampleMessages = [
  {
    id: '1',
    text: 'Hi there! I saw you visited Paris recently.',
    sender: 'other',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    text: 'Yes! It was amazing. The Eiffel Tower was spectacular!',
    sender: 'me',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '3',
    text: 'Did you visit the Louvre Museum?',
    sender: 'other',
    timestamp: new Date(Date.now() - 3400000).toISOString(),
  },
  {
    id: '4',
    text: 'Yes, spent almost a full day there. The Mona Lisa was smaller than I expected though!',
    sender: 'me',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
  },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const renderMessage = ({
    item,
  }: {
    item: { id: string; text: string; sender: string; timestamp: string };
  }) => {
    const isMe = item.sender === 'me';

    return (
      <View className={`mb-2 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View className={`rounded-2xl p-3 ${isMe ? 'bg-blue-600' : 'bg-gray-200'}`}>
          <Text className={isMe ? 'text-white' : 'text-black'}>{item.text}</Text>
        </View>
        <Text className="mt-1 text-xs text-gray-500">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View className="mr-2 h-10 w-10 rounded-full bg-gray-300" />
          <Text className="text-lg font-bold">Travel Buddy</Text>
        </View>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <FlatList
        className="flex-1 p-4"
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-row items-center border-t border-gray-200 p-2">
          <TouchableOpacity className="mr-2 p-2">
            <Ionicons name="camera-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 rounded-full bg-gray-100 px-4 py-2"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity
            className="ml-2 rounded-full bg-blue-600 p-2"
            onPress={sendMessage}
            disabled={newMessage.trim() === ''}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
