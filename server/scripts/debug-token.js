import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔍 JWT Token Debugger\n');
console.log('=' .repeat(60));
console.log('\nPaste your JWT token below and press Enter:\n');

rl.question('Token: ', (token) => {
  try {
    console.log('\n📦 Decoding token...\n');
    
    // Decode without verification first to see structure
    const decodedWithoutVerify = jwt.decode(token);
    console.log('Token payload (no verification):');
    console.log(JSON.stringify(decodedWithoutVerify, null, 2));
    
    // Now verify with secret
    console.log('\n🔐 Verifying with JWT_SECRET...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('\n✅ Token is VALID!\n');
    console.log('Verified payload:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\n🎯 Super Admin Check:');
    console.log(`  isSuperAdmin: ${decoded.isSuperAdmin} (type: ${typeof decoded.isSuperAdmin})`);
    console.log(`  role: ${decoded.role} (type: ${typeof decoded.role})`);
    console.log(`  Is Super Admin? ${decoded.isSuperAdmin === true || decoded.role === 'superadmin'}`);
    
    if (decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      const now = new Date();
      const isExpired = expiresAt < now;
      console.log(`\n⏰ Expiration:`);
      console.log(`  Expires at: ${expiresAt.toISOString()}`);
      console.log(`  Current time: ${now.toISOString()}`);
      console.log(`  Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
      if (!isExpired) {
        const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60);
        console.log(`  Time remaining: ${minutesLeft} minutes`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      console.log('\nThe token has expired!');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('\nThe token is invalid or malformed!');
    }
  }
  
  rl.close();
});

console.log('\n💡 TIP: You can find the token in:');
console.log('  - Browser localStorage (key: "token")');
console.log('  - Browser DevTools > Application > Local Storage');
console.log('  - Network tab > Request Headers > Authorization\n');
