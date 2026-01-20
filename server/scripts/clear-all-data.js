import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URI;

async function clearAllData() {
  const client = new MongoClient(MONGODB_URL);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    console.log('✅ Connected!\n');
    
    console.log('🗑️  Deleting all data except super admins...\n');
    
    // Delete all collections except superadmins
    const collections = [
      'companies',
      'users',
      'products',
      'customers',
      'sales',
      'invoices',
      'returns',
      'expenses',
      'auditlogs'
    ];
    
    for (const collection of collections) {
      const result = await db.collection(collection).deleteMany({});
      console.log(`  ✅ Deleted ${result.deletedCount} documents from ${collection}`);
    }
    
    console.log('\n🎉 SUCCESS! All data cleared except super admin\n');
    
    // Show remaining super admins
    console.log('🔐 Remaining Super Admins:');
    const superadmins = await db.collection('superadmins').find({}).toArray();
    superadmins.forEach(sa => {
      console.log(`  - Username: ${sa.username}`);
      console.log(`    Email: ${sa.email}`);
      console.log(`    Name: ${sa.name}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

clearAllData();
