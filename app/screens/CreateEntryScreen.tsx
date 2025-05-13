import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEntryScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need location permissions to make this work!');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    // Get location name from coordinates
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const locationString = [address.city, address.region, address.country]
          .filter(Boolean)
          .join(', ');

        setLocationName(locationString);
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }
  };

  const saveEntry = async () => {
    setIsSaving(true);
    try {
      // Implement the save functionality directly here instead of importing
      const STORAGE_KEY = 'travel_entries';

      // Format the entry
      const entry = {
        title,
        description,
        date: new Date().toISOString(),
        location: {
          name: locationName,
          coordinates: location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : {
                latitude: 0,
                longitude: 0,
              },
        },
        images,
      };

      // Create new entry with ID
      const newEntry = {
        ...entry,
        id: Date.now().toString(),
      };

      // Get existing entries
      const existingEntriesJSON = await AsyncStorage.getItem(STORAGE_KEY);
      const existingEntries = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];

      // Save updated entries
      const updatedEntries = [newEntry, ...existingEntries];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));

      // Show success message
      alert('Entry saved successfully!');

      // Navigate back to the home screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Travel Entry</Text>
        <TouchableOpacity
          className="p-2"
          onPress={saveEntry}
          disabled={!title || !description || isSaving}>
          <Text
            className={`font-bold ${!title || !description || isSaving ? 'text-gray-400' : 'text-blue-600'}`}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <TextInput
          className="mb-4 border-b border-gray-200 p-2 text-xl font-bold"
          placeholder="Title your experience"
          value={title}
          onChangeText={setTitle}
        />

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Photos</Text>
            <View className="flex-row">
              <TouchableOpacity className="mr-2 rounded-full bg-blue-600 p-2" onPress={takePhoto}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="rounded-full bg-blue-600 p-2" onPress={pickImage}>
                <Ionicons name="image" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {images.map((uri, index) => (
              <View key={index} className="relative mr-2">
                <Image source={{ uri }} className="h-24 w-24 rounded-md" />
                <TouchableOpacity
                  className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1"
                  onPress={() => setImages(images.filter((_, i) => i !== index))}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length === 0 && (
              <View className="h-24 w-24 items-center justify-center rounded-md bg-gray-200">
                <Ionicons name="images-outline" size={32} color="#9ca3af" />
              </View>
            )}
          </ScrollView>
        </View>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Location</Text>
            <TouchableOpacity className="rounded-full bg-blue-600 p-2" onPress={getCurrentLocation}>
              <Ionicons name="locate" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {location ? (
            <View className="rounded-md bg-gray-100 p-3">
              <Text className="font-medium">{locationName || 'Selected Location'}</Text>
              <Text className="text-sm text-gray-500">
                {location.coords.latitude.toFixed(4)}°, {location.coords.longitude.toFixed(4)}°
              </Text>
            </View>
          ) : (
            <TouchableOpacity className="rounded-md bg-gray-100 p-3" onPress={getCurrentLocation}>
              <Text className="text-gray-500">Tap to add location</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-lg font-semibold">Notes</Text>
          <TextInput
            className="min-h-[120px] rounded-md bg-gray-100 p-3 text-base"
            placeholder="Write about your experience..."
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
