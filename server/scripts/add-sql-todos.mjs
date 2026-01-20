#!/usr/bin/env node
/**
 * Phase 2: Convert MongoDB query operations to SQL
 * This handles .find(), .findOne(), .insertOne(), .updateOne(), .deleteOne(), etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

// MongoDB to SQL table mapping
const tableMapping = {
  users: 'users',
  companies: 'companies',
  products: 'products',
  customers: 'customers',
  sales_orders: 'sales',
  sales: 'sales',
  invoices: 'invoices',
  expenses: 'expenses',
  returns: 'returns',
  notifications: 'notifications',
  announcements: 'announcements',
  support_tickets: 'support_tickets',
  audit_logs: 'audit_logs',
  auditlogs: 'audit_logs',
  email_logs: 'email_logs',
  platform_settings: 'platform_settings',
  superadmins: 'superadmins',
  stock_transactions: 'stock_transactions'
};

function convertDbCollection(content) {
  let result = content;
  
  // Pattern: db.collection('table_name')
  Object.entries(tableMapping).forEach(([mongoName, sqlName]) => {
    const patterns = [
      `db.collection('${mongoName}')`,
      `db.collection("${mongoName}")`,
      `tenantDb.collection('${mongoName}')`,
      `tenantDb.collection("${mongoName}")`
    ];
    
    patterns.forEach(pattern => {
      if (result.includes(pattern)) {
        // We'll mark these for manual conversion
        result = result.replace(
          new RegExp(pattern.replace(/[()]/g, '\\$&'), 'g'),
          `/* TODO_SQL: ${sqlName} */`
        );
      }
    });
  });
  
  return result;
}

function addTodoComments(content) {
  let result = content;
  
  // Find patterns that need SQL conversion
  const conversions = [
    { pattern: /\.findOne\(/g, comment: '/* TODO: Convert .findOne() to SQL SELECT */\n    ' },
    { pattern: /\.find\([^)]*\)\.toArray\(/g, comment: '/* TODO: Convert .find().toArray() to SQL SELECT */\n    ' },
    { pattern: /\.insertOne\(/g, comment: '/* TODO: Convert .insertOne() to SQL INSERT */\n    ' },
    { pattern: /\.updateOne\(/g, comment: '/* TODO: Convert .updateOne() to SQL UPDATE */\n    ' },
    { pattern: /\.deleteOne\(/g, comment: '/* TODO: Convert .deleteOne() to SQL DELETE */\n    ' },
    { pattern: /\.deleteMany\(/g, comment: '/* TODO: Convert .deleteMany() to SQL DELETE */\n    ' },
    { pattern: /\.countDocuments\(/g, comment: '/* TODO: Convert .countDocuments() to SQL COUNT */\n    ' },
    { pattern: /\.aggregate\(/g, comment: '/* TODO: Convert .aggregate() to SQL with JOINs/GROUP BY */\n    ' },
    { pattern: /\.findOneAndUpdate\(/g, comment: '/* TODO: Convert .findOneAndUpdate() to SQL UPDATE + SELECT */\n    ' },
  ];
  
  conversions.forEach(({ pattern, comment }) => {
    // Only add comment if pattern exists and comment doesn't already exist
    if (result.match(pattern) && !result.includes(comment.trim())) {
      // Add comment before the first occurrence
      result = result.replace(pattern, (match) => comment + match);
    }
  });
  
  return result;
}

function processFile(filename) {
  const filePath = path.join(controllersDir, filename);
  
  if (!fs.existsSync(filePath)) return null;
  
  try {
    const original = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no MongoDB operations
    const mongoOps = ['.find(', '.findOne(', '.insertOne(', '.updateOne(', '.deleteOne(', '.aggregate(', 'db.collection'];
    const hasMongo = mongoOps.some(op => original.includes(op));
    
    if (!hasMongo) {
      return { skipped: true, reason: 'No MongoDB operations' };
    }
    
    let result = original;
    
    // Apply conversions
    result = convertDbCollection(result);
    result = addTodoComments(result);
    
    if (result !== original) {
      fs.writeFileSync(filePath, result);
      
      // Count TODOs added
      const todoCount = (result.match(/\/\* TODO/g) || []).length;
      
      return {
        converted: true,
        todos: todoCount
      };
    }
    
    return { noChanges: true };
  } catch (error) {
    return { error: error.message };
  }
}

console.log('🔄 Phase 2: Adding SQL Conversion TODOs\n');
console.log('=' .repeat(50) + '\n');

const files = fs.readdirSync(controllersDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.bak'));

const results = {
  converted: [],
  skipped: [],
  errors: []
};

files.forEach(filename => {
  const result = processFile(filename);
  
  if (!result) return;
  
  if (result.converted) {
    results.converted.push({ filename, todos: result.todos });
    console.log(`✓ ${filename} - ${result.todos} queries to convert`);
  } else if (result.skipped) {
    results.skipped.push(filename);
  } else if (result.error) {
    results.errors.push({ filename, error: result.error });
    console.log(`✗ ${filename}: ${result.error}`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`  Files with queries: ${results.converted.length}`);
console.log(`  Total queries to convert: ${results.converted.reduce((sum, r) => sum + r.todos, 0)}`);
console.log(`  Skipped: ${results.skipped.length}`);
console.log(`  Errors: ${results.errors.length}`);

console.log('\n📝 Next: Search for "TODO_SQL" and "TODO:" comments');
console.log('   Convert each MongoDB query to SQL using the query() function\n');
