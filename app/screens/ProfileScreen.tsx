import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUsername(data.username || '');
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;

    try {
      setSaving(true);

      // Extract filename from URI
      const fileName = uri.split('/').pop() || '';
      const fileExt = fileName.split('.').pop() || 'jpg';
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, await fetch(uri).then((r) => r.blob()));

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('profiles').getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required.');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading profile...</Text>
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
        <Text className="text-xl font-bold">Profile</Text>
        <TouchableOpacity className="p-2" onPress={saveProfile} disabled={saving}>
          <Text className={`font-bold ${saving ? 'text-gray-400' : 'text-blue-600'}`}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        <View className="mb-6 items-center">
          <TouchableOpacity onPress={pickImage}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="h-24 w-24 rounded-full" />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-300">
                <Text className="text-2xl font-bold text-white">
                  {username ? username.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-blue-600">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="mb-1 font-bold text-gray-700">Username</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-gray-50 p-4"
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 font-bold text-gray-700">Full Name</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-gray-50 p-4"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name (optional)"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 font-bold text-gray-700">Email</Text>
          <View className="rounded-lg border border-gray-300 bg-gray-100 p-4">
            <Text className="text-gray-500">{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity className="mt-auto rounded-lg bg-red-500 p-4" onPress={handleSignOut}>
          <Text className="text-center font-bold text-white">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
