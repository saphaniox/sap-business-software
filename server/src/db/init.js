import { connectDatabase, query } from './connection.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    // Connect to PostgreSQL (Neon)
    await connectDatabase();
    console.log('✅ Database connected, initializing schema...');

    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    
    // For PostgreSQL, execute the entire schema as one statement
    // This handles DO blocks, triggers, and multi-statement transactions correctly
    try {
      await query(schema);
      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      // Ignore "already exists" errors
      if (error.message.includes('already exists')) {
        console.log('✅ Database schema already exists');
      } else {
        console.error('Error executing schema:', error.message);
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

