import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserItem from '../components/UserItem';
import { Profile, getOrCreateConversation, getUsers } from '../utils/chat';

// Add this type definition for your navigation
type RootStackParamList = {
  Chat: {
    conversationId: string;
    recipientName: string;
    recipientAvatar: string | null;
  };
};

export default function UsersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            (user.username && user.username.toLowerCase().includes(query)) ||
            (user.full_name && user.full_name.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, users]);

  const renderUser = ({ item }: { item: Profile }) => {
    return (
      <UserItem
        user={item}
        onPress={async () => {
          try {
            const conversationId = await getOrCreateConversation(item.id);
            navigation.navigate('Chat', {
              conversationId,
              recipientName: item.full_name || item.username,
              recipientAvatar: item.avatar_url,
            });
          } catch (error) {
            console.error('Error starting conversation:', error);
            Alert.alert('Error', 'Failed to start conversation. Please try again.');
          }
        }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Find Travelers</Text>
        <View className="w-10" />
      </View>

      <View className="border-b border-gray-200 p-4">
        <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1"
            placeholder="Search by name or username"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="people-outline" size={48} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-500">
            No users found. Try a different search term.
          </Text>
        </View>
      ) : (
        <FlatList data={filteredUsers} renderItem={renderUser} keyExtractor={(item) => item.id} />
      )}
    </SafeAreaView>
  );
}
