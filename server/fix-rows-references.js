import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, 'src', 'controllers');

// Patterns to replace
const patterns = [
  // result.rows.length
  { regex: /(\w+Result|result|existing\w*|check\w*|updated\w*|company\w*|user\w*|order\w*|product\w*|customer\w*|invoice\w*|sales\w*|expense\w*|return\w*|notification\w*|announcement\w*|log\w*|ticket\w*|setting\w*|backup\w*)\.rows\.length/g, replace: '$1.length' },
  // result.rows[0]
  { regex: /(\w+Result|result|existing\w*|check\w*|updated\w*|company\w*|user\w*|order\w*|product\w*|customer\w*|invoice\w*|sales\w*|expense\w*|return\w*|notification\w*|announcement\w*|log\w*|ticket\w*|setting\w*)\.rows\[0\]/g, replace: '$1[0]' },
  // result.rows.map
  { regex: /(\w+Result|result|\w+s)\.rows\.map\(/g, replace: '$1.map(' },
  // result.rows.forEach
  { regex: /(\w+Result|result|\w+s)\.rows\.forEach\(/g, replace: '$1.forEach(' },
  // Direct assignment like: const products = productsResult.rows
  { regex: /=\s*(\w+Result|\w+s)\.rows\s*;/g, replace: '= $1;' },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changesMade = 0;

  patterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      changesMade += matches.length;
      content = content.replace(pattern.regex, pattern.replace);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changesMade} references in ${path.basename(filePath)}`);
    return changesMade;
  }
  
  return 0;
}

// Get all controller files
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

console.log('🔧 Fixing .rows references in controllers...\n');

let totalChanges = 0;
files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  const changes = fixFile(filePath);
  totalChanges += changes;
});

console.log(`\n✅ Total: Fixed ${totalChanges} references across ${files.length} files`);
