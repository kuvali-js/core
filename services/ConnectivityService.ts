import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase/supabase';

export const ConnectivityService = {
  // check internet connectivity of the device
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!state.isConnected;
  },

  // check Supabase server is reachable
  async isSupabaseReachable(): Promise<boolean> {
    try {
      // just a small request
      const { error } = await supabase.from('encrypted_records').select('id').limit(1);

      // 'FetchError' -> server offline.
      // 'PGRST116' (no data found) -> success, server answers
      if (error && error.message.includes('fetch')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // synchronisation check
  async canSync(): Promise<boolean> {
    const online = await this.isConnected();
    if (!online) return false;
    return await this.isSupabaseReachable();
  }
};