import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'https://sap-business-management-software.koyeb.app/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let authToken = null;
let testCompanyId = null;
let testProductId = null;
let testCustomerId = null;
let testSalesOrderId = null;
let testInvoiceId = null;
let testExpenseId = null;

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log('✅', message, colors.green);
}

function logError(message) {
  log('❌', message, colors.red);
}

function logInfo(message) {
  log('ℹ️', message, colors.blue);
}

function logWarning(message) {
  log('⚠️', message, colors.yellow);
}

async function testEndpoint(name, method, endpoint, body = null, requiresAuth = true) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requiresAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (response.ok) {
      logSuccess(`${name}: ${response.status}`);
      return { success: true, data, status: response.status };
    } else {
      logError(`${name}: ${response.status} - ${data.error || JSON.stringify(data)}`);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    logError(`${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  logInfo('🧪 TESTING SAP BUSINESS MANAGEMENT SYSTEM');
  console.log('='.repeat(60) + '\n');

  // ==================== AUTHENTICATION ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('1️⃣  AUTHENTICATION TESTS');
  console.log('─'.repeat(60));

  // Test Login
  const loginResult = await testEndpoint(
    'Login with test account',
    'POST',
    '/auth/login',
    { email: 'test@sbms.com', password: 'Test@2025' },
    false
  );

  if (loginResult.success) {
    authToken = loginResult.data.token;
    testCompanyId = loginResult.data.user?.company_id;
    logInfo(`Token received: ${authToken.substring(0, 20)}...`);
    logInfo(`Company ID: ${testCompanyId}`);
  } else {
    logError('Login failed - cannot proceed with tests');
    return;
  }

  // ==================== PRODUCTS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('2️⃣  PRODUCTS TESTS');
  console.log('─'.repeat(60));

  // Create Product
  const productData = {
    name: `Test Product ${Date.now()}`,
    sku: `SKU-${Date.now()}`,
    description: 'Test product for automated testing',
    price: 99.99,
    cost_price: 50.00,
    quantity: 100,
    low_stock_threshold: 10
  };

  const createProductResult = await testEndpoint(
    'Create Product',
    'POST',
    '/products',
    productData
  );

  if (createProductResult.success) {
    testProductId = createProductResult.data._id || createProductResult.data.id;
    logInfo(`Product ID: ${testProductId}`);
  }

  // Get All Products
  await testEndpoint('Get All Products', 'GET', '/products?page=1&limit=10');

  // Get Product by ID
  if (testProductId) {
    await testEndpoint('Get Product by ID', 'GET', `/products/${testProductId}`);
  }

  // Update Product
  if (testProductId) {
    await testEndpoint(
      'Update Product',
      'PUT',
      `/products/${testProductId}`,
      { ...productData, price: 109.99, quantity: 150 }
    );
  }

  // ==================== CUSTOMERS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('3️⃣  CUSTOMERS TESTS');
  console.log('─'.repeat(60));

  // Create Customer
  const customerData = {
    name: `Test Customer ${Date.now()}`,
    email: `customer${Date.now()}@test.com`,
    phone: '+1234567890',
    address: '123 Test Street, Test City',
    company: 'Test Company Inc'
  };

  const createCustomerResult = await testEndpoint(
    'Create Customer',
    'POST',
    '/customers',
    customerData
  );

  if (createCustomerResult.success) {
    testCustomerId = createCustomerResult.data._id || createCustomerResult.data.id;
    logInfo(`Customer ID: ${testCustomerId}`);
  }

  // Get All Customers
  await testEndpoint('Get All Customers', 'GET', '/customers?page=1&limit=10');

  // Get Customer by ID
  if (testCustomerId) {
    await testEndpoint('Get Customer by ID', 'GET', `/customers/${testCustomerId}`);
  }

  // ==================== SALES ORDERS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('4️⃣  SALES ORDERS TESTS');
  console.log('─'.repeat(60));

  // Create Sales Order
  if (testCustomerId && testProductId) {
    const salesOrderData = {
      customer_id: testCustomerId,
      items: [
        {
          product_id: testProductId,
          quantity: 2,
          unit_price: 99.99
        }
      ],
      payment_method: 'cash',
      payment_status: 'paid',
      notes: 'Test sales order'
    };

    const createSalesResult = await testEndpoint(
      'Create Sales Order',
      'POST',
      '/sales',
      salesOrderData
    );

    if (createSalesResult.success) {
      testSalesOrderId = createSalesResult.data._id || createSalesResult.data.id;
      logInfo(`Sales Order ID: ${testSalesOrderId}`);
    }
  } else {
    logWarning('Skipping Sales Order - missing customer or product');
  }

  // Get All Sales Orders
  await testEndpoint('Get All Sales Orders', 'GET', '/sales?page=1&limit=10');

  // Get Sales Order by ID
  if (testSalesOrderId) {
    await testEndpoint('Get Sales Order by ID', 'GET', `/sales/${testSalesOrderId}`);
  }

  // ==================== INVOICES ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('5️⃣  INVOICES TESTS');
  console.log('─'.repeat(60));

  // Generate Invoice from Sales Order
  if (testSalesOrderId) {
    const invoiceData = {
      sale_id: testSalesOrderId,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const createInvoiceResult = await testEndpoint(
      'Generate Invoice',
      'POST',
      '/invoices/generate',
      invoiceData
    );

    if (createInvoiceResult.success) {
      testInvoiceId = createInvoiceResult.data._id || createInvoiceResult.data.id;
      logInfo(`Invoice ID: ${testInvoiceId}`);
    }
  } else {
    logWarning('Skipping Invoice - no sales order available');
  }

  // Get All Invoices
  await testEndpoint('Get All Invoices', 'GET', '/invoices?page=1&limit=10');

  // Get Invoice by ID
  if (testInvoiceId) {
    await testEndpoint('Get Invoice by ID', 'GET', `/invoices/${testInvoiceId}`);
  }

  // ==================== EXPENSES ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('6️⃣  EXPENSES TESTS');
  console.log('─'.repeat(60));

  // Create Expense
  const expenseData = {
    category: 'Office Supplies',
    amount: 150.00,
    description: 'Test expense for office supplies',
    date: new Date().toISOString(),
    payment_method: 'credit_card'
  };

  const createExpenseResult = await testEndpoint(
    'Create Expense',
    'POST',
    '/expenses',
    expenseData
  );

  if (createExpenseResult.success) {
    testExpenseId = createExpenseResult.data.data?._id || createExpenseResult.data.data?.id;
    logInfo(`Expense ID: ${testExpenseId}`);
  }

  // Get All Expenses
  await testEndpoint('Get All Expenses', 'GET', '/expenses?page=1&limit=10');

  // Get Expenses Summary
  await testEndpoint('Get Expenses Summary', 'GET', '/expenses/summary');

  // ==================== RETURNS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('7️⃣  RETURNS TESTS');
  console.log('─'.repeat(60));

  // Get All Returns
  await testEndpoint('Get All Returns', 'GET', '/returns?page=1&limit=10');

  // ==================== USERS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('8️⃣  USERS MANAGEMENT TESTS');
  console.log('─'.repeat(60));

  // Get All Users
  await testEndpoint('Get All Users', 'GET', '/users');

  // Get Current User Profile
  await testEndpoint('Get User Profile', 'GET', '/auth/me');

  // ==================== NOTIFICATIONS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('9️⃣  NOTIFICATIONS TESTS');
  console.log('─'.repeat(60));

  // Get Notifications
  await testEndpoint('Get Notifications', 'GET', '/notifications?limit=20');

  // Get Unread Count
  await testEndpoint('Get Unread Count', 'GET', '/notifications/unread-count');

  // ==================== ANALYTICS & REPORTS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('🔟 ANALYTICS & REPORTS TESTS');
  console.log('─'.repeat(60));

  // Dashboard Stats
  await testEndpoint('Get Dashboard Stats', 'GET', '/analytics/dashboard-stats');

  // Sales Trend
  await testEndpoint('Get Sales Trend', 'GET', '/reports/sales-trend');

  // Low Stock Report
  await testEndpoint('Get Low Stock Report', 'GET', '/reports/low-stock');

  // Sales Summary
  await testEndpoint('Get Sales Summary', 'GET', '/reports/sales-summary');

  // Top Products
  await testEndpoint('Get Top Products', 'GET', '/reports/top-products?limit=10');

  // ==================== COMPANY ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('1️⃣1️⃣  COMPANY TESTS');
  console.log('─'.repeat(60));

  // Get Company Profile
  await testEndpoint('Get Company Profile', 'GET', '/company/me');

  // Get Company Settings
  await testEndpoint('Get Company Settings', 'GET', '/company/settings');

  // ==================== AUDIT LOGS ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('1️⃣2️⃣  AUDIT LOGS TESTS');
  console.log('─'.repeat(60));

  // Get Audit Logs
  await testEndpoint('Get Audit Logs', 'GET', '/audit-logs?page=1&limit=10');

  // ==================== BACKUP ====================
  console.log('\n' + '─'.repeat(60));
  logInfo('1️⃣3️⃣  BACKUP TESTS');
  console.log('─'.repeat(60));

  // Get Backup List
  await testEndpoint('Get Backups', 'GET', '/backup');

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(60));
  logInfo('✨ TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  logInfo(`Test completed at: ${new Date().toLocaleString()}`);
  logInfo(`API URL: ${API_URL}`);
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run all tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
