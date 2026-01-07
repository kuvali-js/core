// model/watermelonSchema.ts
import { tableSchema, type TableSchema } from '@nozbe/watermelondb';

/**********************************************************
 * ### App specific table definitions
 * will be imported by the core
 * ---
 *********************************************************/


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! CHANGE version WHEN WORKING ON THE tableSchema !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// since version number has to changed at every change of the schema


export const DB_NAME = 'white_dog_db';
export const DB_VERSION = 3;   // increase version when changing the schema


//-----------------------------------------
// Increment version at every schema change
//-----------------------------------------
export const appSchemas: TableSchema[] = [
  tableSchema({
    name: 'encrypted_records',
    columns: [
      { name: 'user_id',                type: 'string', isIndexed: true },
      { name: 'encrypted_data',         type: 'string' },
      { name: 'category',               type: 'string', isIndexed: true },
      { name: 'initialization_vector',  type: 'string' },
      { name: 'created_at',             type: 'number', isIndexed: true },
      { name: 'updated_at',             type: 'number', isIndexed: true },
    ],
  }),
]


//### END #####################################################################