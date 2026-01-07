
import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';
import QuickCrypto from 'react-native-quick-crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;

export class EncryptionService {
  // Holt den Master-Key oder erstellt ihn (Hardware-gesichert)
  static async getMasterKey(): Promise<Buffer> {
    let key = await SecureStore.getItemAsync('master_key');
    if (!key) {
      key = QuickCrypto.randomBytes(KEY_LENGTH).toString('hex');
      await SecureStore.setItemAsync('master_key', key);
    }
    return Buffer.from(key, 'hex');
  }

  static encrypt(text: string, key: Buffer): { content: string; iv: string } {
    const iv = QuickCrypto.randomBytes(IV_LENGTH);
    const cipher = QuickCrypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      content: encrypted + authTag,
      iv: Buffer.from(iv).toString('hex')
    };
  }

  static decrypt(encryptedData: string, ivHex: string, key: Buffer): string {
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = encryptedData.slice(0, -32);
    const authTag = Buffer.from(encryptedData.slice(-32), 'hex');

    const decipher = QuickCrypto.createDecipheriv(ALGORITHM, key, iv);
    debugger
    //@ts-ignore
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}