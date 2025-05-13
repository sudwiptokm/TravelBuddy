import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sample data - in a real app, this would come from your storage
const sampleEntries = [
  {
    id: '1',
    title: 'Paris, France',
    date: '2023-10-15',
    coordinates: {
      latitude: 48.8584,
      longitude: 2.2945,
    },
  },
  {
    id: '2',
    title: 'Rome, Italy',
    date: '2023-09-22',
    coordinates: {
      latitude: 41.9028,
      longitude: 12.4964,
    },
  },
  {
    id: '3',
    title: 'Barcelona, Spain',
    date: '2023-08-05',
    coordinates: {
      latitude: 41.3851,
      longitude: 2.1734,
    },
  },
];

export default function MapViewAlternativeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Your Travel Map</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="mb-6 rounded-lg bg-blue-50 p-4">
          <Text className="mb-2 text-center text-lg font-semibold text-blue-600">
            Map View Coming Soon
          </Text>
          <Text className="text-center text-blue-700">
            We&apos;re working on integrating maps. In the meantime, here are your travel locations:
          </Text>
        </View>

        {location && (
          <View className="mb-4 rounded-lg bg-gray-100 p-4">
            <Text className="mb-2 font-bold">Your Current Location</Text>
            <Text>
              Latitude: {location.coords.latitude.toFixed(4)}°, Longitude:{' '}
              {location.coords.longitude.toFixed(4)}°
            </Text>
          </View>
        )}

        <Text className="mb-4 text-lg font-bold">Your Travel Destinations</Text>

        {sampleEntries.map((entry) => (
          <View key={entry.id} className="mb-4 rounded-lg border border-gray-200 p-4">
            <Text className="mb-1 text-lg font-bold">{entry.title}</Text>
            <Text className="mb-2 text-sm text-gray-500">{entry.date}</Text>
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#4b5563" />
              <Text className="ml-1 text-gray-700">
                {entry.coordinates.latitude.toFixed(4)}°, {entry.coordinates.longitude.toFixed(4)}°
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg"
        onPress={() => {
          // Navigate to list view
        }}>
        <Ionicons name="list" size={24} color="#2563eb" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
