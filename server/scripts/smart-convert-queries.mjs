#!/usr/bin/env node
/**
 * Phase 3: Intelligent MongoDB to SQL Query Converter
 * Automatically converts common MongoDB patterns to SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

const conversions = {
  // Simple findOne with single field
  findOneSingleField: {
    pattern: /const (\w+) = await (\w+)Collection\.findOne\(\s*\{\s*(\w+):\s*([^}]+?)\s*\}\s*\);/g,
    convert: (match, varName, collection, field, value) => {
      const table = collection.toLowerCase();
      return `const ${varName}Result = await query('SELECT * FROM ${table} WHERE ${field} = ? LIMIT 1', [${value}]);\n    const ${varName} = ${varName}Result.rows[0];`;
    }
  },
  
  // findOne with company filter
  findOneCompany: {
    pattern: /const (\w+) = await (\w+)Collection\.findOne\(\s*createCompanyFilter\(companyId(?:,\s*\{[^}]+\})?\)\s*\);/g,
    convert: (match, varName, collection) => {
      const table = collection.toLowerCase();
      return `const ${varName}Result = await query('SELECT * FROM ${table} WHERE company_id = ? LIMIT 1', [companyId]);\n    const ${varName} = ${varName}Result.rows[0];`;
    }
  },
  
  // Simple find().toArray()
  findToArray: {
    pattern: /const (\w+) = await (\w+)Collection\.find\(\s*createCompanyFilter\(companyId\)\s*\)\.toArray\(\);/g,
    convert: (match, varName, collection) => {
      const table = collection.toLowerCase();
      return `const ${varName}Result = await query('SELECT * FROM ${table} WHERE company_id = ?', [companyId]);\n    const ${varName} = ${varName}Result.rows;`;
    }
  },
  
  // InsertOne with simple object
  insertOne: {
    pattern: /const result = await (\w+)Collection\.insertOne\((\w+)\);/g,
    convert: (match, collection, dataVar) => {
      return `const newId = uuidv4();\n    ${dataVar}.id = newId;\n    // TODO: Convert to INSERT query with proper fields\n    await query('INSERT INTO ${collection.toLowerCase()} (...) VALUES (...)', [...]);`;
    }
  },
  
  // DeleteOne
  deleteOne: {
    pattern: /const result = await (\w+)Collection\.deleteOne\(\s*createCompanyFilter\(companyId,\s*\{\s*id:\s*(\w+)\s*\}\s*\)\s*\);/g,
    convert: (match, collection, idVar) => {
      const table = collection.toLowerCase();
      return `const result = await query('DELETE FROM ${table} WHERE id = ? AND company_id = ?', [${idVar}, companyId]);`;
    }
  },
  
  // CountDocuments
  countDocuments: {
    pattern: /await (\w+)Collection\.countDocuments\(\s*createCompanyFilter\(companyId\)\s*\)/g,
    convert: (match, collection) => {
      const table = collection.toLowerCase();
      return `(await query('SELECT COUNT(*) as count FROM ${table} WHERE company_id = ?', [companyId])).rows[0].count`;
    }
  }
};

function smartConvert(content) {
  let result = content;
  let changesMade = [];
  
  Object.entries(conversions).forEach(([name, { pattern, convert }]) => {
    const matches = [...result.matchAll(pattern)];
    if (matches.length > 0) {
      result = result.replace(pattern, (...args) => {
        changesMade.push(name);
        return convert(...args);
      });
    }
  });
  
  return { result, changes Made };
}

function processFile(filename) {
  const filePath = path.join(controllersDir, filename);
  
  if (!fs.existsSync(filePath)) return null;
  
  try {
    const original = fs.readFileSync(filePath, 'utf8');
    
    const { result, changesMade } = smartConvert(original);
    
    if (result !== original) {
      fs.writeFileSync(filePath, result);
      return { converted: true, changes: changesMade.length, patterns: [...new Set(changesMade)] };
    }
    
    return { noChanges: true };
  } catch (error) {
    return { error: error.message };
  }
}

console.log('🔄 Phase 3: Smart Query Conversion\n');
console.log('=' .repeat(50) + '\n');

const files = fs.readdirSync(controllersDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.bak'));

let totalConverted = 0;

files.forEach(filename => {
  const result = processFile(filename);
  
  if (result?.converted) {
    console.log(`✓ ${filename} - ${result.changes} auto-converted`);
    totalConverted += result.changes;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Auto-converted: ${totalConverted} queries`);
console.log(`\n⚠️  Remaining queries need manual conversion`);
console.log(`   Run: grep -r "TODO" src/controllers/ to find them\n`);
