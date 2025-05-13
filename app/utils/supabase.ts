import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://lxuzbjbndlnhpbrlcxql.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dXpiamJuZGxuaHBicmxjeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTM5NzksImV4cCI6MjA2MjY2OTk3OX0.u08coWnqFM_zvduhaG2wM-rwV4h-7H4fsQ1p6HirfzY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
