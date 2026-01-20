import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;

// Diverse Business Templates
const businessTemplates = [
  {
    name: 'Elite Plumbing Services Ltd',
    type: 'plumbing',
    industry: 'Construction & Maintenance',
    email: 'contact@eliteplumbing.com',
    phone: '+256700123456',
    address: 'Plot 45, Industrial Area, Kampala',
    adminUsername: 'plumbing_admin',
    adminEmail: 'admin@eliteplumbing.com',
    adminPassword: 'Plumbing@2025',
    products: [
      { name: 'PVC Pipe 1/2 inch', category: 'Pipes', price: 5000, stock: 500, reorder_level: 50 },
      { name: 'PVC Pipe 3/4 inch', category: 'Pipes', price: 7500, stock: 400, reorder_level: 50 },
      { name: 'PVC Pipe 1 inch', category: 'Pipes', price: 10000, stock: 350, reorder_level: 40 },
      { name: 'Copper Pipe 15mm', category: 'Pipes', price: 25000, stock: 200, reorder_level: 30 },
      { name: 'Copper Pipe 22mm', category: 'Pipes', price: 35000, stock: 150, reorder_level: 25 },
      { name: 'Basin Mixer Tap', category: 'Faucets', price: 85000, stock: 60, reorder_level: 10 },
      { name: 'Kitchen Sink Mixer', category: 'Faucets', price: 120000, stock: 45, reorder_level: 8 },
      { name: 'Shower Head Chrome', category: 'Bathroom', price: 95000, stock: 80, reorder_level: 15 },
      { name: 'Toilet Seat White', category: 'Bathroom', price: 65000, stock: 100, reorder_level: 20 },
      { name: 'Hand Basin Ceramic', category: 'Bathroom', price: 150000, stock: 50, reorder_level: 10 },
      { name: 'Kitchen Sink Stainless', category: 'Kitchen', price: 180000, stock: 40, reorder_level: 8 },
      { name: 'Water Heater 50L', category: 'Appliances', price: 450000, stock: 25, reorder_level: 5 },
      { name: 'Water Heater 100L', category: 'Appliances', price: 650000, stock: 15, reorder_level: 3 },
      { name: 'Pipe Wrench 14 inch', category: 'Tools', price: 35000, stock: 30, reorder_level: 5 },
      { name: 'Pipe Cutter', category: 'Tools', price: 45000, stock: 25, reorder_level: 5 },
      { name: 'Plunger Heavy Duty', category: 'Tools', price: 15000, stock: 100, reorder_level: 20 },
      { name: 'Drain Snake 10m', category: 'Tools', price: 75000, stock: 20, reorder_level: 5 },
      { name: 'Teflon Tape Roll', category: 'Materials', price: 2000, stock: 500, reorder_level: 100 },
      { name: 'PVC Cement 250ml', category: 'Materials', price: 8000, stock: 200, reorder_level: 40 },
      { name: 'Pipe Elbow 90° 1/2 inch', category: 'Fittings', price: 1500, stock: 800, reorder_level: 150 }
    ]
  },
  {
    name: 'Crystal Pure Water Solutions',
    type: 'water',
    industry: 'Water Treatment & Supply',
    email: 'info@crystalpure.com',
    phone: '+256700234567',
    address: 'Plot 78, Ntinda, Kampala',
    adminUsername: 'water_admin',
    adminEmail: 'admin@crystalpure.com',
    adminPassword: 'Water@2025',
    products: [
      { name: 'Water Dispenser Stand', category: 'Equipment', price: 120000, stock: 50, reorder_level: 10 },
      { name: 'Water Dispenser Hot/Cold', category: 'Equipment', price: 350000, stock: 30, reorder_level: 8 },
      { name: 'Water Filter Cartridge', category: 'Filters', price: 45000, stock: 200, reorder_level: 40 },
      { name: 'Reverse Osmosis System', category: 'Systems', price: 1800000, stock: 15, reorder_level: 3 },
      { name: 'UV Water Purifier', category: 'Systems', price: 850000, stock: 20, reorder_level: 5 },
      { name: 'Water Tank 500L', category: 'Storage', price: 380000, stock: 25, reorder_level: 5 },
      { name: 'Water Tank 1000L', category: 'Storage', price: 650000, stock: 15, reorder_level: 3 },
      { name: 'Water Pump 0.5HP', category: 'Pumps', price: 280000, stock: 40, reorder_level: 8 },
      { name: 'Water Pump 1HP', category: 'Pumps', price: 450000, stock: 30, reorder_level: 6 },
      { name: 'Water Bottle 20L', category: 'Containers', price: 25000, stock: 500, reorder_level: 100 },
      { name: 'Water Testing Kit', category: 'Testing', price: 95000, stock: 50, reorder_level: 10 },
      { name: 'Chlorine Tablets 100pcs', category: 'Chemicals', price: 35000, stock: 100, reorder_level: 20 },
      { name: 'Water Softener Salt 25kg', category: 'Chemicals', price: 55000, stock: 80, reorder_level: 15 },
      { name: 'Pressure Gauge', category: 'Accessories', price: 18000, stock: 60, reorder_level: 12 },
      { name: 'Water Hose 20m', category: 'Accessories', price: 45000, stock: 70, reorder_level: 15 }
    ]
  },
  {
    name: 'Premium Salon & Spa',
    type: 'salon',
    industry: 'Beauty & Wellness',
    email: 'info@premiumsalon.com',
    phone: '+256700345678',
    address: 'Acacia Mall, Kololo, Kampala',
    adminUsername: 'salon_admin',
    adminEmail: 'admin@premiumsalon.com',
    adminPassword: 'Salon@2025',
    products: [
      { name: 'Hair Dryer Professional', category: 'Equipment', price: 280000, stock: 15, reorder_level: 3 },
      { name: 'Hair Straightener Ceramic', category: 'Equipment', price: 150000, stock: 20, reorder_level: 5 },
      { name: 'Salon Chair Hydraulic', category: 'Furniture', price: 650000, stock: 10, reorder_level: 2 },
      { name: 'Shampoo Premium 1L', category: 'Hair Care', price: 85000, stock: 100, reorder_level: 20 },
      { name: 'Conditioner Premium 1L', category: 'Hair Care', price: 85000, stock: 80, reorder_level: 15 },
      { name: 'Hair Color Black', category: 'Color', price: 35000, stock: 120, reorder_level: 25 },
      { name: 'Hair Color Brown', category: 'Color', price: 35000, stock: 100, reorder_level: 20 },
      { name: 'Hair Color Blonde', category: 'Color', price: 42000, stock: 80, reorder_level: 15 },
      { name: 'Manicure Set Professional', category: 'Nail Care', price: 120000, stock: 25, reorder_level: 5 },
      { name: 'Pedicure Spa Chair', category: 'Furniture', price: 1800000, stock: 5, reorder_level: 1 },
      { name: 'Nail Polish Set 12pc', category: 'Nail Care', price: 75000, stock: 50, reorder_level: 10 },
      { name: 'Facial Steamer', category: 'Equipment', price: 350000, stock: 8, reorder_level: 2 },
      { name: 'Massage Oil 500ml', category: 'Spa', price: 45000, stock: 60, reorder_level: 12 },
      { name: 'Face Mask Clay 500g', category: 'Skincare', price: 55000, stock: 80, reorder_level: 15 },
      { name: 'Styling Gel 500ml', category: 'Styling', price: 28000, stock: 150, reorder_level: 30 }
    ]
  },
  {
    name: 'AutoCare Service Center',
    type: 'automotive',
    industry: 'Automotive Services',
    email: 'service@autocare.com',
    phone: '+256700456789',
    address: 'Plot 23, Jinja Road, Kampala',
    adminUsername: 'auto_admin',
    adminEmail: 'admin@autocare.com',
    adminPassword: 'Auto@2025',
    products: [
      { name: 'Engine Oil 5W-30 5L', category: 'Lubricants', price: 85000, stock: 200, reorder_level: 40 },
      { name: 'Engine Oil 10W-40 5L', category: 'Lubricants', price: 75000, stock: 180, reorder_level: 35 },
      { name: 'Brake Pad Set Front', category: 'Brakes', price: 120000, stock: 100, reorder_level: 20 },
      { name: 'Brake Pad Set Rear', category: 'Brakes', price: 95000, stock: 90, reorder_level: 18 },
      { name: 'Air Filter', category: 'Filters', price: 35000, stock: 150, reorder_level: 30 },
      { name: 'Oil Filter', category: 'Filters', price: 25000, stock: 200, reorder_level: 40 },
      { name: 'Spark Plug Set 4pc', category: 'Ignition', price: 45000, stock: 120, reorder_level: 25 },
      { name: 'Car Battery 12V 70Ah', category: 'Electrical', price: 380000, stock: 50, reorder_level: 10 },
      { name: 'Wiper Blade Pair', category: 'Accessories', price: 28000, stock: 180, reorder_level: 35 },
      { name: 'Car Shampoo 5L', category: 'Cleaning', price: 45000, stock: 100, reorder_level: 20 },
      { name: 'Tire 195/65R15', category: 'Tires', price: 280000, stock: 80, reorder_level: 15 },
      { name: 'Wheel Alignment Service', category: 'Services', price: 50000, stock: 999, reorder_level: 0 },
      { name: 'Full Car Wash', category: 'Services', price: 25000, stock: 999, reorder_level: 0 },
      { name: 'Oil Change Service', category: 'Services', price: 35000, stock: 999, reorder_level: 0 }
    ]
  },
  {
    name: 'BuildMart Hardware Store',
    type: 'hardware',
    industry: 'Construction & Hardware',
    email: 'sales@buildmart.com',
    phone: '+256700567890',
    address: 'Plot 156, Bombo Road, Kampala',
    adminUsername: 'hardware_admin',
    adminEmail: 'admin@buildmart.com',
    adminPassword: 'Hardware@2025',
    products: [
      { name: 'Cement 50kg Bag', category: 'Building Materials', price: 38000, stock: 500, reorder_level: 100 },
      { name: 'Iron Sheets 30 Gauge', category: 'Roofing', price: 45000, stock: 300, reorder_level: 50 },
      { name: 'Iron Sheets 28 Gauge', category: 'Roofing', price: 52000, stock: 250, reorder_level: 40 },
      { name: 'Paint 20L White', category: 'Paint', price: 180000, stock: 100, reorder_level: 20 },
      { name: 'Paint 20L Assorted', category: 'Paint', price: 195000, stock: 80, reorder_level: 15 },
      { name: 'Steel Door Frame', category: 'Doors', price: 280000, stock: 60, reorder_level: 12 },
      { name: 'Wooden Door Flush', category: 'Doors', price: 350000, stock: 40, reorder_level: 8 },
      { name: 'Window Frame Aluminum', category: 'Windows', price: 180000, stock: 70, reorder_level: 15 },
      { name: 'Tiles 60x60cm Box', category: 'Flooring', price: 120000, stock: 200, reorder_level: 40 },
      { name: 'Hammer 500g', category: 'Tools', price: 15000, stock: 150, reorder_level: 30 },
      { name: 'Drill Machine Electric', category: 'Power Tools', price: 280000, stock: 30, reorder_level: 6 },
      { name: 'Saw Hand', category: 'Tools', price: 25000, stock: 100, reorder_level: 20 },
      { name: 'Nails 2 inch 1kg', category: 'Fasteners', price: 8000, stock: 400, reorder_level: 80 },
      { name: 'Screws Assorted 1kg', category: 'Fasteners', price: 12000, stock: 350, reorder_level: 70 },
      { name: 'Wheelbarrow Heavy Duty', category: 'Equipment', price: 185000, stock: 50, reorder_level: 10 }
    ]
  }
];

async function seedDiverseBusinesses() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const db = mongoose.connection.db;

    // Clear existing business data (keep super admin)
    console.log('\n🗑️  Clearing old business data...');
    await db.collection('companies').deleteMany({});
    await db.collection('users').deleteMany({ role: { $ne: 'superadmin' } });
    await db.collection('products').deleteMany({});
    await db.collection('customers').deleteMany({});
    await db.collection('sales').deleteMany({});
    console.log('✅ Cleared old data\n');

    // Create diverse businesses
    for (const template of businessTemplates) {
      console.log(`\n📦 Creating ${template.name}...`);
      
      // Create company
      const company = {
        name: template.name,
        business_type: template.type,
        industry: template.industry,
        email: template.email,
        phone: template.phone,
        address: template.address,
        status: 'active',
        subscription_plan: 'premium',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const companyResult = await db.collection('companies').insertOne(company);
      const companyId = companyResult.insertedId;
      console.log(`✅ Company created: ${template.name} (ID: ${companyId})`);
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(template.adminPassword, 10);
      const adminUser = {
        company_id: companyId,
        username: template.adminUsername,
        email: template.adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      await db.collection('users').insertOne(adminUser);
      console.log(`✅ Admin user created: ${template.adminUsername}`);
      
      // Insert products
      console.log(`📦 Adding ${template.products.length} products...`);
      const productsToInsert = template.products.map(p => ({
        company_id: companyId,
        name: p.name,
        category: p.category,
        selling_price: parseFloat(p.price),
        cost_price: parseFloat(p.price) * 0.7, // 30% markup
        stock_quantity: parseInt(p.stock),
        reorder_level: parseInt(p.reorder_level),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await db.collection('products').insertMany(productsToInsert);
      console.log(`✅ Added ${template.products.length} products`);
      
      // Create sample customers (8 per business)
      console.log('👥 Adding customers...');
      const customers = generateCustomers(template.type, companyId);
      await db.collection('customers').insertMany(customers);
      console.log(`✅ Added ${customers.length} customers`);
      
      // Create sample sales (10 per business)
      console.log('🛒 Creating sample sales...');
      const products = await db.collection('products').find({ company_id: companyId }).toArray();
      const sales = generateSales(companyId, customers, products, 10);
      await db.collection('sales').insertMany(sales);
      console.log(`✅ Created ${sales.length} sales orders`);
    }

    console.log('\n\n🎉 SUCCESS! All diverse businesses created with test data\n');
    
    // Print summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 BUSINESS SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');
    
    for (const template of businessTemplates) {
      console.log(`${template.name.toUpperCase()}`);
      console.log(`Industry: ${template.industry}`);
      console.log(`Username: ${template.adminUsername}`);
      console.log(`Email: ${template.adminEmail}`);
      console.log(`Password: ${template.adminPassword}`);
      console.log(`Products: ${template.products.length} items`);
      console.log('─'.repeat(50) + '\n');
    }
    
    console.log('═══════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Generate customers based on business type
function generateCustomers(businessType, companyId) {
  const customerTemplates = {
    plumbing: [
      { name: 'Green Hills Hotel', phone: '+256701234567', email: 'procurement@greenhills.com' },
      { name: 'Pearl Apartments Ltd', phone: '+256702345678', email: 'admin@pearlapts.com' },
      { name: 'City Mall Management', phone: '+256703456789', email: 'maintenance@citymall.ug' },
      { name: 'Royal Builders Uganda', phone: '+256704567890', email: 'supplies@royalbuilders.com' },
      { name: 'Modern Homes Real Estate', phone: '+256705678901', email: 'projects@modernhomes.ug' },
      { name: 'Paradise Resort', phone: '+256706789012', email: 'facilities@paradiseresort.com' },
      { name: 'Education Trust Schools', phone: '+256707890123', email: 'ops@edutrust.ug' },
      { name: 'Healthcare Plus Clinic', phone: '+256708901234', email: 'admin@healthcareplus.com' }
    ],
    water: [
      { name: 'Fresh Water Ltd', phone: '+256711234567', email: 'orders@freshwater.ug' },
      { name: 'Corporate Office Plaza', phone: '+256712345678', email: 'admin@corporateplaza.com' },
      { name: 'University Campus', phone: '+256713456789', email: 'facilities@university.ac.ug' },
      { name: 'Industrial Park Kampala', phone: '+256714567890', email: 'services@industrialpark.ug' },
      { name: 'Luxury Villas Estate', phone: '+256715678901', email: 'management@luxuryvillas.com' },
      { name: 'Sports Club Fitness', phone: '+256716789012', email: 'admin@sportsclub.ug' },
      { name: 'Hospital General', phone: '+256717890123', email: 'procurement@hospitalgn.com' },
      { name: 'Restaurant Chain Uganda', phone: '+256718901234', email: 'ops@restaurantchain.ug' }
    ],
    salon: [
      { name: 'Sarah Nakato', phone: '+256721234567', email: 'sarah.n@gmail.com' },
      { name: 'Linda Nambi', phone: '+256722345678', email: 'linda.nambi@yahoo.com' },
      { name: 'Grace Auma', phone: '+256723456789', email: 'grace.auma@outlook.com' },
      { name: 'Betty Kizza', phone: '+256724567890', email: 'betty.kizza@gmail.com' },
      { name: 'Juliet Nassanga', phone: '+256725678901', email: 'juliet.n@hotmail.com' },
      { name: 'Patricia Atim', phone: '+256726789012', email: 'patricia.atim@gmail.com' },
      { name: 'Rose Nansubuga', phone: '+256727890123', email: 'rose.n@yahoo.com' },
      { name: 'Agnes Akello', phone: '+256728901234', email: 'agnes.akello@gmail.com' }
    ],
    automotive: [
      { name: 'Delta Transport Services', phone: '+256731234567', email: 'fleet@deltatrsp.com' },
      { name: 'SafariCab Uganda', phone: '+256732345678', email: 'maintenance@safaricab.ug' },
      { name: 'Logistics Pro Limited', phone: '+256733456789', email: 'fleet@logisticspro.com' },
      { name: 'John Ssemakula', phone: '+256734567890', email: 'john.ssem@gmail.com' },
      { name: 'Corporate Fleet Solutions', phone: '+256735678901', email: 'service@corpfleet.ug' },
      { name: 'Peter Omondi', phone: '+256736789012', email: 'peter.omondi@yahoo.com' },
      { name: 'Express Deliveries Ltd', phone: '+256737890123', email: 'ops@expressdelivery.ug' },
      { name: 'David Mukasa', phone: '+256738901234', email: 'david.mukasa@gmail.com' }
    ],
    hardware: [
      { name: 'Prime Contractors Ltd', phone: '+256741234567', email: 'procurement@primecontract.com' },
      { name: 'BuildRight Construction', phone: '+256742345678', email: 'supplies@buildright.ug' },
      { name: 'Quality Builders Uganda', phone: '+256743456789', email: 'orders@qualitybuilders.com' },
      { name: 'Home Renovation Experts', phone: '+256744567890', email: 'materials@homereno.ug' },
      { name: 'Moses Kintu', phone: '+256745678901', email: 'moses.kintu@gmail.com' },
      { name: 'Skyline Developers', phone: '+256746789012', email: 'dev@skylinedev.com' },
      { name: 'Robert Waiswa', phone: '+256747890123', email: 'robert.w@yahoo.com' },
      { name: 'Vision Projects Ltd', phone: '+256748901234', email: 'projects@visionpr.ug' }
    ]
  };

  const customers = customerTemplates[businessType] || customerTemplates.hardware;
  
  return customers.map(c => ({
    company_id: companyId,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: 'Kampala, Uganda',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  }));
}

// Generate sales orders
function generateSales(companyId, customers, products, count) {
  const sales = [];
  const statuses = ['completed', 'pending'];
  const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit'];
  
  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
    const items = [];
    let totalAmount = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const itemTotal = product.selling_price * quantity;
      totalAmount += itemTotal;
      
      items.push({
        product_id: product._id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.selling_price,
        total_price: itemTotal
      });
    }
    
    const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - daysAgo);
    
    sales.push({
      company_id: companyId,
      order_number: `ORD-${Date.now()}-${i}`,
      customer_id: customer._id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      items: items,
      total_amount: totalAmount,
      payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: saleDate,
      updated_at: saleDate
    });
  }
  
  return sales;
}

seedDiverseBusinesses();
