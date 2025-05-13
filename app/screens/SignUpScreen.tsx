import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);

      // Create profile after signup
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .insert([{ id: user.id, username, full_name: username }]);

        if (error) throw error;
      }

      Alert.alert('Success', 'Account created! Please check your email to confirm your account.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center p-8">
        <Text className="mb-8 text-center text-3xl font-bold text-blue-600">Join TravelBuddy</Text>

        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className={`mb-4 rounded-lg p-4 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={handleSignUp}
          disabled={loading}>
          <Text className="text-center font-bold text-white">
            {loading ? 'Creating account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-center text-blue-600">Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
