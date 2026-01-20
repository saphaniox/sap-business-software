import { connectDatabase, getDatabase } from '../src/db/connection.js';

async function unlockSuperAdmin() {
  try {
    // Connect to database first
    await connectDatabase();
    const db = getDatabase();
    
    // Find all super admins
    const admins = await db.collection('superadmins').find({}).toArray();
    
    if (admins.length === 0) {
      console.log('❌ No Super Admin accounts found');
      return;
    }
    
    console.log('\n📋 Current Super Admin Accounts:');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} - Status: ${admin.status} - Locked: ${admin.lockUntil && admin.lockUntil > new Date() ? 'Yes (until ' + new Date(admin.lockUntil).toLocaleString() + ')' : 'No'}`);
    });
    
    // Unlock all super admins using $unset to remove the lockUntil field
    const result = await db.collection('superadmins').updateMany(
      {},
      {
        $set: {
          status: 'active',
          loginAttempts: 0,
          updatedAt: new Date()
        },
        $unset: {
          lockUntil: ""  // Remove the lockUntil field entirely
        }
      }
    );
    
    console.log(`\n✅ Unlocked ${result.modifiedCount} Super Admin account(s)`);
    console.log('   - Status set to: active');
    console.log('   - Lock removed (lockUntil cleared)');
    console.log('   - Login attempts reset to: 0\n');
    
  } catch (error) {
    console.error('❌ Error unlocking Super Admin:', error);
  } finally {
    process.exit(0);
  }
}

unlockSuperAdmin();
