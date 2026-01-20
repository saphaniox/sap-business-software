import { connectDatabase, getDatabase } from '../src/db/connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedSuperAdmin() {
  try {
    console.log('🔐 Seeding Super Admin...\n');

    await connectDatabase();
    const db = getDatabase();

    // Check if super admin already exists
    const existingAdmin = await db.collection('superadmins').findOne({ 
      $or: [{ email: 'superadmin@saptech.com' }, { username: 'superadmin' }]
    });

    if (existingAdmin) {
      console.log('⚠️  Super admin already exists!');
      console.log('👤 Username: superadmin');
      console.log('📧 Email: superadmin@saptech.com');
      console.log('🔑 If you forgot the password, you need to reset it manually in the database.\n');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025!', salt);

    // Create super admin
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

    console.log('✅ Super Admin created successfully!\n');
    console.log('='.repeat(60));
    console.log('📋 SUPER ADMIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('👤 Username: superadmin');
    console.log('📧 Email:    superadmin@saptech.com');
    console.log('🔑 Password: SuperAdmin@2025!');
    console.log('💼 Name:     SAP Technologies Administrator');
    console.log('📞 Phone:    +256706564628');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
    console.log('1. Change the default password immediately after first login');
    console.log('2. Store these credentials securely');
    console.log('3. Never share super admin credentials');
    console.log('4. Enable two-factor authentication if available\n');
    console.log('🔗 Login at: http://localhost:7000/api/superadmin/login\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
