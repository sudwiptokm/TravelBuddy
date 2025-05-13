import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelEntry, deleteEntry, getEntryById } from '../utils/storage';

type EntryDetailParams = {
  entryId: string;
};

export default function EntryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { entryId } = route.params as EntryDetailParams;

  const [entry, setEntry] = useState<TravelEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadEntry = async () => {
      setLoading(true);
      try {
        const fetchedEntry = await getEntryById(entryId);
        setEntry(fetchedEntry);
      } catch (error) {
        console.error('Error loading entry:', error);
        Alert.alert('Error', 'Failed to load travel memory.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [entryId, navigation]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this travel memory? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entryId);
              Alert.alert('Success', 'Travel memory deleted successfully.');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete travel memory.');
            }
          },
        },
      ]
    );
  };

  if (loading || !entry) {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{entry.title}</Text>
        <TouchableOpacity className="p-2" onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Image Gallery */}
        <View className="relative h-64 w-full">
          {entry.images.length > 0 ? (
            <>
              <Image
                source={{ uri: entry.images[currentImageIndex] }}
                className="h-full w-full"
                resizeMode="cover"
              />
              {entry.images.length > 1 && (
                <View className="absolute bottom-4 w-full flex-row justify-center">
                  {entry.images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`mx-1 h-2 w-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                      onPress={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </View>
              )}
              {entry.images.length > 1 && (
                <>
                  <TouchableOpacity
                    className="absolute left-2 top-1/2 -mt-6 h-12 w-12 items-center justify-center rounded-full bg-black bg-opacity-30"
                    onPress={() =>
                      setCurrentImageIndex(
                        (currentImageIndex - 1 + entry.images.length) % entry.images.length
                      )
                    }>
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="absolute right-2 top-1/2 -mt-6 h-12 w-12 items-center justify-center rounded-full bg-black bg-opacity-30"
                    onPress={() =>
                      setCurrentImageIndex((currentImageIndex + 1) % entry.images.length)
                    }>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-200">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
              <Text className="mt-2 text-gray-500">No images available</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold">{entry.title}</Text>
            <Text className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</Text>
          </View>

          <View className="mb-4 flex-row items-center">
            <Ionicons name="location-outline" size={20} color="#9ca3af" />
            <Text className="ml-1 text-gray-700">{entry.location.name}</Text>
          </View>

          {entry.description && <Text className="mb-6 text-gray-700">{entry.description}</Text>}

          {/* Map */}
          <View className="mb-4 overflow-hidden rounded-lg">
            <Text className="mb-2 font-bold text-gray-700">Location</Text>
            <MapView
              className="h-48 w-full"
              initialRegion={{
                latitude: entry.location.coordinates.latitude,
                longitude: entry.location.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}>
              <Marker
                coordinate={{
                  latitude: entry.location.coordinates.latitude,
                  longitude: entry.location.coordinates.longitude,
                }}
                title={entry.title}
                description={entry.location.name}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
