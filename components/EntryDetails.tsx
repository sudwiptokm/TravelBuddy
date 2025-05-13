import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelEntry, getEntryById } from '../app/utils/storage';

// Define the route param types
type RootStackParamList = {
  EntryDetail: { entryId: string };
};

type EntryDetailRouteProp = RouteProp<RootStackParamList, 'EntryDetail'>;

export default function EntryDetail() {
  const navigation = useNavigation();
  const route = useRoute<EntryDetailRouteProp>();
  const { entryId } = route.params;
  const [entry, setEntry] = useState<TravelEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      setLoading(true);
      try {
        const travelEntry = await getEntryById(entryId);
        setEntry(travelEntry);
      } catch (error) {
        console.error('Error loading entry:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [entryId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
          <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Travel Memory</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading travel memory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
          <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Travel Memory</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-500">
            Could not find this travel memory. It may have been deleted.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Travel Memory</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1">
        {/* Image Gallery */}
        <ScrollView horizontal pagingEnabled className="h-64 w-full">
          {entry.images.length > 0 ? (
            entry.images.map((uri, index) => (
              <Image key={index} source={{ uri }} className="h-64 w-screen" resizeMode="cover" />
            ))
          ) : (
            <View className="h-64 w-screen items-center justify-center bg-gray-200">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
              <Text className="mt-2 text-gray-500">No images available</Text>
            </View>
          )}
        </ScrollView>

        {/* Content */}
        <View className="p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold">{entry.title}</Text>
            <Text className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</Text>
          </View>

          <View className="mb-4 flex-row items-center">
            <Ionicons name="location" size={20} color="#4b5563" />
            <Text className="ml-1 text-gray-700">{entry.location.name}</Text>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg font-semibold">Description</Text>
            <Text className="text-gray-700">{entry.description}</Text>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg font-semibold">Location Details</Text>
            <View className="rounded-lg bg-gray-100 p-3">
              <Text className="text-gray-700">
                Latitude: {entry.location.coordinates.latitude.toFixed(4)}°
              </Text>
              <Text className="text-gray-700">
                Longitude: {entry.location.coordinates.longitude.toFixed(4)}°
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
