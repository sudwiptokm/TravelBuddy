import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Profile } from '../utils/chat';

type UserItemProps = {
  user: Profile;
  onPress: () => void;
};

export default function UserItem({ user, onPress }: UserItemProps) {
  // Check if the user is online (within the last 5 minutes)
  const isOnline = new Date().getTime() - new Date(user.last_online).getTime() < 5 * 60 * 1000;

  return (
    <TouchableOpacity className="border-b border-gray-200 p-4" onPress={onPress}>
      <View className="flex-row items-center">
        <View className="relative">
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} className="h-12 w-12 rounded-full" />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-300">
              <Text className="text-lg font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isOnline && (
            <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white bg-green-500" />
          )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-bold">{user.full_name || user.username}</Text>
          <Text className="text-gray-500">@{user.username}</Text>
        </View>

        <Ionicons name="chatbubble-outline" size={20} color="#2563eb" />
      </View>
    </TouchableOpacity>
  );
}
