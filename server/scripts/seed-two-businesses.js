import { MongoClient, Decimal128 } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/sap_business_mgmt';

// Electronics Business Products
const electronicsProducts = [
  { name: 'iPhone 15 Pro Max', sku: 'IP15PM-256', price: 5200000, cost_price: 4500000, stock: 15, category: 'Mobile Phones', description: '256GB, Titanium Blue' },
  { name: 'Samsung Galaxy S24 Ultra', sku: 'SGS24U-512', price: 4800000, cost_price: 4200000, stock: 20, category: 'Mobile Phones', description: '512GB, Phantom Black' },
  { name: 'MacBook Pro 14"', sku: 'MBP14-M3-512', price: 8500000, cost_price: 7500000, stock: 8, category: 'Laptops', description: 'M3 Pro, 512GB SSD, 16GB RAM' },
  { name: 'Dell XPS 15', sku: 'DXPS15-I7', price: 6200000, cost_price: 5400000, stock: 12, category: 'Laptops', description: 'Intel i7, 1TB SSD, 32GB RAM' },
  { name: 'Sony 65" 4K TV', sku: 'SONY65-4K', price: 3500000, cost_price: 2900000, stock: 10, category: 'TVs', description: '65" OLED, Smart TV, HDR' },
  { name: 'LG 55" Smart TV', sku: 'LG55-SMART', price: 2200000, cost_price: 1800000, stock: 18, category: 'TVs', description: '55" LED, WebOS, 4K' },
  { name: 'AirPods Pro 2nd Gen', sku: 'APP-2GEN', price: 950000, cost_price: 750000, stock: 35, category: 'Audio', description: 'Active Noise Cancellation, USB-C' },
  { name: 'Sony WH-1000XM5', sku: 'SONY-WH1000XM5', price: 1450000, cost_price: 1200000, stock: 22, category: 'Audio', description: 'Wireless Noise Cancelling Headphones' },
  { name: 'Canon EOS R6', sku: 'CANON-R6', price: 9500000, cost_price: 8200000, stock: 5, category: 'Cameras', description: 'Mirrorless, 20.1MP, 4K Video' },
  { name: 'GoPro Hero 12', sku: 'GP-HERO12', price: 1850000, cost_price: 1500000, stock: 15, category: 'Cameras', description: '5.3K Video, Waterproof' },
  { name: 'PlayStation 5', sku: 'PS5-DISC', price: 2400000, cost_price: 2000000, stock: 12, category: 'Gaming', description: 'Disc Edition, 825GB SSD' },
  { name: 'Xbox Series X', sku: 'XBOX-SX', price: 2300000, cost_price: 1900000, stock: 10, category: 'Gaming', description: '1TB SSD, 4K Gaming' },
  { name: 'iPad Pro 12.9"', sku: 'IPAD-PRO-12', price: 4500000, cost_price: 3900000, stock: 14, category: 'Tablets', description: 'M2 Chip, 256GB, Space Gray' },
  { name: 'Samsung Galaxy Tab S9', sku: 'TAB-S9', price: 2800000, cost_price: 2400000, stock: 18, category: 'Tablets', description: '11", 128GB, WiFi' },
  { name: 'Apple Watch Series 9', sku: 'AW-S9-45', price: 1800000, cost_price: 1500000, stock: 25, category: 'Accessories', description: '45mm, GPS + Cellular' },
  { name: 'Samsung Smart Watch 6', sku: 'SW6-44', price: 1350000, cost_price: 1100000, stock: 20, category: 'Accessories', description: '44mm, Black' },
  { name: 'JBL Flip 6', sku: 'JBL-FLIP6', price: 450000, cost_price: 350000, stock: 40, category: 'Audio', description: 'Portable Bluetooth Speaker' },
  { name: 'Anker Power Bank 20000mAh', sku: 'ANK-PB20K', price: 180000, cost_price: 120000, stock: 60, category: 'Accessories', description: 'Fast Charging, USB-C PD' },
  { name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S', price: 380000, cost_price: 300000, stock: 30, category: 'Accessories', description: 'Wireless Mouse' },
  { name: 'Samsung 1TB SSD', sku: 'SAM-SSD-1TB', price: 450000, cost_price: 350000, stock: 45, category: 'Storage', description: 'Portable SSD, USB 3.2' },
  // Low stock items
  { name: 'Bose QuietComfort Ultra', sku: 'BOSE-QCU', price: 1650000, cost_price: 1350000, stock: 3, category: 'Audio', description: 'Premium ANC Headphones' },
  { name: 'DJI Mavic 3 Pro', sku: 'DJI-M3P', price: 8500000, cost_price: 7200000, stock: 2, category: 'Cameras', description: 'Professional Drone, 4/3 CMOS' },
  { name: 'Microsoft Surface Pro 9', sku: 'MSFT-SP9-I7', price: 5200000, cost_price: 4500000, stock: 4, category: 'Laptops', description: 'Intel i7, 16GB, 512GB' }
];

// Clothing Business Products
const clothingProducts = [
  { name: 'Men\'s Cotton Shirt - Blue', sku: 'MS-COT-BLU-L', price: 85000, cost_price: 45000, stock: 50, category: 'Men\'s Wear', description: 'Premium cotton, long sleeve, Size L' },
  { name: 'Men\'s Cotton Shirt - White', sku: 'MS-COT-WHT-M', price: 85000, cost_price: 45000, stock: 60, category: 'Men\'s Wear', description: 'Premium cotton, long sleeve, Size M' },
  { name: 'Men\'s Jeans - Dark Blue', sku: 'MJ-DEN-DBL-32', price: 120000, cost_price: 70000, stock: 40, category: 'Men\'s Wear', description: 'Denim, slim fit, Waist 32' },
  { name: 'Men\'s Jeans - Black', sku: 'MJ-DEN-BLK-34', price: 120000, cost_price: 70000, stock: 35, category: 'Men\'s Wear', description: 'Denim, slim fit, Waist 34' },
  { name: 'Men\'s Polo T-Shirt - Navy', sku: 'MP-POL-NAV-L', price: 65000, cost_price: 35000, stock: 70, category: 'Men\'s Wear', description: 'Cotton polo, Size L' },
  { name: 'Women\'s Floral Dress', sku: 'WD-FLO-RED-M', price: 150000, cost_price: 85000, stock: 30, category: 'Women\'s Wear', description: 'Summer dress, floral pattern, Size M' },
  { name: 'Women\'s Denim Jacket', sku: 'WJ-DEN-BLU-S', price: 180000, cost_price: 100000, stock: 25, category: 'Women\'s Wear', description: 'Classic denim jacket, Size S' },
  { name: 'Women\'s Blouse - White', sku: 'WB-SLK-WHT-M', price: 95000, cost_price: 50000, stock: 45, category: 'Women\'s Wear', description: 'Silk blend, elegant, Size M' },
  { name: 'Women\'s Yoga Pants', sku: 'WY-STR-BLK-M', price: 75000, cost_price: 40000, stock: 55, category: 'Sportswear', description: 'Stretchy, breathable, Size M' },
  { name: 'Women\'s Evening Gown', sku: 'WG-EVE-BLK-L', price: 350000, cost_price: 200000, stock: 15, category: 'Women\'s Wear', description: 'Elegant black gown, Size L' },
  { name: 'Kids T-Shirt - Cartoon', sku: 'KT-CAR-RED-8Y', price: 35000, cost_price: 18000, stock: 80, category: 'Kids Wear', description: 'Cotton, cartoon print, Age 8' },
  { name: 'Kids Jeans - Blue', sku: 'KJ-DEN-BLU-10Y', price: 55000, cost_price: 30000, stock: 60, category: 'Kids Wear', description: 'Comfortable fit, Age 10' },
  { name: 'Kids Dress - Pink', sku: 'KD-COT-PNK-6Y', price: 65000, cost_price: 35000, stock: 40, category: 'Kids Wear', description: 'Cotton summer dress, Age 6' },
  { name: 'Men\'s Sneakers - White', sku: 'SN-SPT-WHT-42', price: 180000, cost_price: 110000, stock: 35, category: 'Shoes', description: 'Sports sneakers, Size 42' },
  { name: 'Men\'s Formal Shoes - Black', sku: 'SF-FOR-BLK-43', price: 250000, cost_price: 150000, stock: 28, category: 'Shoes', description: 'Leather formal shoes, Size 43' },
  { name: 'Women\'s Heels - Red', sku: 'SH-HEL-RED-38', price: 220000, cost_price: 130000, stock: 22, category: 'Shoes', description: 'High heels, Size 38' },
  { name: 'Women\'s Sandals - Brown', sku: 'SS-SAN-BRN-37', price: 95000, cost_price: 55000, stock: 40, category: 'Shoes', description: 'Leather sandals, Size 37' },
  { name: 'Leather Handbag - Brown', sku: 'HB-LEA-BRN', price: 280000, cost_price: 160000, stock: 18, category: 'Bags', description: 'Genuine leather, spacious' },
  { name: 'Canvas Backpack - Black', sku: 'BP-CAN-BLK', price: 120000, cost_price: 70000, stock: 35, category: 'Bags', description: 'Durable canvas, laptop compartment' },
  { name: 'Sports Jacket - Navy', sku: 'SJ-POL-NAV-L', price: 220000, cost_price: 130000, stock: 30, category: 'Sportswear', description: 'Water resistant, Size L' },
  { name: 'Winter Coat - Grey', sku: 'WC-WOL-GRY-XL', price: 450000, cost_price: 280000, stock: 15, category: 'Men\'s Wear', description: 'Wool blend, warm, Size XL' },
  { name: 'Scarf - Multi Color', sku: 'SC-SLK-MUL', price: 45000, cost_price: 25000, stock: 65, category: 'Accessories', description: 'Silk blend, elegant' },
  { name: 'Belt - Leather Brown', sku: 'BT-LEA-BRN', price: 55000, cost_price: 30000, stock: 50, category: 'Accessories', description: 'Genuine leather, adjustable' },
  // Low stock items
  { name: 'Designer Suit - Charcoal', sku: 'MS-SUT-CHR-L', price: 850000, cost_price: 550000, stock: 3, category: 'Men\'s Wear', description: 'Premium wool, 3-piece, Size L' },
  { name: 'Luxury Handbag - Designer', sku: 'HB-LUX-BLK', price: 1200000, cost_price: 800000, stock: 2, category: 'Bags', description: 'Designer brand, limited edition' },
  { name: 'Bridal Gown - White', sku: 'WG-BRI-WHT-M', price: 1500000, cost_price: 950000, stock: 4, category: 'Women\'s Wear', description: 'Elegant wedding gown, Size M' }
];

// Electronics Business Customers
const electronicsCustomers = [
  { name: 'TechHub Uganda Ltd', email: 'info@techhub.ug', phone: '+256701234567', address: 'Plot 10, Kampala Road, Kampala' },
  { name: 'Digital Solutions Center', email: 'sales@digitalsolutions.ug', phone: '+256702345678', address: 'Ntinda, Kampala' },
  { name: 'Smart Electronics', email: 'contact@smartelectronics.com', phone: '+256703456789', address: 'Garden City Mall, Kampala' },
  { name: 'Mobile World Uganda', email: 'orders@mobileworld.ug', phone: '+256704567890', address: 'Oasis Mall, Kampala' },
  { name: 'Gadget Galaxy', email: 'info@gadgetgalaxy.com', phone: '+256705678901', address: 'Acacia Mall, Kampala' },
  { name: 'Tech Paradise Ltd', email: 'sales@techparadise.ug', phone: '+256706789012', address: 'Lugogo Mall, Kampala' },
  { name: 'Innovation Hub', email: 'hub@innovation.ug', phone: '+256707890123', address: 'Bukoto, Kampala' },
  { name: 'Future Tech Solutions', email: 'future@techsolutions.com', phone: '+256708901234', address: 'Kololo, Kampala' }
];

// Clothing Business Customers
const clothingCustomers = [
  { name: 'Fashion Boutique Kampala', email: 'fashion@boutique.ug', phone: '+256711234567', address: 'Plot 5, Buganda Road, Kampala' },
  { name: 'Style Plus Uganda', email: 'style@plus.ug', phone: '+256712345678', address: 'Garden City, Kampala' },
  { name: 'Trendy Wear Ltd', email: 'info@trendywear.com', phone: '+256713456789', address: 'Oasis Mall, Kampala' },
  { name: 'Elite Fashion House', email: 'elite@fashion.ug', phone: '+256714567890', address: 'Acacia Avenue, Kampala' },
  { name: 'Urban Style Center', email: 'urban@style.com', phone: '+256715678901', address: 'Ntinda Complex, Kampala' },
  { name: 'Kids & Family Store', email: 'kids@family.ug', phone: '+256716789012', address: 'Nakawa, Kampala' },
  { name: 'Gentleman\'s Collection', email: 'gents@collection.com', phone: '+256717890123', address: 'Kololo, Kampala' },
  { name: 'Ladies Corner Boutique', email: 'ladies@corner.ug', phone: '+256718901234', address: 'Bugolobi, Kampala' }
];

async function createCompanyAndData(db, companyData, products, customers) {
  const { companyName, businessType, email, phone, adminUsername, adminEmail, adminPassword } = companyData;
  
  console.log(`\n📦 Creating ${companyName}...`);
  
  // Create company
  const company = {
    company_name: companyName,
    business_type: businessType,
    email: email,
    phone: phone || '',
    address: '',
    industry_features: getIndustryFeatures(businessType),
    status: 'active',
    subscription_plan: 'trial',
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    created_at: new Date(),
    updated_at: new Date()
  };
  
  const companyResult = await db.collection('companies').insertOne(company);
  const companyId = companyResult.insertedId;
  console.log(`✅ Company created: ${companyName} (ID: ${companyId})`);
  
  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminUser = {
    company_id: companyId,
    username: adminUsername,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  };
  
  const userResult = await db.collection('users').insertOne(adminUser);
  console.log(`✅ Admin user created: ${adminUsername}`);
  
  // Insert products
  console.log(`📦 Adding ${products.length} products...`);
  const productsToInsert = products.map(p => {
    const sellingPrice = parseFloat(p.price) || 0;
    const costPrice = parseFloat(p.cost_price) || 0;
    const profit = sellingPrice - costPrice;
    const profitMargin = sellingPrice > 0 ? ((profit / sellingPrice) * 100) : 0;
    
    return {
      company_id: companyId,
      user_id: userResult.insertedId,
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category: p.category || '',
      unit_price: Decimal128.fromString(String(sellingPrice)),
      cost_price: Decimal128.fromString(String(costPrice)),
      profit: Decimal128.fromString(String(profit)),
      profit_margin: profitMargin,
      quantity_in_stock: parseInt(p.stock) || 0,
      low_stock_threshold: 10,
      created_at: new Date(),
      updated_at: new Date()
    };
  });
  
  await db.collection('products').insertMany(productsToInsert);
  console.log(`✅ Added ${products.length} products`);
  
  // Insert customers
  console.log(`👥 Adding ${customers.length} customers...`);
  const customersToInsert = customers.map(c => ({
    company_id: companyId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    created_at: new Date(),
    updated_at: new Date()
  }));
  
  await db.collection('customers').insertMany(customersToInsert);
  console.log(`✅ Added ${customers.length} customers`);
  
  // Create sample sales
  const allProducts = await db.collection('products').find({ company_id: companyId }).toArray();
  const allCustomers = await db.collection('customers').find({ company_id: companyId }).toArray();
  
  console.log(`🛒 Creating sample sales orders...`);
  const salesOrders = [];
  const now = new Date();
  
  for (let i = 0; i < 15; i++) {
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    const items = [];
    let totalAmount = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = allProducts[Math.floor(Math.random() * allProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      const unitPrice = parseFloat(product.unit_price.toString());
      const amount = unitPrice * quantity;
      totalAmount += amount;
      
      items.push({
        product_id: product._id.toString(),
        product_name: product.name,
        quantity: quantity,
        unit_price: Decimal128.fromString(String(unitPrice)),
        total: Decimal128.fromString(String(amount))
      });
    }
    
    const daysAgo = Math.floor(Math.random() * 30);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    
    salesOrders.push({
      company_id: companyId,
      customer_id: customer._id.toString(),
      customer_name: customer.name,
      items: items,
      total_amount: Decimal128.fromString(String(totalAmount)),
      status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)],
      created_at: orderDate,
      updated_at: orderDate
    });
  }
  
  await db.collection('sales').insertMany(salesOrders);
  console.log(`✅ Created ${salesOrders.length} sales orders`);
  
  return { companyId, adminEmail };
}

function getIndustryFeatures(businessType) {
  const features = {
    electronics: {
      categories: ['Mobile Phones', 'Laptops', 'TVs', 'Audio', 'Cameras', 'Gaming', 'Tablets', 'Accessories', 'Storage'],
      attributes: ['Brand', 'Model', 'Warranty Period', 'Serial Number', 'Color', 'Storage Capacity'],
      uom: ['Unit', 'Box', 'Set'],
      features: ['Warranty Tracking', 'Serial Number Management', 'Supplier Management']
    },
    fashion: {
      categories: ['Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Shoes', 'Bags', 'Accessories', 'Sportswear'],
      attributes: ['Size', 'Color', 'Material', 'Brand', 'Season', 'Gender', 'Style'],
      uom: ['Piece', 'Pair', 'Set', 'Dozen'],
      features: ['Size & Color Variants', 'Seasonal Collections', 'Fashion Trends']
    }
  };
  
  return features[businessType] || features.electronics;
}

async function seedTwoBusinesses() {
  const client = new MongoClient(MONGODB_URL);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    console.log('✅ Connected successfully!\n');
    
    // Clear existing test data (optional - be careful in production!)
    console.log('🗑️  Clearing old test data...');
    await db.collection('companies').deleteMany({ 
      company_name: { $in: ['TechGadgets Electronics', 'Fashion Forward Boutique'] } 
    });
    await db.collection('users').deleteMany({ 
      email: { $in: ['admin@techgadgets.com', 'admin@fashionforward.com'] } 
    });
    console.log('✅ Cleared old data\n');
    
    // Create Electronics Business
    const electronicsCompany = {
      companyName: 'TechGadgets Electronics',
      businessType: 'electronics',
      email: 'info@techgadgets.com',
      phone: '+256700123456',
      adminUsername: 'electronics_admin',
      adminEmail: 'admin@techgadgets.com',
      adminPassword: 'Electronics@2025'
    };
    
    const electronics = await createCompanyAndData(
      db, 
      electronicsCompany, 
      electronicsProducts, 
      electronicsCustomers
    );
    
    // Create Clothing Business
    const clothingCompany = {
      companyName: 'Fashion Forward Boutique',
      businessType: 'fashion',
      email: 'info@fashionforward.com',
      phone: '+256700654321',
      adminUsername: 'fashion_admin',
      adminEmail: 'admin@fashionforward.com',
      adminPassword: 'Fashion@2025'
    };
    
    const clothing = await createCompanyAndData(
      db, 
      clothingCompany, 
      clothingProducts, 
      clothingCustomers
    );
    
    console.log('\n\n🎉 SUCCESS! Two businesses created with test data\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 BUSINESS 1 - ELECTRONICS');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Company: ${electronicsCompany.companyName}`);
    console.log(`Login Email: ${electronics.adminEmail}`);
    console.log(`Password: ${electronicsCompany.adminPassword}`);
    console.log(`Products: ${electronicsProducts.length} electronics items`);
    console.log(`Customers: ${electronicsCustomers.length} customers`);
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 BUSINESS 2 - CLOTHING');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Company: ${clothingCompany.companyName}`);
    console.log(`Login Email: ${clothing.adminEmail}`);
    console.log(`Password: ${clothingCompany.adminPassword}`);
    console.log(`Products: ${clothingProducts.length} clothing items`);
    console.log(`Customers: ${clothingCustomers.length} customers`);
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed script
seedTwoBusinesses();
