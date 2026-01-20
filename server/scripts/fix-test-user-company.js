import { getDatabase, connectDatabase } from '../src/db/connection.js';

async function fixTestUser() {
  await connectDatabase();
  const db = getDatabase();
  
  const usersCollection = db.collection('users');
  const companiesCollection = db.collection('companies');
  
  // Find test user
  const testUser = await usersCollection.findOne({ email: 'test@sbms.com' });
  
  if (!testUser) {
    console.log('❌ Test user not found!');
    process.exit(1);
  }
  
  console.log('\n📧 Test User:');
  console.log('Email:', testUser.email);
  console.log('Name:', testUser.name);
  console.log('Role:', testUser.role);
  console.log('Company ID:', testUser.company_id);
  
  if (!testUser.company_id) {
    console.log('\n❌ PROBLEM FOUND: company_id is MISSING!');
    console.log('This is why products don\'t show - tenantContext middleware fails without company_id');
    
    // Find the test company
    const testCompany = await companiesCollection.findOne({ 
      company_name: 'ElectroPro Electronics' 
    });
    
    if (!testCompany) {
      console.log('❌ ElectroPro Electronics company not found!');
      process.exit(1);
    }
    
    console.log('\n🏢 Found ElectroPro Company:');
    console.log('ID:', testCompany._id);
    console.log('Name:', testCompany.company_name);
    console.log('Status:', testCompany.status);
    
    // Fix it
    console.log('\n🔧 Fixing: Adding company_id to test user...');
    await usersCollection.updateOne(
      { email: 'test@sbms.com' },
      { $set: { company_id: testCompany._id } }
    );
    
    console.log('✅ FIXED! Test user now has company_id');
    console.log('\n🎯 Try logging in again - products should appear now!');
  } else {
    console.log('\n✅ company_id is present');
    console.log('Company ID type:', typeof testUser.company_id);
    console.log('Company ID value:', testUser.company_id);
    
    // Verify company exists
    const company = await companiesCollection.findOne({ _id: testUser.company_id });
    if (company) {
      console.log('\n🏢 Associated Company:');
      console.log('Name:', company.company_name);
      console.log('Status:', company.status);
      console.log('\n✅ Everything looks correct!');
    } else {
      console.log('\n❌ PROBLEM: Company with this ID not found!');
    }
  }
  
  process.exit(0);
}

fixTestUser().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
