#!/usr/bin/env node
/**
 * Final Complete Conversion - Removes all remaining MongoDB patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

function finalCleanup(content, filename) {
  let result = content;
  
  // Remove all db = ... getDatabase() lines
  result = result.replace(/\s*const (?:db|mainDb|tenantDb) = (?:req\.tenantDb \|\| )?(?:await )?getDatabase\([^)]*\);?\n?/g, '');
  
  // Remove all collection definitions
  result = result.replace(/\s*const \w+Collection = (?:db|mainDb|tenantDb)\.collection\([^)]+\);?\n?/g, '');
  
  // Remove standalone db.collection() calls that are left
  result = result.replace(/(?:db|mainDb|tenantDb)\.collection\([^)]+\)/g, '/* REMOVED_MONGO_COLLECTION */');
  
  // Remove TODO comments
  result = result.replace(/\/\* TODO: Convert[^*]*\*\/\s*/g, '');
  result = result.replace(/\/\* TODO_SQL:[^*]*\*\/\s*/g, '');
  
  // Clean up double newlines
  result = result.replace(/\n\n\n+/g, '\n\n');
  
  return result;
}

const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js') && !f.endsWith('.bak'));

console.log('🧹 Final Cleanup - Removing MongoDB remnants\n');

files.forEach(filename => {
  const filePath = path.join(controllersDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = finalCleanup(content, filename);
  
  if (cleaned !== content) {
    fs.writeFileSync(filePath, cleaned);
    console.log(`✓ Cleaned ${filename}`);
  }
});

console.log('\n✅ Cleanup complete!\n');
