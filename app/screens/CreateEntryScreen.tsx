import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveEntry } from '../utils/storage';

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

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need location permissions to make this work!');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);

    // Get location name
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your travel memory.');
      return;
    }

    if (!location) {
      Alert.alert('Missing Location', 'Please add a location to your travel memory.');
      return;
    }

    setIsSaving(true);
    try {
      await saveEntry({
        title,
        description,
        date: new Date().toISOString(),
        location: {
          name: locationName,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        },
        images,
      });

      Alert.alert('Success', 'Your travel memory has been saved!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your travel memory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Travel Memory</Text>
        <TouchableOpacity className="p-2" onPress={handleSave} disabled={isSaving}>
          <Text className={`font-bold ${isSaving ? 'text-gray-400' : 'text-blue-600'}`}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 text-lg"
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="mb-4 h-32 rounded-lg border border-gray-300 bg-gray-50 p-4"
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <View className="mb-4">
          <Text className="mb-2 font-bold text-gray-700">Location</Text>
          <TouchableOpacity
            className="flex-row items-center rounded-lg border border-gray-300 bg-gray-50 p-4"
            onPress={getLocation}>
            <Ionicons name="location-outline" size={24} color="#9ca3af" />
            <Text className="ml-2 flex-1 text-gray-700">{locationName || 'Add location'}</Text>
            {location && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-bold text-gray-700">Photos</Text>
          <View className="flex-row flex-wrap">
            {images.map((uri, index) => (
              <View key={index} className="relative m-1 h-24 w-24">
                <Image source={{ uri }} className="h-24 w-24 rounded-lg" />
                <TouchableOpacity
                  className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1"
                  onPress={() => removeImage(index)}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="m-1 h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
              onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#9ca3af" />
              <Text className="mt-1 text-xs text-gray-500">Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="m-1 h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
              onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#9ca3af" />
              <Text className="mt-1 text-xs text-gray-500">Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
