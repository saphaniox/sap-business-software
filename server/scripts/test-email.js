import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Email Configuration...\n');

// Check environment variables
console.log('📧 Email Configuration:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set (hidden)' : '❌ Not set');
console.log('  Email address:', process.env.EMAIL_USER || 'saptechnologies256@gmail.com');
console.log('');

const createTransporter = (port, secure) => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: {
      user: process.env.EMAIL_USER || 'saptechnologies256@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 30000,
    greetingTimeout: 20000,
    socketTimeout: 45000,
    debug: false,
    logger: false
  });
};

// Test function
const testEmail = async (transporter, portInfo) => {
  try {
    console.log(`📨 Testing ${portInfo}...`);
    
    // Verify connection
    await transporter.verify();
    console.log(`  ✅ SMTP Connection successful`);
    
    // Send test email
    const testEmailAddress = process.env.EMAIL_USER || 'saptechnologies256@gmail.com';
    const info = await transporter.sendMail({
      from: {
        name: 'SAP Business System',
        address: testEmailAddress
      },
      to: testEmailAddress, // Send to self for testing
      subject: '✅ Email Test - SAP Business System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #10b981; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .info { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email System Test</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2>🎉 Email Service is Working!</h2>
              </div>
              
              <div class="info">
                <h3>Test Details:</h3>
                <p><strong>Configuration:</strong> ${portInfo}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>From:</strong> ${testEmailAddress}</p>
                <p><strong>To:</strong> ${testEmailAddress}</p>
              </div>
              
              <p>This is an automated test email from your SAP Business Management System. If you're seeing this, your email configuration is working correctly!</p>
              
              <h3>Next Steps:</h3>
              <ul>
                <li>✅ Email sending is functional</li>
                <li>✅ SMTP connection established</li>
                <li>✅ Authentication successful</li>
                <li>✅ Ready for production use</li>
              </ul>
              
              <div class="footer">
                <p>SAP Business Management System</p>
                <p>This is an automated test email - no reply needed</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
✅ Email System Test

Email Service is Working!

Test Details:
- Configuration: ${portInfo}
- Date: ${new Date().toLocaleString()}
- From: ${testEmailAddress}
- To: ${testEmailAddress}

This is an automated test email from your SAP Business Management System.

Next Steps:
✅ Email sending is functional
✅ SMTP connection established
✅ Authentication successful
✅ Ready for production use

SAP Business Management System
      `
    });
    
    console.log(`  ✅ Test email sent successfully!`);
    console.log(`  📬 Message ID: ${info.messageId}`);
    console.log(`  📮 Check inbox: ${testEmailAddress}\n`);
    return true;
    
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}\n`);
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting email tests...\n');
  
  if (!process.env.EMAIL_PASSWORD) {
    console.log('⚠️  WARNING: EMAIL_PASSWORD not set in environment variables');
    console.log('   Please set EMAIL_PASSWORD in your .env file or Koyeb environment\n');
  }
  
  // Test Port 465 (SSL)
  const transporter465 = createTransporter(465, true);
  const test465Success = await testEmail(transporter465, 'Port 465 (SSL)');
  
  // Test Port 587 (TLS) if 465 failed
  if (!test465Success) {
    console.log('🔄 Trying fallback configuration...\n');
    const transporter587 = createTransporter(587, false);
    await testEmail(transporter587, 'Port 587 (TLS/STARTTLS)');
  }
  
  console.log('✅ Email testing completed!');
  console.log('\n📝 Summary:');
  console.log('  - If you received an email, the system is working correctly');
  console.log('  - Check your spam folder if you don\'t see it in inbox');
  console.log('  - For Gmail, ensure you\'re using an App Password (not regular password)');
  console.log('\n🔗 Gmail App Password: https://myaccount.google.com/apppasswords');
};

runTests().catch(console.error);
