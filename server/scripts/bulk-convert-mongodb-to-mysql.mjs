#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

// Comprehensive conversion patterns
const patterns = [
  // 1. Import conversions
  {
    name: 'MongoDB getDatabase import',
    pattern: /import \{ getDatabase \} from '\.\.\/db\/connection\.js';/g,
    replacement: "import { query } from '../db/connection.js';"
  },
  {
    name: 'MongoDB ObjectId import',
    pattern: /import \{ ObjectId(?:, [^}]+)? \} from 'mongodb';/g,
    replacement: "import { v4 as uuidv4 } from 'uuid';"
  },
  {
    name: 'Remove Decimal128 import',
    pattern: /import \{[^}]*Decimal128[^}]*\} from 'mongodb';?\n?/g,
    replacement: ''
  },
  
  // 2. Remove database/collection setup
  {
    name: 'Remove getDatabase calls',
    pattern: /const db = (?:req\.tenantDb \|\| )?getDatabase\(\);?\n/g,
    replacement: ''
  },
  {
    name: 'Remove collection definitions',
    pattern: /const \w+Collection = db\.collection\('[^']+'\);?\n/g,
    replacement: ''
  },
  
  // 3. ObjectId usage
  {
    name: 'new ObjectId(...)',
    pattern: /new ObjectId\(([^)]+)\)/g,
    replacement: '$1'
  },
  {
    name: 'Plain ObjectId(...)',
    pattern: /(?<!new )ObjectId\(([^)]+)\)/g,
    replacement: '$1'
  },
  
  // 4. Field name conversions
  {
    name: '_id to id in dot notation',
    pattern: /\._id\b/g,
    replacement: '.id'
  },
  {
    name: '_id to id in object keys',
    pattern: /\b_id:/g,
    replacement: 'id:'
  },
  {
    name: '_id in brackets',
    pattern: /\['_id'\]/g,
    replacement: "['id']"
  },
  {
    name: 'result.insertedId',
    pattern: /result\.insertedId/g,
    replacement: 'newId'
  },
  {
    name: 'result.deletedCount',
    pattern: /result\.deletedCount/g,
    replacement: 'result.affectedRows'
  },
  
  // 5. Decimal128 conversions
  {
    name: 'Decimal128.fromString',
    pattern: /Decimal128\.fromString\(String\(([^)]+)\)\)/g,
    replacement: '$1'
  },
  {
    name: 'parseFloat(decimal.toString())',
    pattern: /parseFloat\((\w+)\.unit_price\.toString\(\)\)/g,
    replacement: '$1.unit_price'
  },
  {
    name: 'parseFloat(field.toString()) generic',
    pattern: /parseFloat\(([^)]+)\.toString\(\)\)/g,
    replacement: '$1'
  },
];

function applyPatterns(content) {
  let result = content;
  const appliedPatterns = [];
  
  patterns.forEach(({ name, pattern, replacement }) => {
    const before = result;
    result = result.replace(pattern, replacement);
    if (result !== before) {
      appliedPatterns.push(name);
    }
  });
  
  return { result, appliedPatterns };
}

function processFile(filename) {
  const filePath = path.join(controllersDir, filename);
  
  if (!fs.existsSync(filePath)) return null;
  
  try {
    const original = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no MongoDB usage
    if (!original.includes('mongodb') && !original.includes('getDatabase') && !original.includes('ObjectId')) {
      return { skipped: true, reason: 'No MongoDB usage' };
    }
    
    // Apply automatic patterns
    const { result, appliedPatterns } = applyPatterns(original);
    
    if (result !== original) {
      // Backup
      const backupPath = filePath + '.mongodb.bak';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, original);
      }
      
      // Write converted
      fs.writeFileSync(filePath, result);
      
      return {
        converted: true,
        patterns: appliedPatterns,
        changes: appliedPatterns.length
      };
    }
    
    return { noChanges: true };
  } catch (error) {
    return { error: error.message };
  }
}

console.log('🔄 MongoDB → MySQL Bulk Conversion\n');
console.log('=' .repeat(50) + '\n');

const files = fs.readdirSync(controllersDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.bak'));

const results = {
  converted: [],
  skipped: [],
  errors: [],
  noChanges: []
};

files.forEach(filename => {
  const result = processFile(filename);
  
  if (!result) return;
  
  if (result.converted) {
    results.converted.push({ filename, ...result });
    console.log(`✓ ${filename}`);
    console.log(`  Applied: ${result.patterns.join(', ')}\n`);
  } else if (result.skipped) {
    results.skipped.push(filename);
  } else if (result.error) {
    results.errors.push({ filename, error: result.error });
    console.log(`✗ ${filename}: ${result.error}\n`);
  } else if (result.noChanges) {
    results.noChanges.push(filename);
  }
});

console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
console.log(`  Converted: ${results.converted.length}`);
console.log(`  Skipped: ${results.skipped.length}`);
console.log(`  No changes: ${results.noChanges.length}`);
console.log(`  Errors: ${results.errors.length}`);

console.log('\n⚠️  Note: Automatic conversion handles common patterns.');
console.log('   Complex queries (.find, .aggregate, .insertOne, etc.)');
console.log('   need manual SQL conversion.\n');
