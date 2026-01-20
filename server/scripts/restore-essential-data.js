import { getDatabase, connectDatabase } from '../src/db/connection.js';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';

async function restoreEssentialData() {
  await connectDatabase();
  const db = getDatabase();
  
  console.log('\n🔄 Restoring essential data...\n');
  
  // 1. Check/Create Super Admin
  console.log('1️⃣ Checking Super Admin...');
  let superAdmin = await db.collection('superadmins').findOne({ 
    email: 'superadmin@saptech.com' 
  });
  
  if (!superAdmin) {
    console.log('   Creating Super Admin...');
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash('SuperAdmin@2025!', salt);
    const result = await db.collection('superadmins').insertOne({
      username: 'superadmin',
      name: 'SAP Technologies Administrator',
      email: 'superadmin@saptech.com',
      password: hashedPassword,
      phone: '+256706564628',
      role: 'superadmin',
      permissions: {
        canManageCompanies: true,
        canSuspendCompanies: true,
        canDeleteCompanies: true,
        canViewAllData: true,
        canManageAdmins: true
      },
      status: 'active',
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    superAdmin = { _id: result.insertedId };
    console.log('   ✅ Super Admin created');
  } else {
    console.log('   ✅ Super Admin exists');
  }
  
  // 2. Get test company
  const testCompany = await db.collection('companies').findOne({ 
    company_name: 'ElectroPro Electronics' 
  });
  
  if (!testCompany) {
    console.log('❌ Test company not found!');
    process.exit(1);
  }
  
  console.log('\n2️⃣ Test Company found:', testCompany.company_name);
  console.log('   Company ID:', testCompany._id);
  
  // 3. Check test user
  console.log('\n3️⃣ Checking Test User...');
  let testUser = await db.collection('users').findOne({ 
    email: 'test@sbms.com',
    company_id: testCompany._id 
  });
  
  if (!testUser) {
    console.log('   Creating test user...');
    const hashedPassword = await bcryptjs.hash('sbms@2026', 10);
    const result = await db.collection('users').insertOne({
      username: 'testadmin',
      name: 'Test Administrator',
      email: 'test@sbms.com',
      password: hashedPassword,
      company_id: testCompany._id,
      role: 'admin',
      is_active: true,
      is_company_admin: true,
      created_at: new Date()
    });
    testUser = { _id: result.insertedId };
    console.log('   ✅ Test user created');
  } else {
    console.log('   ✅ Test user exists');
  }
  
  // 4. Check if test data exists
  console.log('\n4️⃣ Checking test data...');
  const productCount = await db.collection('products').countDocuments({ 
    company_id: testCompany._id 
  });
  
  if (productCount === 0) {
    console.log('   ❌ No products found');
    console.log('   ⚠️ Run: node scripts/seed-demo-business.js to add test data');
  } else {
    console.log(`   ✅ ${productCount} products found`);
  }
  
  // 5. Summary
  console.log('\n📊 Database Summary:');
  console.log('   Companies:', await db.collection('companies').countDocuments());
  console.log('   Users:', await db.collection('users').countDocuments());
  console.log('   Products:', await db.collection('products').countDocuments());
  console.log('   Customers:', await db.collection('customers').countDocuments());
  console.log('   Sales:', await db.collection('sales').countDocuments());
  
  console.log('\n✅ Database configuration verified!');
  console.log('\n📝 Credentials:');
  console.log('   Super Admin: superadmin@saptech.com / SuperAdmin@2025!');
  console.log('   Test Account: test@sbms.com / sbms@2026');
  
  process.exit(0);
}

restoreEssentialData().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
