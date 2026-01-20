import { getDatabase, connectDatabase } from '../src/db/connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function ensureSuperAdminAuth() {
  console.log('\n🔧 Ensuring Super Admin Authentication...\n');
  console.log('=' .repeat(60));

  try {
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected\n');
    
    const db = getDatabase();
    
    // Check for existing super admin
    console.log('\n1️⃣ Checking for super admin accounts...');
    const existingAdmin = await db.collection('superadmins').findOne({ 
      email: 'superadmin@saptech.com' 
    });

    if (existingAdmin) {
      console.log('✅ Super admin account found:', existingAdmin.email);
      
      // Update to ensure correct fields
      const hashedPassword = await bcrypt.hash('SuperAdmin@2026', 10);
      
      // Delete and recreate to avoid validation issues
      await db.collection('superadmins').deleteOne({ email: 'superadmin@saptech.com' });
      
      await db.collection('superadmins').insertOne({
        email: 'superadmin@saptech.com',
        password: hashedPassword,
        name: existingAdmin.name || 'Super Admin',
        phone: existingAdmin.phone || '+1234567890',
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
        createdAt: existingAdmin.createdAt || new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Super admin credentials reset successfully!');
      
    } else {
      console.log('❌ No super admin found. Creating new one...');
      
      const hashedPassword = await bcrypt.hash('SuperAdmin@2026', 10);
      
      await db.collection('superadmins').insertOne({
        email: 'superadmin@saptech.com',
        password: hashedPassword,
        name: 'Super Admin',
        phone: '+1234567890',
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
      
      console.log('✅ Super admin account created successfully!');
    }

    // Verify the account
    console.log('\n2️⃣ Verifying super admin account...');
    const verifiedAdmin = await db.collection('superadmins').findOne({ 
      email: 'superadmin@saptech.com' 
    });
    
    console.log('\n📋 Account Details:');
    console.log(`   📧 Email: ${verifiedAdmin.email}`);
    console.log(`   👤 Name: ${verifiedAdmin.name}`);
    console.log(`   🔑 Role: ${verifiedAdmin.role}`);
    console.log(`   📊 Status: ${verifiedAdmin.status}`);
    console.log(`   🔐 Password: SuperAdmin@2026`);
    console.log(`   🆔 ID: ${verifiedAdmin._id}`);

    // Test password
    const passwordMatch = await bcrypt.compare('SuperAdmin@2026', verifiedAdmin.password);
    console.log(`\n   Password verification: ${passwordMatch ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n' + '=' .repeat(60));
    console.log('\n✨ Super Admin is ready to use!');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   📧 Email: superadmin@saptech.com');
    console.log('   🔐 Password: SuperAdmin@2026');
    console.log('\n🌐 Login at: http://localhost:5173/login\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

ensureSuperAdminAuth();
