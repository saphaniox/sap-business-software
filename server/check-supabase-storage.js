import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.iwcjmjqrymomvbppumsm:Saphaniox80%40@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
});

async function checkDatabaseSize() {
  try {
    console.log('Connecting to Supabase PostgreSQL...\n');
    
    // Database size
    const dbSize = await pool.query("SELECT pg_size_pretty(pg_database_size('postgres')) as database_size");
    console.log('📊 DATABASE STORAGE INFORMATION:');
    console.log('================================');
    console.log(`Total Database Size: ${dbSize.rows[0].database_size}`);
    console.log('');
    
    // Table sizes
    const tableSizes = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY size_bytes DESC
    `);
    
    console.log('📋 TABLE SIZES:');
    console.log('================================');
    tableSizes.rows.forEach(row => {
      console.log(`${row.tablename.padEnd(30)} ${row.size}`);
    });
    console.log('');
    
    // Row counts
    const tables = tableSizes.rows.map(r => r.tablename);
    console.log('📈 ROW COUNTS:');
    console.log('================================');
    
    for (const table of tables) {
      const count = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table.padEnd(30)} ${count.rows[0].count} rows`);
    }
    console.log('');
    
    // Supabase Free Tier Info
    console.log('💡 SUPABASE FREE TIER LIMITS:');
    console.log('================================');
    console.log('Storage Limit: 8 GB (8,192 MB)');
    console.log('Database Size: 500 MB (shared)');
    console.log('File Storage: 1 GB');
    console.log('Bandwidth: 2 GB/month');
    console.log('Monthly Active Users: 50,000');
    console.log('');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkDatabaseSize();
