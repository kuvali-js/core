// lib/debugUtils.ts
import { database } from '../core/databases/watermelon/DatabaseService';

/**
 * Returns all table names defined in the current schema.
 */
export const getDatabaseTableNames = (): string[] => {
  return Object.keys(database.adapter.schema.tables);
};

/**
 * Fetches data from a WatermelonDB table and prints it to the console.
 */
export const debugTableToConsole = async (tableName: string) => {
  try {
    const records = await database.get(tableName).query().fetch();

    if (records.length === 0) {
      console.log(`========================================`);
      console.log(`DATABASE: ${tableName} is EMPTY`);
      console.log(`========================================\n`);
      return;
    }

    console.log(`========================================`);
    console.log(`TABLE: ${tableName} (${records.length} Records)`);
    console.log(`========================================`);

    records.forEach((record: any, index: number) => {
      const raw = record._raw;
      console.log(`--- RECORD #${index + 1} (ID: ${raw.id}) ---`);

      Object.keys(raw).forEach(key => {
        if (key === '_status' || key === '_changed') return;

        const value = raw[key];

        // Handle JSON/Objects in fields like 'payload'
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          console.log(`${key}:`, '[JSON Object]')
        } else if (typeof value === 'object' && value !== null) {
          console.log(`${key}:`, '[Object]')
        } else if (key === 'created_at' || key === 'updated_at') {
          console.log(`${key}: ${new Date(value).toLocaleString()}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });
      console.log(`----------------------------------------`);
    });

    console.log(`=== END OF TABLE: ${tableName} ===\n`);
  } catch (e: any) {
    console.error(`Manual Fetch Error:`, e.message);
  }
};
