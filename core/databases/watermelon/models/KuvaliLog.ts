// core/databases/watermelon/models/KuvaliLog.ts
import { Model } from '@nozbe/watermelondb';
import { field, text, readonly } from '@nozbe/watermelondb/decorators';

/**********************************************************
 * ### Table definition of logs
 *********************************************************/
export default class KuvaliLog extends Model {
  static table = 'kuvali_logs';

  @field('schema_version') schemaVersion!: number;  // version of this model/table definition
  @field('created_at')     created_at!:    number;
  @text('session_id')      session_id!:    string;
  @text('level')           level!:         string;  // log/debug level DEBUG...ERROR..SILENT
  @text('context')         context!:       string;  // module, function which created this entry
  @text('message')         message!:       string;  // plain text message
  @text('payload')         payload!:       string;  // json of all/more log informations
}

//### END #####################################################################