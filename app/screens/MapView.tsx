import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
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

export default function MapViewScreen() {
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 50,
          longitudeDelta: 50,
        });
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

      <View className="flex-1">
        <MapView
          style={{ width: Dimensions.get('window').width, height: '100%' }}
          region={region}
          onRegionChangeComplete={setRegion}>
          {sampleEntries.map((entry) => (
            <Marker
              key={entry.id}
              coordinate={entry.coordinates}
              title={entry.title}
              pinColor="#2563eb">
              <Callout>
                <View className="w-40 p-2">
                  <Text className="font-bold">{entry.title}</Text>
                  <Text className="text-xs text-gray-500">{entry.date}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        <TouchableOpacity
          className="absolute bottom-6 right-6 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg"
          onPress={() => {
            // Navigate to list view
          }}>
          <Ionicons name="list" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
