// 'src/components/checks/debugTableToConsole.ts
import { db } from '@kuvali-js/core';

/**
 * Returns all table names defined in the current schema.
 */
export const getDatabaseTableNames = (): string[] => {
  return Object.keys(db.adapter.schema.tables);
};

/*
 * Fetches data from a WatermelonDB table and prints it to the console.
 */
export const debugTableToConsole = async (tableName: string) => {
  try {
    const records = await db.get(tableName).query().fetch();

    if (records.length === 0) {
      console.debug(`========================================`);
      console.debug(`DATABASE: ${tableName} is EMPTY`);
      console.debug(`========================================\n`);
      return;
    }

    console.debug(`========================================`);
    console.debug(`TABLE: ${tableName} (${records.length} Records)`);
    console.debug(`========================================`);

    records.forEach((record: any, index: number) => {
      const raw = record._raw;
      console.log(`--- RECORD #${index + 1} (ID: ${raw.id}) ---`);

      Object.keys(raw).forEach(key => {
        if (key === '_status' || key === '_changed') return;

        const value = raw[key];

        // Handle JSON/Objects in fields like 'payload'
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          console.trace(`${key}:`, '[JSON Object]')
        } else if (typeof value === 'object' && value !== null) {
          console.trace(`${key}:`, '[Object]')
        } else if (key === 'created_at' || key === 'updated_at') {
          console.trace(`${key}: ${new Date(value).toLocaleString()}`);
        } else {
          console.trace(`${key}: ${value}`);
        }
      });
      console.trace(`----------------------------------------`);
    });

    console.trace(`=== END OF TABLE: ${tableName} ===\n`);
  } catch (e: any) {
    console.error(`Manual Fetch Error:`, e.message);
  }
};
