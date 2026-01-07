import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// localhost   -> simulator.
// computer-ip -> mobile devices.
// const supabaseUrl = 'http://localhost:54321';
const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing supabase settings in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});