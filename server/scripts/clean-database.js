import { getDatabase, connectDatabase } from '../src/db/connection.js';

async function cleanDatabase() {
  await connectDatabase();
  const db = getDatabase();
  
  console.log('\n🧹 Starting database cleanup...\n');
  
  // Get test company and super admin IDs
  const testCompany = await db.collection('companies').findOne({ 
    company_name: 'ElectroPro Electronics' 
  });
  
  const superAdmin = await db.collection('users').findOne({ 
    role: 'super_admin' 
  });
  
  if (!testCompany) {
    console.log('❌ Test company not found!');
    process.exit(1);
  }
  
  console.log('📋 Protected Data:');
  console.log('Test Company ID:', testCompany._id);
  console.log('Super Admin ID:', superAdmin?._id || 'Not found');
  
  // 1. Clean companies - keep only test company
  console.log('\n1️⃣ Cleaning companies...');
  const companiesResult = await db.collection('companies').deleteMany({
    _id: { $ne: testCompany._id }
  });
  console.log(`   Deleted ${companiesResult.deletedCount} companies`);
  
  // 2. Clean users - keep only test company users and super admin
  console.log('\n2️⃣ Cleaning users...');
  const keepUserIds = [testCompany._id];
  if (superAdmin) keepUserIds.push(superAdmin._id);
  
  const usersResult = await db.collection('users').deleteMany({
    $and: [
      { company_id: { $ne: testCompany._id } },
      { role: { $ne: 'super_admin' } }
    ]
  });
  console.log(`   Deleted ${usersResult.deletedCount} users`);
  
  // 3. Clean all data collections - keep only test company data
  const dataCollections = ['products', 'customers', 'sales', 'invoices', 'expenses', 'returns'];
  
  for (const collectionName of dataCollections) {
    console.log(`\n3️⃣ Cleaning ${collectionName}...`);
    const result = await db.collection(collectionName).deleteMany({
      company_id: { $ne: testCompany._id }
    });
    console.log(`   Deleted ${result.deletedCount} ${collectionName}`);
  }
  
  // 4. Fix test company to use shared database
  console.log('\n4️⃣ Configuring test company to use shared database...');
  await db.collection('companies').updateOne(
    { _id: testCompany._id },
    { 
      $set: { 
        database_type: 'shared'
      },
      $unset: {
        database_name: ""
      }
    }
  );
  console.log('   ✅ Test company now using shared database');
  
  // 5. Summary
  console.log('\n📊 Final Summary:');
  const companies = await db.collection('companies').countDocuments();
  const users = await db.collection('users').countDocuments();
  const products = await db.collection('products').countDocuments();
  const customers = await db.collection('customers').countDocuments();
  const sales = await db.collection('sales').countDocuments();
  const expenses = await db.collection('expenses').countDocuments();
  const invoices = await db.collection('invoices').countDocuments();
  
  console.log(`   Companies: ${companies}`);
  console.log(`   Users: ${users}`);
  console.log(`   Products: ${products}`);
  console.log(`   Customers: ${customers}`);
  console.log(`   Sales: ${sales}`);
  console.log(`   Expenses: ${expenses}`);
  console.log(`   Invoices: ${invoices}`);
  
  console.log('\n✅ Database cleanup completed!');
  console.log('🔄 All data now in single shared database');
  
  process.exit(0);
}

cleanDatabase().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
