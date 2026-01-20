import { connectDatabase, query } from '../src/db/connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function seedSuperAdmin() {
  try {
    console.log('🔐 Seeding Super Admin (PostgreSQL)...\n');

    await connectDatabase();

    // Check if super admin already exists
    const existingAdmin = await query(
      'SELECT * FROM superadmins WHERE email = $1 OR name = $2',
      ['superadmin@saptech.com', 'superadmin']
    );

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('⚠️  Super admin already exists!');
      console.log('👤 Name: superadmin');
      console.log('📧 Email: superadmin@saptech.com');
      console.log('🔑 Password: SuperAdmin@2025!');
      console.log('\n✅ You can log in with these credentials.\n');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025!', salt);

    // Create super admin
    const permissions = {
      canManageCompanies: true,
      canSuspendCompanies: true,
      canDeleteCompanies: true,
      canViewAllData: true,
      canManageAdmins: true
    };

    await query(
      `INSERT INTO superadmins 
      (id, name, email, password_hash, phone, role, permissions, is_active, login_attempts, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        uuidv4(),
        'superadmin',
        'superadmin@saptech.com',
        hashedPassword,
        '+256706564628',
        'superadmin',
        JSON.stringify(permissions),
        true,
        0,
        new Date(),
        new Date()
      ]
    );

    console.log('✅ Super Admin created successfully!\n');
    console.log('='.repeat(60));
    console.log('📋 SUPER ADMIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('👤 Name:     superadmin');
    console.log('📧 Email:    superadmin@saptech.com');
    console.log('🔑 Password: SuperAdmin@2025!');
    console.log('📞 Phone:    +256706564628');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
    console.log('1. Change the default password immediately after first login');
    console.log('2. Store these credentials securely');
    console.log('3. Never share super admin credentials');
    console.log('4. Enable two-factor authentication if available\n');
    console.log('🔗 Login at: https://sap-business-software.vercel.app\n');
    console.log('📝 Use the email above in the regular login form\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
