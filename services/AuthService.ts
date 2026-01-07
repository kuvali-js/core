import { supabase } from '../lib/supabase/supabase';

export const AuthService = {
  async sendSMS(phoneNumber: string) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) throw error;
    return true;
  },

  async verifySMS(phoneNumber: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: token,
      type: 'sms',
    });
    if (error) throw error;
    return data.session;
  },

  // Ends the current session
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};