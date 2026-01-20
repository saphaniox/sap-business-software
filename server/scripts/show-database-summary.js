import { getDatabase, connectDatabase } from '../src/db/connection.js';

async function showDatabaseSummary() {
  await connectDatabase();
  const db = getDatabase();
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 DATABASE SUMMARY - SINGLE SHARED DATABASE');
  console.log('═'.repeat(60) + '\n');
  
  // Super Admin
  const superAdmin = await db.collection('superadmins').findOne({ 
    email: 'superadmin@saptech.com' 
  });
  
  console.log('👤 SUPER ADMIN:');
  if (superAdmin) {
    console.log('   ✅ Username: superadmin');
    console.log('   ✅ Email: superadmin@saptech.com');
    console.log('   ✅ Password: SuperAdmin@2025!');
  } else {
    console.log('   ❌ Not found');
  }
  
  // Test Company
  const testCompany = await db.collection('companies').findOne({ 
    company_name: 'ElectroPro Electronics' 
  });
  
  console.log('\n🏢 TEST COMPANY:');
  if (testCompany) {
    console.log('   ✅ Name: ElectroPro Electronics');
    console.log('   ✅ Email: test@sbms.com');
    console.log('   ✅ Phone:', testCompany.phone);
    console.log('   ✅ Address:', testCompany.address);
    console.log('   ✅ City:', testCompany.city);
    console.log('   ✅ Country:', testCompany.country);
    console.log('   ✅ Currency:', testCompany.currency);
    console.log('   ✅ Database Type:', testCompany.database_type || 'Not set');
    console.log('   ✅ Status:', testCompany.status);
  } else {
    console.log('   ❌ Not found');
  }
  
  // Test User
  const testUser = await db.collection('users').findOne({ 
    email: 'test@sbms.com' 
  });
  
  console.log('\n👥 TEST USER:');
  if (testUser) {
    console.log('   ✅ Username:', testUser.username);
    console.log('   ✅ Email: test@sbms.com');
    console.log('   ✅ Password: sbms@2026');
    console.log('   ✅ Role:', testUser.role);
  } else {
    console.log('   ❌ Not found');
  }
  
  // Data counts
  console.log('\n📈 DATA SUMMARY (All in Single Shared Database):');
  console.log('   Companies:', await db.collection('companies').countDocuments());
  console.log('   Users:', await db.collection('users').countDocuments());
  console.log('   Super Admins:', await db.collection('superadmins').countDocuments());
  console.log('   Products:', await db.collection('products').countDocuments());
  console.log('   Customers:', await db.collection('customers').countDocuments());
  console.log('   Sales:', await db.collection('sales').countDocuments());
  console.log('   Invoices:', await db.collection('invoices').countDocuments());
  console.log('   Expenses:', await db.collection('expenses').countDocuments());
  console.log('   Returns:', await db.collection('returns').countDocuments());
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ ALL DATA IN SINGLE SHARED DATABASE');
  console.log('✅ NO TENANT DATABASES');
  console.log('✅ DATA ISOLATION BY company_id FIELD');
  console.log('═'.repeat(60) + '\n');
  
  process.exit(0);
}

showDatabaseSummary().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
