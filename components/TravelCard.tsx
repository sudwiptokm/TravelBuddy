import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type TravelCardProps = {
  title: string;
  date: string;
  description: string;
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

export const TravelCard = ({
  title,
  date,
  description,
  location,
  imageUri,
  onPress,
}: TravelCardProps) => {
  return (
    <TouchableOpacity
      className="mb-4 overflow-hidden rounded-lg bg-white shadow-md"
      onPress={onPress}>
      <View className="h-48 bg-gray-300">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#9ca3af" />
          </View>
        )}
      </View>
      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold">{title}</Text>
          <Text className="text-sm text-gray-500">{date}</Text>
        </View>
        <Text className="mb-2 text-gray-700" numberOfLines={2}>
          {description}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="location" size={16} color="#4b5563" />
          <Text className="ml-1 text-sm text-gray-500">{location.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
