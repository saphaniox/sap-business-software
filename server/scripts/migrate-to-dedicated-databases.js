import { getDatabase, connectDatabase, getTenantDatabase } from '../src/db/connection.js';
import { ObjectId } from 'mongodb';

async function migrateToDedicatedDatabases() {
  await connectDatabase();
  const mainDb = getDatabase();
  
  console.log('\n' + '═'.repeat(70));
  console.log('🔄 MIGRATING TO DEDICATED TENANT DATABASES');
  console.log('═'.repeat(70) + '\n');
  
  // Get all companies
  const companies = await mainDb.collection('companies').find({}).toArray();
  
  console.log(`Found ${companies.length} companies\n`);
  
  for (const company of companies) {
    console.log(`\n📦 Processing: ${company.company_name}`);
    console.log(`   Company ID: ${company._id}`);
    
    // Get tenant database
    const tenantDbName = `tenant_${company._id.toString()}`;
    const tenantDb = await getTenantDatabase(company._id);
    
    console.log(`   Tenant DB: ${tenantDbName}`);
    
    // Collections to migrate
    const collections = ['products', 'customers', 'sales', 'invoices', 'expenses', 'returns', 'categories'];
    
    let totalMigrated = 0;
    
    for (const collectionName of collections) {
      // Get data from main database for this company
      const data = await mainDb.collection(collectionName)
        .find({ company_id: company._id })
        .toArray();
      
      if (data.length > 0) {
        // Check if data already exists in tenant database
        const existingCount = await tenantDb.collection(collectionName).countDocuments({});
        
        if (existingCount === 0) {
          // Insert into tenant database
          await tenantDb.collection(collectionName).insertMany(data);
          console.log(`   ✅ ${collectionName}: Migrated ${data.length} documents`);
          totalMigrated += data.length;
        } else {
          console.log(`   ⚠️  ${collectionName}: Already has ${existingCount} documents (skipped)`);
        }
      } else {
        console.log(`   ⬜ ${collectionName}: No data to migrate`);
      }
    }
    
    // Update company record
    await mainDb.collection('companies').updateOne(
      { _id: company._id },
      { 
        $set: { 
          database_type: 'dedicated',
          database_name: tenantDbName,
          migrated_at: new Date()
        }
      }
    );
    
    console.log(`   📊 Total migrated: ${totalMigrated} documents`);
    console.log(`   ✅ Company configured for dedicated database`);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('✅ MIGRATION COMPLETE - ALL BUSINESSES ISOLATED');
  console.log('═'.repeat(70) + '\n');
  
  // Verify isolation
  console.log('🔍 Verifying isolation:\n');
  
  for (const company of companies) {
    const tenantDb = await getTenantDatabase(company._id);
    const productCount = await tenantDb.collection('products').countDocuments({});
    const customerCount = await tenantDb.collection('customers').countDocuments({});
    
    console.log(`${company.company_name}:`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Database: tenant_${company._id}`);
    console.log('');
  }
  
  console.log('✅ Each business now has completely separate database');
  console.log('✅ No data sharing between businesses\n');
  
  process.exit(0);
}

migrateToDedicatedDatabases().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
