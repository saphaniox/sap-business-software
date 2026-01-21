import fetch from 'node-fetch';

const API_URL = 'https://sap-business-management-software.koyeb.app/api';
const MAX_ATTEMPTS = 30;
const DELAY_MS = 10000; // 10 seconds

async function checkDeployment() {
  console.log('⏳ Waiting for Koyeb to redeploy...\n');
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_ATTEMPTS}...`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@sbms.com',
          password: 'Test@2025'
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('\n✅ SUCCESS! Koyeb has deployed the fixes!');
        console.log('🎉 Login is working!');
        console.log(`\nToken: ${data.token?.substring(0, 30)}...`);
        return true;
      } else if (response.status === 401 && data.error?.includes('Incorrect password')) {
        console.log('\n✅ User found! (but password check failed - database is responding)');
        return true;
      } else {
        console.log(`   Status ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('\n❌ Deployment still not ready after 5 minutes');
  console.log('💡 You may need to manually restart Koyeb service');
  return false;
}

checkDeployment();
