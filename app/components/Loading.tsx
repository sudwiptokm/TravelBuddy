import { ActivityIndicator, Text, View } from 'react-native';

type LoadingProps = {
  message?: string;
};

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-4 text-gray-500">{message}</Text>
    </View>
  );
}
