/**
 * Setup Test Account for PostgreSQL
 * Creates or updates a test business account with admin user
 */

import dotenv from 'dotenv';
import pg from 'pg';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupTestAccount() {
  const client = await pool.connect();
  
  try {
    console.log('\n🧪 Setting up test account...\n');

    // Check if test company exists
    const existingCompany = await client.query(
      'SELECT * FROM companies WHERE email = $1',
      ['test@sbms.com']
    );

    let companyId;
    
    if (existingCompany.rows.length > 0) {
      // Update existing company to active
      companyId = existingCompany.rows[0].id;
      console.log('📋 Test company found, updating status...');
      
      await client.query(
        `UPDATE companies 
         SET status = $1, updated_at = $2 
         WHERE id = $3`,
        ['active', new Date(), companyId]
      );
      
      console.log('✅ Company status updated to active');
    } else {
      // Create new test company
      companyId = uuidv4();
      console.log('📋 Creating new test company...');
      
      const settings = {
        currency: 'UGX',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
        language: 'en'
      };
      
      const industryFeatures = {
        categories: ['Electronics', 'Appliances', 'Accessories'],
        attributes: ['Brand', 'Model', 'Color', 'Warranty'],
        uom: ['Unit', 'Box', 'Set'],
        features: ['Inventory Management', 'Sales Tracking']
      };
      
      await client.query(
        `INSERT INTO companies 
        (id, company_name, business_type, email, phone, database_type, database_name,
         status, subscription_plan, settings, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          companyId,
          'Test Business',
          'electronics',
          'test@sbms.com',
          '+256700000000',
          'shared',
          'sap_shared_database',
          'active',
          'standard',
          JSON.stringify(settings),
          new Date(),
          new Date()
        ]
      );
      
      console.log('✅ Test company created');
    }

    // Check if test user exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['test@sbms.com']
    );

    if (existingUser.rows.length > 0) {
      // Update password for existing user
      console.log('👤 Test user found, updating password...');
      const hashedPassword = await bcryptjs.hash('Test@2025', 10);
      
      await client.query(
        `UPDATE users 
         SET password = $1, updated_at = $2, company_id = $3
         WHERE email = $4`,
        [hashedPassword, new Date(), companyId, 'test@sbms.com']
      );
      
      console.log('✅ User password updated');
    } else {
      // Create new test user
      console.log('👤 Creating new test user...');
      const userId = uuidv4();
      const hashedPassword = await bcryptjs.hash('Test@2025', 10);
      
      await client.query(
        `INSERT INTO users 
        (id, company_id, name, email, password, role, permissions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          companyId,
          'Test Admin',
          'test@sbms.com',
          hashedPassword,
          'admin',
          JSON.stringify(['all']),
          new Date(),
          new Date()
        ]
      );
      
      console.log('✅ Test user created');
    }

    console.log('\n🎉 Test account setup complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: test@sbms.com');
    console.log('🔑 Password: Test@2025');
    console.log('🏢 Company: Test Business');
    console.log('👤 Role: Admin (Company Administrator)');
    console.log('✅ Status: Active');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupTestAccount()
  .then(() => {
    console.log('✅ Done! You can now login with the test account.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
