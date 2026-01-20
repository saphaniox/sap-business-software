#!/usr/bin/env node
/**
 * Automated MongoDB to MySQL conversion script
 * This script converts all remaining controller files to use MySQL instead of MongoDB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

// Files already converted - skip these
const CONVERTED_FILES = [
  'authController.js',
  'productController.js',
  'customerController.js',
  'companyController.js'
];

function convertMongoToMySQL(content, filename) {
  let converted = content;
  let changes = [];

  // 1. Replace imports
  if (converted.includes("import { getDatabase } from '../db/connection.js'")) {
    converted = converted.replace(
      /import \{ getDatabase \} from '\.\.\/db\/connection\.js';/g,
      "import { query } from '../db/connection.js';"
    );
    changes.push('Updated getDatabase import to query');
  }

  if (converted.includes("import { ObjectId")) {
    converted = converted.replace(
      /import \{ ObjectId(?:, [^}]+)? \} from 'mongodb';/g,
      "import { v4 as uuidv4 } from 'uuid';"
    );
    changes.push('Replaced ObjectId import with uuidv4');
  }

  if (converted.includes("from 'mongodb'")) {
    converted = converted.replace(
      /import \{[^}]+\} from 'mongodb';?\n?/g,
      ''
    );
    changes.push('Removed remaining MongoDB imports');
  }

  // 2. Remove getDatabase() and collection() patterns
  converted = converted.replace(
    /const db = (?:req\.tenantDb \|\| )?getDatabase\(\);?\n?/g,
    ''
  );
  converted = converted.replace(
    /const \w+Collection = db\.collection\('[^']+'\);?\n?/g,
    ''
  );

  // 3. Convert common MongoDB query patterns
  // Simple findOne -> SELECT
  converted = converted.replace(
    /const (\w+) = await \w+Collection\.findOne\(\s*\{([^}]+)\}\s*\);?/g,
    (match, varName, filter) => {
      changes.push(`Converting findOne for ${varName}`);
      return `// TODO: Convert MongoDB findOne to SQL SELECT\n    // Original: ${match}\n    const result = await query('SELECT * FROM table WHERE condition LIMIT 1', []);\n    const ${varName} = result.rows[0];`;
    }
  );

  // 4. Replace ObjectId usage
  converted = converted.replace(/new ObjectId\(([^)]+)\)/g, '$1');
  converted = converted.replace(/ObjectId\(([^)]+)\)/g, '$1');

  // 5. Replace _id with id
  converted = converted.replace(/\._id/g, '.id');
  converted = converted.replace(/\['_id'\]/g, "['id']");
  converted = converted.replace(/\{ _id:/g, '{ id:');

  if (changes.length > 0) {
    console.log(`\n${filename}:`);
    changes.forEach(change => console.log(`  - ${change}`));
  }

  return converted;
}

function processFile(filename) {
  const filePath = path.join(controllersDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return false;
  }

  if (CONVERTED_FILES.includes(filename)) {
    console.log(`Skipping ${filename} (already converted)`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses MongoDB
    if (!content.includes('mongodb') && !content.includes('getDatabase') && !content.includes('ObjectId')) {
      console.log(`Skipping ${filename} (no MongoDB usage detected)`);
      return false;
    }

    const converted = convertMongoToMySQL(content, filename);
    
    if (converted !== content) {
      // Create backup
      fs.writeFileSync(filePath + '.mongodb.backup', content);
      // Write converted file
      fs.writeFileSync(filePath, converted);
      console.log(`✓ Converted ${filename}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return false;
  }
  
  return false;
}

// Main execution
console.log('Starting MongoDB to MySQL conversion...\n');
console.log('==================================================\n');

const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
let convertedCount = 0;

files.forEach(filename => {
  if (processFile(filename)) {
    convertedCount++;
  }
});

console.log('\n==================================================');
console.log(`\nConversion complete!`);
console.log(`Files converted: ${convertedCount}`);
console.log(`\nNote: This script provides a starting point.`);
console.log(`You'll need to manually complete the SQL queries.`);
console.log(`Backup files saved with .mongodb.backup extension.`);
