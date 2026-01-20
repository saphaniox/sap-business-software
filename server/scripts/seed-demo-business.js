import { connectDatabase, getDatabase } from '../src/db/connection.js';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';

/**
 * Create a demo electronics business with comprehensive test data for marketing purposes
 * Business: ElectroPro Electronics
 * Email: test@sbms.com
 * Password: sbms@2026
 */

async function seedDemoElectronicsBusiness() {
  try {
    await connectDatabase();
    const db = getDatabase();

    console.log('🚀 Starting demo business creation...\n');

    // 1. Create Company
    const company = {
      _id: new ObjectId(),
      company_name: 'ElectroPro Electronics',
      business_type: 'electronics',
      currency: 'UGX',
      email: 'test@sbms.com',
      phone: '+256706564628',
      logo: null,
      address: 'Plot 42, Kampala Road, Nakasero',
      city: 'Kampala',
      country: 'Uganda',
      database_type: 'shared', // Use shared database
      status: 'active',
      is_approved: true,
      created_at: new Date(),
      updated_at: new Date(),
      is_demo_account: true, // Flag for demo/test account
      demo_info: {
        purpose: 'Marketing and visitor testing',
        credentials: {
          email: 'test@sbms.com',
          password: 'sbms@2026'
        }
      }
    };

    const existingCompany = await db.collection('companies').findOne({ 
      $or: [
        { email: company.email },
        { company_name: company.company_name }
      ]
    });

    if (existingCompany) {
      console.log('⚠️  Demo company already exists. Deleting old data...');
      
      // Delete old company data from shared database
      await db.collection('users').deleteMany({ company_id: existingCompany._id });
      await db.collection('products').deleteMany({ company_id: existingCompany._id });
      await db.collection('customers').deleteMany({ company_id: existingCompany._id });
      await db.collection('sales').deleteMany({ company_id: existingCompany._id });
      await db.collection('invoices').deleteMany({ company_id: existingCompany._id });
      await db.collection('expenses').deleteMany({ company_id: existingCompany._id });
      await db.collection('returns').deleteMany({ company_id: existingCompany._id });
      await db.collection('companies').deleteOne({ _id: existingCompany._id });
      
      console.log('✓ Old demo data cleaned up\n');
    }

    await db.collection('companies').insertOne(company);
    console.log(`✓ Company created: ${company.company_name}`);
    console.log(`  ID: ${company._id}`);
    console.log(`  Email: ${company.email}\n`);

    // 2. Create Admin User
    const hashedPassword = await bcryptjs.hash('sbms@2026', 10);
    const adminUser = {
      _id: new ObjectId(),
      username: 'test_admin',
      email: 'test@sbms.com',
      password: hashedPassword,
      role: 'admin',
      company_id: company._id,
      full_name: 'Test Administrator',
      phone: '+256706564628',
      is_active: true,
      permissions: {
        products: { add: true, edit: true, delete: true, view: true },
        sales: { add: true, edit: true, delete: true, view: true },
        customers: { add: true, edit: true, delete: true, view: true },
        invoices: { add: true, edit: true, delete: true, view: true },
        expenses: { add: true, edit: true, delete: true, view: true },
        reports: { view: true },
        users: { add: true, edit: true, delete: true, view: true },
        settings: { edit: true, view: true },
        backup: { create: true, restore: true, view: true }
      },
      failed_login_attempts: 0,
      last_login: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('users').insertOne(adminUser);
    console.log(`✓ Admin user created: ${adminUser.username}`);
    console.log(`  Password: sbms@2026\n`);

    // 3. Use shared database for all data
    console.log(`✓ Using shared database for all company data\n`);

    // 4. Create Product Categories
    const categories = [
      { name: 'Mobile Phones', icon: '📱', description: 'Smartphones and feature phones' },
      { name: 'Laptops', icon: '💻', description: 'Notebooks and ultrabooks' },
      { name: 'TVs', icon: '📺', description: 'Smart TVs and displays' },
      { name: 'Audio', icon: '🎧', description: 'Headphones, speakers, and audio equipment' },
      { name: 'Cameras', icon: '📷', description: 'Digital cameras and photography gear' },
      { name: 'Gaming', icon: '🎮', description: 'Gaming consoles and accessories' },
      { name: 'Accessories', icon: '🔌', description: 'Cables, chargers, and accessories' },
      { name: 'Home Appliances', icon: '🏠', description: 'Kitchen and home electronics' }
    ];

    const categoryDocs = categories.map(cat => ({
      _id: new ObjectId(),
      ...cat,
      company_id: company._id,
      created_at: new Date()
    }));

    await db.collection('categories').insertMany(categoryDocs);
    console.log(`✓ Created ${categoryDocs.length} product categories\n`);

    // 5. Create Sample Products (50+ products)
    const products = [
      // Mobile Phones
      { name: 'iPhone 15 Pro Max', category: 'Mobile Phones', brand: 'Apple', price: 1199, cost: 950, stock: 25, sku: 'APL-IP15PM-256', warranty: '12 months', serial: 'IMEI-Required' },
      { name: 'Samsung Galaxy S24 Ultra', category: 'Mobile Phones', brand: 'Samsung', price: 1099, cost: 880, stock: 30, sku: 'SAM-S24U-512', warranty: '12 months', serial: 'IMEI-Required' },
      { name: 'Google Pixel 8 Pro', category: 'Mobile Phones', brand: 'Google', price: 899, cost: 720, stock: 20, sku: 'GOO-PIX8P-256', warranty: '12 months', serial: 'IMEI-Required' },
      { name: 'OnePlus 12', category: 'Mobile Phones', brand: 'OnePlus', price: 799, cost: 640, stock: 15, sku: 'ONE-OP12-256', warranty: '12 months', serial: 'IMEI-Required' },
      { name: 'Xiaomi 14 Pro', category: 'Mobile Phones', brand: 'Xiaomi', price: 699, cost: 560, stock: 35, sku: 'XIA-MI14P-512', warranty: '12 months', serial: 'IMEI-Required' },
      
      // Laptops
      { name: 'MacBook Pro 16" M3', category: 'Laptops', brand: 'Apple', price: 2499, cost: 2000, stock: 12, sku: 'APL-MBP16-M3', warranty: '12 months', serial: 'Required' },
      { name: 'Dell XPS 15', category: 'Laptops', brand: 'Dell', price: 1799, cost: 1440, stock: 18, sku: 'DEL-XPS15-I9', warranty: '12 months', serial: 'Required' },
      { name: 'HP Spectre x360', category: 'Laptops', brand: 'HP', price: 1599, cost: 1280, stock: 10, sku: 'HP-SPX360-I7', warranty: '12 months', serial: 'Required' },
      { name: 'Lenovo ThinkPad X1 Carbon', category: 'Laptops', brand: 'Lenovo', price: 1899, cost: 1520, stock: 14, sku: 'LEN-X1C-I7', warranty: '36 months', serial: 'Required' },
      { name: 'ASUS ROG Zephyrus G14', category: 'Laptops', brand: 'ASUS', price: 1699, cost: 1360, stock: 8, sku: 'ASU-ROGG14-R9', warranty: '12 months', serial: 'Required' },
      
      // TVs
      { name: 'Samsung 65" QLED 4K', category: 'TVs', brand: 'Samsung', price: 1299, cost: 1040, stock: 15, sku: 'SAM-Q65-4K', warranty: '24 months', serial: 'Required' },
      { name: 'LG 55" OLED C3', category: 'TVs', brand: 'LG', price: 1499, cost: 1200, stock: 10, sku: 'LG-C3-55-OLED', warranty: '24 months', serial: 'Required' },
      { name: 'Sony 75" Bravia XR', category: 'TVs', brand: 'Sony', price: 2199, cost: 1760, stock: 6, sku: 'SON-XR75-4K', warranty: '24 months', serial: 'Required' },
      { name: 'TCL 43" 4K Smart TV', category: 'TVs', brand: 'TCL', price: 399, cost: 320, stock: 40, sku: 'TCL-43-4K', warranty: '12 months', serial: 'Required' },
      
      // Audio
      { name: 'Sony WH-1000XM5', category: 'Audio', brand: 'Sony', price: 399, cost: 320, stock: 50, sku: 'SON-WH1000XM5', warranty: '12 months', serial: 'Optional' },
      { name: 'Apple AirPods Pro 2', category: 'Audio', brand: 'Apple', price: 249, cost: 200, stock: 60, sku: 'APL-APRO2', warranty: '12 months', serial: 'Required' },
      { name: 'Bose QuietComfort 45', category: 'Audio', brand: 'Bose', price: 329, cost: 264, stock: 35, sku: 'BOS-QC45', warranty: '12 months', serial: 'Optional' },
      { name: 'JBL Flip 6 Speaker', category: 'Audio', brand: 'JBL', price: 129, cost: 104, stock: 80, sku: 'JBL-FLIP6', warranty: '12 months', serial: 'Optional' },
      { name: 'Marshall Emberton II', category: 'Audio', brand: 'Marshall', price: 169, cost: 136, stock: 45, sku: 'MAR-EMB2', warranty: '12 months', serial: 'Optional' },
      
      // Cameras
      { name: 'Canon EOS R6 Mark II', category: 'Cameras', brand: 'Canon', price: 2499, cost: 2000, stock: 5, sku: 'CAN-R6M2-BODY', warranty: '12 months', serial: 'Required' },
      { name: 'Sony A7 IV', category: 'Cameras', brand: 'Sony', price: 2499, cost: 2000, stock: 7, sku: 'SON-A7IV-BODY', warranty: '12 months', serial: 'Required' },
      { name: 'Nikon Z6 III', category: 'Cameras', brand: 'Nikon', price: 2299, cost: 1840, stock: 4, sku: 'NIK-Z6III-BODY', warranty: '12 months', serial: 'Required' },
      { name: 'GoPro Hero 12', category: 'Cameras', brand: 'GoPro', price: 399, cost: 320, stock: 25, sku: 'GOP-H12-BLK', warranty: '12 months', serial: 'Required' },
      
      // Gaming
      { name: 'PlayStation 5', category: 'Gaming', brand: 'Sony', price: 499, cost: 400, stock: 20, sku: 'SON-PS5-STD', warranty: '12 months', serial: 'Required' },
      { name: 'Xbox Series X', category: 'Gaming', brand: 'Microsoft', price: 499, cost: 400, stock: 18, sku: 'MS-XSX-1TB', warranty: '12 months', serial: 'Required' },
      { name: 'Nintendo Switch OLED', category: 'Gaming', brand: 'Nintendo', price: 349, cost: 280, stock: 30, sku: 'NIN-SW-OLED', warranty: '12 months', serial: 'Required' },
      { name: 'Steam Deck 512GB', category: 'Gaming', brand: 'Valve', price: 649, cost: 520, stock: 12, sku: 'VAL-SD-512', warranty: '12 months', serial: 'Required' },
      { name: 'Logitech G Pro Wireless', category: 'Gaming', brand: 'Logitech', price: 149, cost: 120, stock: 40, sku: 'LOG-GPROW', warranty: '24 months', serial: 'Optional' },
      
      // Accessories
      { name: 'Anker PowerCore 20000', category: 'Accessories', brand: 'Anker', price: 49, cost: 40, stock: 150, sku: 'ANK-PC20K', warranty: '18 months', serial: 'Optional' },
      { name: 'Belkin USB-C Hub', category: 'Accessories', brand: 'Belkin', price: 79, cost: 64, stock: 100, sku: 'BEL-USBC-HUB', warranty: '24 months', serial: 'Optional' },
      { name: 'Samsung Fast Charger 45W', category: 'Accessories', brand: 'Samsung', price: 39, cost: 32, stock: 200, sku: 'SAM-FC45W', warranty: '12 months', serial: 'Optional' },
      { name: 'Apple USB-C Cable 2m', category: 'Accessories', brand: 'Apple', price: 29, cost: 24, stock: 250, sku: 'APL-USBC-2M', warranty: '12 months', serial: 'Optional' },
      { name: 'SanDisk 1TB SSD', category: 'Accessories', brand: 'SanDisk', price: 129, cost: 104, stock: 70, sku: 'SAN-SSD-1TB', warranty: '36 months', serial: 'Required' },
      
      // Home Appliances
      { name: 'Dyson V15 Detect', category: 'Home Appliances', brand: 'Dyson', price: 649, cost: 520, stock: 15, sku: 'DYS-V15-DET', warranty: '24 months', serial: 'Required' },
      { name: 'Philips Air Fryer XXL', category: 'Home Appliances', brand: 'Philips', price: 299, cost: 240, stock: 25, sku: 'PHI-AF-XXL', warranty: '24 months', serial: 'Required' },
      { name: 'Nespresso Vertuo Next', category: 'Home Appliances', brand: 'Nespresso', price: 199, cost: 160, stock: 30, sku: 'NES-VN-BLK', warranty: '24 months', serial: 'Required' },
      { name: 'iRobot Roomba j7+', category: 'Home Appliances', brand: 'iRobot', price: 799, cost: 640, stock: 10, sku: 'IRO-J7PLUS', warranty: '12 months', serial: 'Required' },
      { name: 'Instant Pot Duo 7-in-1', category: 'Home Appliances', brand: 'Instant Pot', price: 99, cost: 80, stock: 40, sku: 'INS-DUO7', warranty: '12 months', serial: 'Optional' }
    ];

    const productDocs = products.map(prod => {
      const category = categoryDocs.find(c => c.name === prod.category);
      return {
        _id: new ObjectId(),
        name: prod.name,
        category_id: category._id,
        category_name: prod.category,
        description: `High-quality ${prod.name} from ${prod.brand}`,
        selling_price: prod.price,
        cost_price: prod.cost,
        stock_quantity: prod.stock,
        min_stock_level: Math.ceil(prod.stock * 0.2),
        sku: prod.sku,
        barcode: `EAN-${prod.sku}`,
        unit_of_measure: 'Unit',
        brand: prod.brand,
        warranty_period: prod.warranty,
        serial_number_required: prod.serial === 'Required' || prod.serial === 'IMEI-Required',
        attributes: {
          brand: prod.brand,
          warranty: prod.warranty,
          serial_tracking: prod.serial
        },
        company_id: company._id,
        is_active: true,
        created_by: adminUser._id,
        created_at: new Date(),
        updated_at: new Date()
      };
    });

    await db.collection('products').insertMany(productDocs);
    console.log(`✓ Created ${productDocs.length} sample products\n`);

    // 6. Create Sample Customers
    const customers = [
      { name: 'Tech Solutions Inc', email: 'contact@techsolutions.com', phone: '+1-555-0101', type: 'business', address: '456 Business Blvd, Suite 200' },
      { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1-555-0102', type: 'individual', address: '789 Residential St, Apt 5B' },
      { name: 'Digital Innovations LLC', email: 'info@digitalinnov.com', phone: '+1-555-0103', type: 'business', address: '321 Corporate Dr' },
      { name: 'Michael Chen', email: 'mchen@email.com', phone: '+1-555-0104', type: 'individual', address: '147 Main St' },
      { name: 'Global Systems Corp', email: 'sales@globalsys.com', phone: '+1-555-0105', type: 'business', address: '852 Enterprise Way' },
      { name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '+1-555-0106', type: 'individual', address: '963 Oak Avenue' },
      { name: 'NextGen Technologies', email: 'hello@nextgentech.com', phone: '+1-555-0107', type: 'business', address: '741 Innovation Park' },
      { name: 'David Kim', email: 'dkim@email.com', phone: '+1-555-0108', type: 'individual', address: '258 Pine Street' },
      { name: 'Smart Office Solutions', email: 'orders@smartoffice.com', phone: '+1-555-0109', type: 'business', address: '369 Commerce Plaza' },
      { name: 'Jessica Martinez', email: 'jess.m@email.com', phone: '+1-555-0110', type: 'individual', address: '159 Elm Road' }
    ];

    const customerDocs = customers.map(cust => ({
      _id: new ObjectId(),
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      customer_type: cust.type,
      address: cust.address,
      company_id: company._id,
      total_purchases: 0,
      outstanding_balance: 0,
      created_by: adminUser._id,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.collection('customers').insertMany(customerDocs);
    console.log(`✓ Created ${customerDocs.length} sample customers\n`);

    // 7. Create Sample Sales (Last 30 days)
    const salesData = [];
    const now = new Date();
    
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const saleDate = new Date(now);
      saleDate.setDate(saleDate.getDate() - daysAgo);
      
      const customer = customerDocs[Math.floor(Math.random() * customerDocs.length)];
      const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per sale
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = productDocs[Math.floor(Math.random() * productDocs.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = product.selling_price * quantity;
        subtotal += itemTotal;
        
        items.push({
          product_id: product._id,
          product_name: product.name,
          quantity: quantity,
          unit_price: product.selling_price,
          total_price: itemTotal
        });
      }
      
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      salesData.push({
        _id: new ObjectId(),
        sale_number: `SALE-${String(i + 1).padStart(5, '0')}`,
        customer_id: customer._id,
        customer_name: customer.name,
        items: items,
        subtotal: subtotal,
        tax_amount: tax,
        discount_amount: 0,
        total_amount: total,
        payment_method: ['cash', 'card', 'mobile_money'][Math.floor(Math.random() * 3)],
        payment_status: 'paid',
        notes: `Sale to ${customer.name}`,
        company_id: company._id,
        created_by: adminUser._id,
        created_at: saleDate,
        updated_at: saleDate
      });
    }
    
    await db.collection('sales').insertMany(salesData);
    console.log(`✓ Created ${salesData.length} sample sales orders\n`);

    // 8. Create Sample Expenses
    const expenses = [
      { category: 'Rent', amount: 3500, description: 'Monthly store rent - January 2026', date: -25 },
      { category: 'Utilities', amount: 450, description: 'Electricity bill', date: -20 },
      { category: 'Salaries', amount: 8500, description: 'Staff salaries - January', date: -15 },
      { category: 'Marketing', amount: 1200, description: 'Social media advertising', date: -12 },
      { category: 'Supplies', amount: 350, description: 'Office supplies and packaging materials', date: -10 },
      { category: 'Utilities', amount: 280, description: 'Internet and phone services', date: -8 },
      { category: 'Maintenance', amount: 600, description: 'Store maintenance and repairs', date: -5 },
      { category: 'Insurance', amount: 950, description: 'Business insurance premium', date: -3 }
    ];

    const expenseDocs = expenses.map((exp, idx) => {
      const expDate = new Date(now);
      expDate.setDate(expDate.getDate() + exp.date);
      
      return {
        _id: new ObjectId(),
        expense_number: `EXP-${String(idx + 1).padStart(5, '0')}`,
        category: exp.category,
        amount: exp.amount,
        description: exp.description,
        expense_date: expDate,
        payment_method: 'bank_transfer',
        receipt_number: `RCP-${String(idx + 1).padStart(4, '0')}`,
        company_id: company._id,
        created_by: adminUser._id,
        created_at: expDate,
        updated_at: expDate
      };
    });

    await db.collection('expenses').insertMany(expenseDocs);
    console.log(`✓ Created ${expenseDocs.length} sample expenses\n`);

    // 9. Create Sample Invoices
    const invoices = [];
    for (let i = 0; i < 8; i++) {
      const customer = customerDocs[Math.floor(Math.random() * customerDocs.length)];
      const daysAgo = Math.floor(Math.random() * 20);
      const invoiceDate = new Date(now);
      invoiceDate.setDate(invoiceDate.getDate() - daysAgo);
      
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      const numItems = Math.floor(Math.random() * 3) + 2;
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = productDocs[Math.floor(Math.random() * productDocs.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const itemTotal = product.selling_price * quantity;
        subtotal += itemTotal;
        
        items.push({
          product_id: product._id,
          description: product.name,
          quantity: quantity,
          unit_price: product.selling_price,
          total: itemTotal
        });
      }
      
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      const isPaid = Math.random() > 0.3;
      
      invoices.push({
        _id: new ObjectId(),
        invoice_number: `INV-${String(i + 1).padStart(5, '0')}`,
        customer_id: customer._id,
        customer_name: customer.name,
        customer_email: customer.email,
        items: items,
        subtotal: subtotal,
        tax_amount: tax,
        total_amount: total,
        amount_paid: isPaid ? total : 0,
        balance_due: isPaid ? 0 : total,
        status: isPaid ? 'paid' : 'pending',
        invoice_date: invoiceDate,
        due_date: dueDate,
        notes: `Invoice for ${customer.name}`,
        company_id: company._id,
        created_by: adminUser._id,
        created_at: invoiceDate,
        updated_at: invoiceDate
      });
    }
    
    await db.collection('invoices').insertMany(invoices);
    console.log(`✓ Created ${invoices.length} sample invoices\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ DEMO BUSINESS CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🏢 BUSINESS DETAILS:');
    console.log(`   Company: ${company.company_name}`);
    console.log(`   Industry: Electronics & Appliances`);
    console.log(`   Email: ${company.email}`);
    console.log(`   Phone: ${company.phone}\n`);
    
    console.log('🔐 LOGIN CREDENTIALS (For Marketing/Demo):');
    console.log(`   Email: test@sbms.com`);
    console.log(`   Password: sbms@2026\n`);
    
    console.log('📊 TEST DATA SUMMARY:');
    console.log(`   ✓ ${categoryDocs.length} Product Categories`);
    console.log(`   ✓ ${productDocs.length} Products (Mobile, Laptops, TVs, Audio, etc.)`);
    console.log(`   ✓ ${customerDocs.length} Customers (Business & Individual)`);
    console.log(`   ✓ ${salesData.length} Sales Orders`);
    console.log(`   ✓ ${expenseDocs.length} Expense Records`);
    console.log(`   ✓ ${invoices.length} Invoices\n`);
    
    console.log('💡 USAGE INSTRUCTIONS:');
    console.log('   1. Add these credentials to Welcome, Login, and Register pages');
    console.log('   2. Visitors can use "test@sbms.com" / "sbms@2026" to explore');
    console.log('   3. Full admin access - can view all features');
    console.log('   4. Data refreshes periodically for consistency\n');
    
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating demo business:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDemoElectronicsBusiness();
