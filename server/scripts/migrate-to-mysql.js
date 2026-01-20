import { MongoClient } from 'mongodb';
import { query, connectDatabase, generateId } from '../src/db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to move data from MongoDB to MySQL/PlanetScale
 * Run this ONCE after setting up your PlanetScale database
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_NAME = process.env.MONGODB_NAME || 'sap_main_database';

async function migrateCollection(mongoDb, collectionName, tableName, transformFn) {
  console.log(`\n📦 Migrating ${collectionName} → ${tableName}...`);
  
  try {
    const collection = mongoDb.collection(collectionName);
    const documents = await collection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`  ✓ No data to migrate in ${collectionName}`);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        const { sql, params } = transformFn(doc);
        await query(sql, params);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Error migrating document ${doc._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`  ✓ Migrated ${successCount} records (${errorCount} errors)`);
  } catch (error) {
    console.error(`  ✗ Failed to migrate ${collectionName}:`, error.message);
  }
}

// Transform functions for each collection
const transforms = {
  superadmins: (doc) => ({
    sql: `INSERT INTO superadmins (id, name, email, password, phone, role, permissions, status, last_login, login_attempts, lock_until, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.name || '',
      doc.email,
      doc.password,
      doc.phone || '',
      doc.role || 'superadmin',
      JSON.stringify(doc.permissions || {}),
      doc.status || 'active',
      doc.lastLogin || null,
      doc.loginAttempts || 0,
      doc.lockUntil || null,
      doc.createdAt || new Date(),
      doc.updatedAt || new Date()
    ]
  }),

  companies: (doc) => ({
    sql: `INSERT INTO companies (id, company_name, business_type, email, phone, address, city, state, postal_code, country, 
          logo_url, database_type, database_name, status, suspension_reason, suspended_at, suspended_by, rejected_at, rejected_by, 
          rejection_reason, approved_by, approved_at, settings, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.company_name,
      doc.business_type || '',
      doc.email || '',
      doc.phone || '',
      doc.address || '',
      doc.city || '',
      doc.state || '',
      doc.postal_code || '',
      doc.country || '',
      doc.logo_url || '',
      doc.database_type || 'shared',
      doc.database_name || '',
      doc.status || 'pending',
      doc.suspension_reason || '',
      doc.suspended_at || null,
      doc.suspended_by?.toString() || null,
      doc.rejected_at || null,
      doc.rejected_by?.toString() || null,
      doc.rejection_reason || '',
      doc.approved_by?.toString() || null,
      doc.approved_at || null,
      JSON.stringify(doc.settings || {}),
      doc.created_at || new Date(),
      doc.updated_at || new Date()
    ]
  }),

  users: (doc) => ({
    sql: `INSERT INTO users (id, company_id, name, email, password, phone, role, permissions, status, last_login, 
          login_attempts, lock_until, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.company_id.toString(),
      doc.name || doc.username || '',
      doc.email || '',
      doc.password || doc.password_hash || '',
      doc.phone || '',
      doc.role || 'staff',
      JSON.stringify(doc.permissions || {}),
      doc.status || 'active',
      doc.last_login || null,
      doc.loginAttempts || 0,
      doc.lockUntil || null,
      doc.created_at || new Date(),
      doc.updated_at || new Date()
    ]
  }),

  products: (doc) => ({
    sql: `INSERT INTO products (id, company_id, name, description, category, sku, barcode, cost_price, selling_price, 
          quantity, reorder_level, unit, supplier, status, created_by, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.company_id.toString(),
      doc.name,
      doc.description || '',
      doc.category || '',
      doc.sku || '',
      doc.barcode || '',
      doc.cost_price || doc.unit_price || 0,
      doc.selling_price || doc.unit_price || 0,
      doc.quantity || doc.quantity_in_stock || 0,
      doc.reorder_level || doc.min_stock_level || 10,
      doc.unit || '',
      doc.supplier || '',
      doc.status || 'active',
      doc.user_id?.toString() || doc.created_by?.toString() || null,
      doc.created_at || new Date(),
      doc.updated_at || new Date()
    ]
  }),

  customers: (doc) => ({
    sql: `INSERT INTO customers (id, company_id, name, email, phone, address, city, state, postal_code, country, 
          customer_type, notes, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.company_id.toString(),
      doc.name,
      doc.email || '',
      doc.phone || '',
      doc.address || '',
      doc.city || '',
      doc.state || '',
      doc.postal_code || '',
      doc.country || '',
      doc.customer_type || 'individual',
      doc.notes || '',
      doc.status || 'active',
      doc.created_at || new Date(),
      doc.updated_at || new Date()
    ]
  }),

  sales: (doc) => ({
    sql: `INSERT INTO sales (id, company_id, customer_id, customer_name, sale_number, items, subtotal, tax, discount, 
          total, cost_total, profit, payment_method, payment_status, amount_paid, amount_due, notes, status, created_by, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.company_id.toString(),
      doc.customer_id?.toString() || null,
      doc.customer_name || '',
      doc.sale_number || `SALE-${doc._id.toString().substring(0, 8)}`,
      JSON.stringify(doc.items || []),
      doc.subtotal || 0,
      doc.tax || 0,
      doc.discount || 0,
      doc.total || 0,
      doc.cost_total || 0,
      doc.profit || 0,
      doc.payment_method || 'cash',
      doc.payment_status || 'paid',
      doc.amount_paid || doc.total || 0,
      doc.amount_due || 0,
      doc.notes || '',
      doc.status || 'completed',
      doc.created_by?.toString() || null,
      doc.created_at || new Date(),
      doc.updated_at || new Date()
    ]
  }),

  expenses: (doc) => ({
    sql: `INSERT INTO expenses (id, company_id, category, description, amount, payment_method, vendor, expense_date, 
          notes, status, created_by, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      doc._id.toString(),
      doc.company_id.toString(),
      doc.category || 'Other',
      doc.description || '',
      doc.amount || 0,
      doc.payment_method || '',
      doc.vendor || '',
      doc.expense_date || new Date(),
      doc.notes || '',
      doc.status || 'approved',
      doc.created_by?.toString() || null,
      doc.created_at || new Date(),
      doc.updated_at || new Date()
    ]
  })
};

async function runMigration() {
  console.log('🚀 Starting MongoDB → MySQL Migration\n');
  
  let mongoClient;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const mongoDb = mongoClient.db(MONGODB_NAME);
    console.log('✅ Connected to MongoDB\n');

    // Connect to MySQL/PlanetScale
    console.log('📡 Connecting to MySQL/PlanetScale...');
    await connectDatabase();
    console.log('✅ Connected to MySQL/PlanetScale\n');

    // Migrate each collection
    await migrateCollection(mongoDb, 'superadmins', 'superadmins', transforms.superadmins);
    await migrateCollection(mongoDb, 'companies', 'companies', transforms.companies);
    await migrateCollection(mongoDb, 'users', 'users', transforms.users);
    await migrateCollection(mongoDb, 'products', 'products', transforms.products);
    await migrateCollection(mongoDb, 'customers', 'customers', transforms.customers);
    await migrateCollection(mongoDb, 'sales', 'sales', transforms.sales);
    await migrateCollection(mongoDb, 'expenses', 'expenses', transforms.expenses);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Verify data in PlanetScale dashboard');
    console.log('  2. Update .env to use DATABASE_DRIVER=planetscale');
    console.log('  3. Test your application');
    console.log('  4. Keep MongoDB backup until fully tested\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 Closed MongoDB connection');
    }
  }
}

// Run migration
runMigration();
