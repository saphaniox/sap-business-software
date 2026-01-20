import { getDatabase, connectDatabase } from '../src/db/connection.js';

async function updateTestCompanyAddress() {
  await connectDatabase();
  const db = getDatabase();
  
  const ugandanAddress = {
    address: 'Plot 42, Kampala Road, Nakasero',
    city: 'Kampala',
    country: 'Uganda'
  };
  
  console.log('\n🏢 Updating ElectroPro Electronics address to Ugandan location...');
  console.log('Address:', ugandanAddress.address);
  console.log('City:', ugandanAddress.city);
  console.log('Country:', ugandanAddress.country);
  
  const result = await db.collection('companies').updateOne(
    { company_name: 'ElectroPro Electronics' },
    { $set: ugandanAddress }
  );
  
  if (result.modifiedCount > 0) {
    console.log('\n✅ Address updated successfully!');
  } else {
    console.log('\n⚠️ No changes made (address may already be set)');
  }
  
  // Verify
  const company = await db.collection('companies').findOne({ 
    company_name: 'ElectroPro Electronics' 
  });
  
  console.log('\n📋 Current Company Address:');
  console.log('Address:', company.address);
  console.log('City:', company.city);
  console.log('Country:', company.country);
  
  process.exit(0);
}

updateTestCompanyAddress().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
