// @Kuvali/core/databases/watermelon/DatabaseService.ts
import { appSchema, Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { log, Log } from '../../log/index'

/**********************************************************
 * ### Watermelon Database Definition
* Merges core schemas/models with those provided by the application.
* **********************************************************/
import { coreSchemas } from './schema';
import { coreModels  } from './models/index';


export interface DatabaseConfig {
  dbName:     string;
  appModels:  any[] //Model[];
  appSchemas: any[] //TableSchema[];
  version:    number;
}

class DatabaseService {
  private static readonly CONTEXT = "DatabaseService:Watermelon"
  private _database: Database | null = null

  /**********************************************************
   * ### Return database instance
   *********************************************************/
  // @Log(DatabaseService.CONTEXT)
  public get instance(): Database {
    if (!this._database) {
      log.devFatal(
        `${DatabaseService.CONTEXT}: Access to instance before init()!`,
        `${DatabaseService.CONTEXT}: Access to instance before init()!`,
        "INIT"
      )
      //TODO// Close app gracefully with error message to user
    }
    return this._database!
  }


  /**********************************************************
   * ### Init Watermelon database
   *********************************************************/
  public init(config: DatabaseConfig): Database | null {
    if (this._database) {
      log.warn(`${DatabaseService.CONTEXT}: Watermelon already initialized.`)
      return this._database
    }

    try {
      const finalSchema = appSchema({
        version: config.version, // Increment version for schema changes
        tables: [
          ...coreSchemas,
          ...config.appSchemas
        ]
      })

      const adapter = new SQLiteAdapter({
        dbName: config.dbName,    // name of SQLite file on device
        schema: finalSchema,
        jsi: true,
      });

      this._database = new Database({
        adapter,
        modelClasses: [
          ...coreModels,
          ...config.appModels
        ]
      });

      log.info(`${DatabaseService.CONTEXT}: Watermelon db "${config.dbName}" started`);
      return this._database;
    } catch (error) {
      log.error(`${DatabaseService.CONTEXT}: Initialization failed`, error);
      return null;
    }
  }

  /** ### get the database instance directly */
  public getWatermelon(): Database | null {
    return this._database;
  }

  /** ### Check availability of database instance */
  public isReady(): boolean {
    return this._database !== null;
  }
}


export const db = new DatabaseService();

//### END #################################################