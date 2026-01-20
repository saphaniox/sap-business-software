import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URI;

async function resetSuperAdmin() {
  const client = new MongoClient(MONGODB_URL);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    console.log('✅ Connected!\n');
    
    console.log('🗑️  Deleting existing super admin...');
    await db.collection('superadmins').deleteMany({});
    console.log('✅ Deleted\n');
    
    console.log('🔐 Creating fresh super admin...');
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025!', salt);
    
    const superAdmin = {
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
    };
    
    await db.collection('superadmins').insertOne(superAdmin);
    console.log('✅ Super admin created!\n');
    
    // Verify password works
    console.log('🔍 Verifying password...');
    const testMatch = await bcrypt.compare('SuperAdmin@2025!', hashedPassword);
    console.log('Password verification:', testMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SUPER ADMIN CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════');
    console.log('Username: superadmin');
    console.log('Email:    superadmin@saptech.com');
    console.log('Password: SuperAdmin@2025!');
    console.log('Status:   active');
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

resetSuperAdmin();
