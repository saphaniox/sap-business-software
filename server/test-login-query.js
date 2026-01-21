import { connectDatabase, query } from './src/db/connection.js';

async function testLogin() {
  try {
    console.log('\n🧪 Testing Login Query...\n');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');
    
    // Test query
    const username = 'test@sbms.com';
    const result = await query(
      'SELECT * FROM users WHERE name = ? OR email = ?',
      [username, username]
    );
    
    console.log('\n📊 Query Result:');
    console.log('  Type:', Array.isArray(result) ? 'Array ✅' : typeof result);
    console.log('  Length:', result ? result.length : 'undefined');
    
    if (result && result.length > 0) {
      console.log('\n✅ User found!');
      console.log('  ID:', result[0].id);
      console.log('  Name:', result[0].name);
      console.log('  Email:', result[0].email);
      console.log('  Role:', result[0].role);
      console.log('  Company ID:', result[0].company_id);
    } else {
      console.log('\n❌ No user found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testLogin();
