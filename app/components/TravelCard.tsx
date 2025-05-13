import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type TravelCardProps = {
  title: string;
  date: string;
  description?: string;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  imageUri?: string;
  onPress: () => void;
};

export default function TravelCard({
  title,
  date,
  description,
  location,
  imageUri,
  onPress,
}: TravelCardProps) {
  return (
    <TouchableOpacity
      className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      onPress={onPress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="h-48 w-full" resizeMode="cover" />
      ) : (
        <View className="h-48 w-full items-center justify-center bg-gray-200">
          <Ionicons name="image-outline" size={32} color="#9ca3af" />
        </View>
      )}

      <View className="p-4">
        <Text className="text-lg font-bold">{title}</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#9ca3af" />
            <Text className="ml-1 text-gray-500">{location.name}</Text>
          </View>
          <Text className="text-gray-500">{date}</Text>
        </View>
        {description && (
          <Text className="mt-2 text-gray-700" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
