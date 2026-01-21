import { query } from './src/db/connection.js';
import { connectDatabase } from './src/db/connection.js';

async function checkUser() {
  try {
    console.log('🔍 Checking for test user...\n');
    
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Check by email
    const byEmail = await query(
      'SELECT id, name, email, company_id, role FROM users WHERE email = ?',
      ['test@sbms.com']
    );

    console.log('📧 Search by email (test@sbms.com):');
    console.log(`   Found: ${byEmail.length} user(s)`);
    if (byEmail.length > 0) {
      console.log('   User:', JSON.stringify(byEmail[0], null, 2));
    }

    // Check by name
    const byName = await query(
      'SELECT id, name, email, company_id, role FROM users WHERE name = ?',
      ['test@sbms.com']
    );

    console.log('\n👤 Search by name (test@sbms.com):');
    console.log(`   Found: ${byName.length} user(s)`);
    if (byName.length > 0) {
      console.log('   User:', JSON.stringify(byName[0], null, 2));
    }

    // Get all users to see what's available
    const allUsers = await query(
      'SELECT id, name, email, company_id, role FROM users LIMIT 5'
    );

    console.log('\n📋 First 5 users in database:');
    allUsers.forEach((user, index) => {
      console.log(`\n   ${index + 1}. Name: ${user.name}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Company ID: ${user.company_id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkUser();
