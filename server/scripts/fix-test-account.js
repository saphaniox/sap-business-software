import { connectDatabase, getDatabase } from '../src/db/connection.js';

/**
 * Fix test account to ensure it's properly approved and active
 */
async function fixTestAccount() {
  try {
    await connectDatabase();
    const db = getDatabase();

    console.log('🔧 Fixing test account status...\n');

    // Find test account
    const testCompany = await db.collection('companies').findOne({ 
      email: 'test@sbms.com' 
    });

    if (!testCompany) {
      console.log('❌ Test account not found');
      process.exit(1);
    }

    console.log(`Found: ${testCompany.company_name}`);
    console.log(`Current status: ${testCompany.status}`);
    console.log(`Current is_approved: ${testCompany.is_approved}\n`);

    // Update to ensure it's active and approved
    await db.collection('companies').updateOne(
      { _id: testCompany._id },
      { 
        $set: { 
          status: 'active',
          is_approved: true,
          updated_at: new Date()
        } 
      }
    );

    console.log('✅ Test account fixed!');
    console.log('Status: active');
    console.log('Approved: true\n');

    // Verify
    const updated = await db.collection('companies').findOne({ 
      email: 'test@sbms.com' 
    });
    console.log('Verification:');
    console.log(`  Status: ${updated.status}`);
    console.log(`  Approved: ${updated.is_approved}`);

    process.exit(0);
  } catch (error) {
    console.error('Error fixing test account:', error);
    process.exit(1);
  }
}

fixTestAccount();
