import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🔐 Testing login on Koyeb...\n');
    
    const API_URL = 'https://sap-business-management-software.koyeb.app/api';
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@sbms.com',
        password: 'Test@2025'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.token?.substring(0, 30) + '...');
    } else {
      console.log('\n❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
