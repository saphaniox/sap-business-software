import { getDatabase, connectDatabase } from '../src/db/connection.js';

async function fixTestCompanyDatabase() {
  await connectDatabase();
  const db = getDatabase();
  
  const companyId = '6965574393d7e01df7afa0e1';
  const tenantDbName = `tenant_${companyId}`;
  
  console.log('\n🔧 Fixing ElectroPro Electronics database configuration...');
  console.log('Company ID:', companyId);
  console.log('Tenant Database:', tenantDbName);
  
  const result = await db.collection('companies').updateOne(
    { company_name: 'ElectroPro Electronics' },
    {
      $set: {
        database_type: 'dedicated',
        database_name: tenantDbName
      }
    }
  );
  
  if (result.modifiedCount > 0) {
    console.log('✅ Company database configuration updated!');
    console.log('\nSettings:');
    console.log('  database_type: dedicated');
    console.log('  database_name:', tenantDbName);
    console.log('\n🎯 Products should now appear in the frontend!');
    console.log('Try logging in again at: test@sbms.com / sbms@2026');
  } else {
    console.log('❌ Update failed');
  }
  
  // Verify
  const company = await db.collection('companies').findOne({ 
    company_name: 'ElectroPro Electronics' 
  });
  
  console.log('\n📋 Verified Company Configuration:');
  console.log('Database Type:', company.database_type);
  console.log('Database Name:', company.database_name);
  
  process.exit(0);
}

fixTestCompanyDatabase().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
