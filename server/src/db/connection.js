import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool (Neon support)
let pool = null;

/**
 * Initialize PostgreSQL database connection
 * Optimized for Neon serverless Postgres
 */
export async function connectDatabase() {
  try {
    // Create connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Neon-specific optimizations
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Connected to PostgreSQL database (Supabase)');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Get database connection pool
 */
export function getDatabase() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return { query: queryWrapper };
}

/**
 * Execute a SQL query with automatic connection handling
 * @param {string} sql - SQL query string (use $1, $2, etc. for params)
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results rows
 */
async function queryWrapper(sql, params = []) {
  try {
    if (!pool) {
      throw new Error('Database not connected. Call connectDatabase() first.');
    }
    
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result = await pool.query(pgSql, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Direct query function for use without getDatabase()
 */
export async function query(sql, params = []) {
  return queryWrapper(sql, params);
}


/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Async function containing queries
 * @returns {Promise<any>} Transaction result
 */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all database connections
 */
export async function closeDatabase() {
  try {
    if (pool) {
      await pool.end();
      console.log('✅ PostgreSQL connection pool closed');
    }
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
}

/**
 * Helper: Convert MongoDB-style filter to SQL WHERE clause
 * @param {Object} filter - MongoDB-style filter object
 * @returns {Object} { where, params }
 */
export function buildWhereClause(filter) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  Object.entries(filter).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      conditions.push(`${key} IS NULL`);
    } else if (typeof value === 'object' && value.$regex) {
      conditions.push(`${key} ILIKE $${paramIndex}`);
      params.push(`%${value.$regex}%`);
      paramIndex++;
    } else {
      conditions.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  });

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

/**
 * Helper: Convert MongoDB-style update to SQL SET clause
 * @param {Object} update - MongoDB-style update object
 * @returns {Object} { set, params }
 */
export function buildSetClause(update) {
  const $set = update.$set || update;
  const fields = [];
  const params = [];
  let paramIndex = 1;

  Object.entries($set).forEach(([key, value]) => {
    fields.push(`${key} = $${paramIndex}`);
    params.push(typeof value === 'object' ? JSON.stringify(value) : value);
    paramIndex++;
  });

  const set = fields.join(', ');
  return { set, params };
}

/**
 * Helper: Generate UUID for IDs (replaces MongoDB ObjectId)
 */
export function generateId() {
  return crypto.randomUUID();
}

export default { 
  connectDatabase, 
  getDatabase,
  query,
  transaction,
  closeDatabase,
  buildWhereClause,
  buildSetClause,
  generateId
};




