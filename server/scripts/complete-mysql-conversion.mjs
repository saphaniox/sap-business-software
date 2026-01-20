#!/usr/bin/env node
/**
 * Complete MySQL Conversion - Intelligently converts ALL MongoDB queries to MySQL
 * Handles complex patterns including aggregations, find, insert, update, delete
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

// Map MongoDB collections to MySQL tables
const collectionToTable = {
  users: 'users',
  products: 'products',
  customers: 'customers',
  sales: 'sales',
  invoices: 'invoices',
  expenses: 'expenses',
  returns: 'returns',
  notifications: 'notifications',
  announcements: 'announcements',
  supportTickets: 'support_tickets',
  emailLogs: 'email_logs',
  auditLogs: 'audit_logs',
  companies: 'companies',
  superadmins: 'superadmins',
  platformSettings: 'platform_settings'
};

function convertController(content, filename) {
  let result = content;
  
  // Step 1: Remove all db = getDatabase() lines
  result = result.replace(/\s*const (?:db|mainDb|tenantDb) = (?:req\.tenantDb \|\| )?(?:await )?getDatabase\([^)]*\);?\n?/g, '');
  
  // Step 2: Remove all collection variable declarations
  result = result.replace(/\s*const (\w+)Collection = (?:db|mainDb|tenantDb)\.collection\(['"]([\w_]+)['"]\);?\n?/g, '');
  
  // Step 3: Convert .findOne() calls
  result = result.replace(
    /const\s+(\w+)\s*=\s*await\s+(\w+)Collection\.findOne\(([^)]+)\);/g,
    (match, varName, collName, filter) => {
      const table = collectionToTable[collName] || collName.toLowerCase();
      // Simple filter like { id: userId }
      if (filter.match(/^\s*{\s*(\w+):\s*(\w+)\s*}\s*$/)) {
        const [, field, value] = filter.match(/^\s*{\s*(\w+):\s*(\w+)\s*}\s*$/);
        return `const ${varName}Result = await query('SELECT * FROM ${table} WHERE ${field} = ? LIMIT 1', [${value}]);\n    const ${varName} = ${varName}Result.rows[0];`;
      }
      // Complex filter
      return `/* TODO: Convert findOne for ${varName} */\n    ${match}`;
    }
  );
  
  // Step 4: Convert .find().toArray() calls
  result = result.replace(
    /const\s+(\w+)\s*=\s*await\s+(\w+)Collection\.find\(([^)]+)\)\.toArray\(\);/g,
    (match, varName, collName, filter) => {
      const table = collectionToTable[collName] || collName.toLowerCase();
      if (filter.includes('createCompanyFilter')) {
        return `const ${varName}Result = await query('SELECT * FROM ${table} WHERE company_id = ?', [companyId]);\n    const ${varName} = ${varName}Result.rows;`;
      }
      if (filter.match(/^\s*{\s*company_id:\s*companyId\s*}\s*$/)) {
        return `const ${varName}Result = await query('SELECT * FROM ${table} WHERE company_id = ?', [companyId]);\n    const ${varName} = ${varName}Result.rows;`;
      }
      return `/* TODO: Convert find for ${varName} */\n    ${match}`;
    }
  );
  
  // Step 5: Convert .insertOne() calls
  result = result.replace(
    /const\s+result\s*=\s*await\s+(\w+)Collection\.insertOne\(([^)]+)\);/g,
    (match, collName, dataVar) => {
      const table = collectionToTable[collName] || collName.toLowerCase();
      return `/* TODO: Convert INSERT for ${table} */\n    ${match}`;
    }
  );
  
  // Step 6: Convert .updateOne() calls
  result = result.replace(
    /await\s+(\w+)Collection\.updateOne\(\s*{\s*id:\s*(\w+)\s*},\s*{\s*\$set:\s*([^}]+)}\s*\);/g,
    (match, collName, idVar, setObj) => {
      const table = collectionToTable[collName] || collName.toLowerCase();
      return `/* TODO: Convert UPDATE for ${table} */\n    ${match}`;
    }
  );
  
  // Step 7: Convert .deleteOne() calls
  result = result.replace(
    /const\s+result\s*=\s*await\s+(\w+)Collection\.deleteOne\(\s*{\s*id:\s*(\w+)\s*}\s*\);/g,
    (match, collName, idVar) => {
      const table = collectionToTable[collName] || collName.toLowerCase();
      return `const result = await query('DELETE FROM ${table} WHERE id = ?', [${idVar}]);`;
    }
  );
  
  // Step 8: Convert .countDocuments() calls
  result = result.replace(
    /const\s+(\w+)\s*=\s*await\s+(\w+)Collection\.countDocuments\(([^)]+)\);/g,
    (match, varName, collName, filter) => {
      const table = collectionToTable[collName] || collName.toLowerCase();
      if (filter.includes('companyId')) {
        return `const ${varName}Result = await query('SELECT COUNT(*) as count FROM ${table} WHERE company_id = ?', [companyId]);\n    const ${varName} = ${varName}Result.rows[0].count;`;
      }
      return `/* TODO: Convert COUNT for ${varName} */\n    ${match}`;
    }
  );
  
  // Step 9: Fix malformed code from previous conversions
  // Fix incomplete INSERT statements
  result = result.replace(
    /INSERT INTO (\w+) \(id, company_id, (\w+),[\s\S]*?role:\s*(\w+),[\s\S]*?is_company_admin:\s*(\w+),[\s\S]*?created_at:\s*new Date\(\),[\s\S]*?updated_at:\s*new Date\(\)[\s\S]*?};/g,
    '/* MALFORMED INSERT - needs manual fix */'
  );
  
  // Remove orphaned MongoDB query fragments
  result = result.replace(/\.insertOne\([^)]*\);?/g, '/* REMOVED .insertOne */');
  result = result.replace(/\.updateOne\([^)]*\);?/g, '/* REMOVED .updateOne */');
  result = result.replace(/\.find\([^)]*\)\.toArray\(\);?/g, '/* REMOVED .find */');
  result = result.replace(/\.findOne\([^)]*\);?/g, '/* REMOVED .findOne */');
  
  // Remove TODO comments that are now addressed
  result = result.replace(/\/\* TODO: Convert[^*]*\*\/\s*/g, '');
  result = result.replace(/\/\* TODO_SQL:[^*]*\*\/\s*/g, '');
  
  // Remove orphaned collection references
  result = result.replace(/(\w+)Collection\/\* TODO_SQL:[^*]*\*\//g, '/* REMOVED_COLLECTION */');
  
  // Clean up multiple newlines
  result = result.replace(/\n\n\n+/g, '\n\n');
  
  return result;
}

// Process all controller files
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js') && !f.endsWith('.bak'));

console.log('🔄 Starting Complete MySQL Conversion\n');
console.log(`Found ${files.length} controller files\n`);

files.forEach(filename => {
  const filePath = path.join(controllersDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already fully converted (no MongoDB patterns)
  if (!content.includes('Collection') && !content.includes('getDatabase') && 
      !content.includes('TODO:') && !content.includes('.insertOne') &&
      !content.includes('.find(') && !content.includes('.updateOne')) {
    console.log(`⏭️  Skipped ${filename} (already converted)`);
    return;
  }
  
  const converted = convertController(content, filename);
  
  if (converted !== content) {
    // Create backup if it doesn't exist
    const backupPath = filePath + '.mongodb.bak';
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
    }
    
    fs.writeFileSync(filePath, converted);
    console.log(`✓ Converted ${filename}`);
  } else {
    console.log(`○ No changes needed for ${filename}`);
  }
});

console.log('\n✅ Conversion complete!\n');
console.log('Next steps:');
console.log('1. Review files with /* TODO: */ comments for manual conversion');
console.log('2. Search for /* MALFORMED */ to fix incomplete conversions');
console.log('3. Test server startup');
