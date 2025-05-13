import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { TravelCard } from '../../components/TravelCard';
import { TravelEntry, getEntries } from '../utils/storage';

// Define the navigation param types
type RootStackParamList = {
  Main: undefined;
  CreateEntry: undefined;
  Chat: undefined;
  EntryDetail: { entryId: string };
  Conversations: undefined;
  Profile: undefined;
};

type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        const fetchedEntries = await getEntries();
        setEntries(fetchedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();

    // Refresh when screen is focused
    const unsubscribe = navigation.addListener('focus', loadEntries);
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <Text className="text-2xl font-bold text-blue-600">TravelBuddy</Text>
        <View className="flex-row">
          <TouchableOpacity
            className="mr-2 p-2"
            onPress={() => navigation.navigate('Conversations')}>
            <Ionicons name="chatbubbles-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="mb-4 text-xl font-bold">Your Travel Experiences</Text>

          {loading ? (
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">Loading your travel memories...</Text>
            </View>
          ) : entries.length === 0 ? (
            <View className="items-center justify-center rounded-lg bg-gray-100 p-8">
              <Ionicons name="airplane-outline" size={48} color="#9ca3af" />
              <Text className="mt-4 text-center text-gray-500">
                No travel memories yet. Tap the + button to add your first adventure!
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <TravelCard
                key={entry.id}
                title={entry.title}
                date={new Date(entry.date).toLocaleDateString()}
                description={entry.description}
                location={{
                  name: entry.location.name,
                  coordinates: entry.location.coordinates,
                }}
                imageUri={entry.images.length > 0 ? entry.images[0] : undefined}
                onPress={() => {
                  navigation.navigate('EntryDetail', { entryId: entry.id });
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg"
        onPress={() => navigation.navigate('CreateEntry')}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
