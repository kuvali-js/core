// model/EncryptedRecord.ts
import { Model } from '@nozbe/watermelondb';
import { date, text } from '@nozbe/watermelondb/decorators';
import { EncryptionService } from '@/services/EncryptionService';

export default class EncryptedRecord extends Model {
  static table = 'encrypted_records';

  @text('encrypted_data') encrypted_data!: string;
  @text('category') category!: string;
  @text('initialization_vector') initialization_vector!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  /* ### encrypts the data and saves it to WatermelonDB */
  async setEncryptedData(data: object) {
    const stringData = JSON.stringify(data);
    const key = await EncryptionService.getMasterKey();
    const encrypted = EncryptionService.encrypt(stringData, key);

    await this.update(() => {
      this.encrypted_data = encrypted.content;
      this.initialization_vector = encrypted.iv;
    });
  }

  /* ### returns decryped record */
  async getDecryptedData(): Promise<any> {
    const key = await EncryptionService.getMasterKey();
    const decrypted = EncryptionService.decrypt(this.encrypted_data, this.initialization_vector, key);
    return JSON.parse(decrypted);
  }
}

//### END #################################################