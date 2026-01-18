import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';

export const EncryptionKeyService = {
  // Retrieves or generates a unique 256-bit encryption key for the current user
  async getOrCreateKey(userId: string): Promise<string> {
    const storageKey = `master_key_${userId}`;
    let key = await SecureStore.getItemAsync(storageKey);

    if (!key) {
      // Generate a random 32-byte key (256 bits)
      key = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
      await SecureStore.setItemAsync(storageKey, key);
    }

    return key;
  }
};