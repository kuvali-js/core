// @kuvali-js/core/databases/watermelon/schema.ts
import { appSchema, TableSchema, tableSchema } from "@nozbe/watermelondb";

/**********************************************************
 * ### Core specific tables & watermelon schema setting
 * the usual watermelon definitions of tables used by the non-core part
 * ---
 **********************************************************/

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! CHANGE version WHEN WORKING ON THE tableSchema !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// change in file:  @/databases/watermelon/appSchemas

/**********************************************************
 * ### Core specific table definitions
 *********************************************************/
export const coreSchemas = [
  tableSchema({
    name: "kuvali_logs",
    columns: [
      { name: "schema_version", type: "number" },
      { name: "created_at", type: "number", isIndexed: true },
      { name: "session_id", type: "string" },
      { name: "level", type: "string", isIndexed: true },
      { name: "context", type: "string", isIndexed: true },
      { name: "message", type: "string" },
      { name: "payload", type: "string" },
    ],
  }),
] as TableSchema[];

//### END #####################################################################
