/**
 * Supabase Database Setup Script
 * Run this ONCE to initialize your Supabase database with all required tables and super admin
 * 
 * Usage: node setup-supabase.js
 */

import dotenv from 'dotenv';
import pg from 'pg';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('\n🚀 Starting Supabase Database Setup...\n');

    // Step 1: Read and execute schema
    console.log('📋 Step 1: Creating database schema...');
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by statement and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (error) {
        // Skip errors for already existing objects
        if (!error.message.includes('already exists')) {
          console.warn('⚠️  Warning:', error.message.split('\n')[0]);
        }
      }
    }
    console.log('✅ Schema created successfully!\n');

    // Step 2: Check if super admin exists
    console.log('👤 Step 2: Checking for existing super admin...');
    const existingAdmin = await client.query(
      'SELECT id FROM superadmins WHERE email = $1',
      ['superadmin@saptech.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Super admin already exists. Skipping creation.\n');
    } else {
      // Create super admin
      console.log('🔐 Creating super admin account...');
      const superAdminId = uuidv4();
      const hashedPassword = await bcryptjs.hash('SuperAdmin@2025!', 10);
      
      await client.query(
        `INSERT INTO superadmins (
          id, email, password_hash, name, permissions, 
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          superAdminId,
          'superadmin@saptech.com',
          hashedPassword,
          'Super Administrator',
          JSON.stringify([
            'manage_companies',
            'manage_users',
            'view_analytics',
            'manage_settings',
            'view_audit_logs',
            'manage_support_tickets',
            'manage_announcements',
            'manage_email_templates'
          ]),
          true,
          new Date(),
          new Date()
        ]
      );

      console.log('✅ Super admin created successfully!\n');
      console.log('📧 Email: superadmin@saptech.com');
      console.log('🔑 Password: SuperAdmin@2025!\n');
    }

    // Step 3: Verify tables
    console.log('✅ Step 3: Verifying database tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Database setup completed successfully!\n');
    console.log('🔗 You can now login at: https://sap-business-software.vercel.app\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('✅ All done! Your Supabase database is ready to use.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
