// core/services/IdentityService.ts
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as Sentry from '@sentry/react-native';
import { supabase } from '../lib/supabase/supabase';

const SECURE_USER_ID_KEY = 'auth_user_id';

class IdentityService {
  private cachedUserId: string | null = null;
  private isInitializing = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      // 1. Aus SecureStore laden
      let id = await SecureStore.getItemAsync(SECURE_USER_ID_KEY);

      // 2. Fallback auf Supabase Session
      if (!id) {
        const { data } = await supabase.auth.getSession();
        id = data.session?.user?.id ?? null;
      }

      // 3. Fallback auf neue anonyme ID
      if (!id) {
        id = `anon-${Crypto.randomUUID()}`;
      }

      await this.setUserId(id);
    } catch (error) {
      console.error('[IdentityService] Initialization failed', error);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Setzt die UserID global (Speicher, Cache, Sentry)
   */
  public async setUserId(id: string | null): Promise<void> {
    this.cachedUserId = id;

    if (id) {
      await SecureStore.setItemAsync(SECURE_USER_ID_KEY, id);
      Sentry.setUser({ id });
    } else {
      await SecureStore.deleteItemAsync(SECURE_USER_ID_KEY);
      Sentry.setUser(null);
    }
  }

  public getUserId(): string | null {
    return this.cachedUserId;
  }
}

export const identityService =  new IdentityService();

