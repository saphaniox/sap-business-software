import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter with fallback strategies
const createTransporter = () => {
  // Use default import for nodemailer
  const transporter = nodemailer.default || nodemailer;
  
  // Strategy 1: Try port 465 (SSL) - most reliable on Render
  const config = {
    host: 'smtp.gmail.com',
    port: 465, // SSL port (more reliable on hosting platforms)
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER || 'saptechnologies256@gmail.com',
      pass: process.env.EMAIL_PASSWORD // App password from Gmail
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 20000, // 20 seconds
    socketTimeout: 45000, // 45 seconds
    debug: true, // Enable debug output
    logger: true // Log to console
  };
  
  return transporter.createTransport(config);
};

// Fallback transporter for port 587 (TLS)
const createFallbackTransporter = () => {
  const transporter = nodemailer.default || nodemailer;
  return transporter.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
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
    debug: true,
    logger: true
  });
};

// Professional email templates
export const emailTemplates = {
  // Account approval email
  accountApproved: (companyName, email, loginUrl) => ({
    subject: '🎉 Your Business Account Has Been Approved - SAP Business Management',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .logo { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .cta-button:hover { opacity: 0.9; }
          .features { margin: 30px 0; }
          .feature-item { padding: 10px 0; display: flex; align-items: center; }
          .feature-icon { color: #10b981; margin-right: 10px; font-size: 20px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
          .footer a { color: #60a5fa; text-decoration: none; }
          .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎯</div>
            <h1>SAP Business Management</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Trusted Business Partner</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome Aboard, ${companyName}! 🎊</h2>
            
            <div class="success-badge">✓ Account Approved</div>
            
            <p style="font-size: 16px; color: #4b5563;">
              Congratulations! Your business account has been successfully approved by our super admin team. 
              You can now access all the powerful features of our business management platform.
            </p>
            
            <div class="info-box">
              <strong>📧 Your Login Email:</strong><br>
              <span style="font-size: 18px; color: #0ea5e9; font-weight: bold;">${email}</span>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" class="cta-button">Login to Your Dashboard →</a>
            </div>
            
            <div class="divider"></div>
            
            <h3 style="color: #1f2937;">🚀 What You Can Do Now:</h3>
            <div class="features">
              <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Manage products, inventory, and pricing</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Track sales orders and customer information</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Generate professional invoices and reports</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Monitor expenses and financial analytics</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Add team members and manage permissions</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Access real-time business insights</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Need Help?</strong> Our support team is here to assist you. 
              If you have any questions or need assistance getting started, don't hesitate to reach out.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>SAP Technologies</strong></p>
            <p style="margin: 0 0 10px 0;">Professional Business Management Solutions</p>
            <p style="margin: 0;">
              <a href="mailto:saptechnologies256@gmail.com">saptechnologies256@gmail.com</a>
            </p>
            <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.7;">
              © ${new Date().getFullYear()} SAP Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Account suspended email
  accountSuspended: (companyName, reason, contactEmail) => ({
    subject: '⚠️ Account Suspended - SAP Business Management',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .logo { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .warning-badge { background: #ef4444; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background: #0ea5e9; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
          .footer a { color: #60a5fa; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚠️</div>
            <h1>SAP Business Management</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937;">Account Suspension Notice</h2>
            
            <div class="warning-badge">Account Suspended</div>
            
            <p>Dear ${companyName},</p>
            
            <p>We regret to inform you that your business account has been temporarily suspended.</p>
            
            <div class="reason-box">
              <strong>Reason for Suspension:</strong><br>
              <span style="font-size: 16px; color: #dc2626;">${reason}</span>
            </div>
            
            <p>
              If you believe this is an error or would like to appeal this decision, 
              please contact our support team immediately.
            </p>
            
            <div style="text-align: center;">
              <a href="mailto:${contactEmail}" class="cta-button">Contact Support</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              We value your business and hope to resolve this matter promptly.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>SAP Technologies</strong></p>
            <p><a href="mailto:${contactEmail}">${contactEmail}</a></p>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
              © ${new Date().getFullYear()} SAP Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // New features announcement
  newFeatures: (recipientName, features, learnMoreUrl) => ({
    subject: '🚀 Exciting New Features Available - SAP Business Management',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .logo { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .feature-badge { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .feature-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; }
          .feature-title { color: #1f2937; font-weight: bold; font-size: 18px; margin: 0 0 10px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
          .footer a { color: #60a5fa; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚀</div>
            <h1>SAP Business Management</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Innovation Never Stops</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937;">Hello ${recipientName}! 👋</h2>
            
            <div class="feature-badge">NEW FEATURES</div>
            
            <p style="font-size: 16px;">
              We're excited to announce powerful new features that will help you manage your business even better!
            </p>
            
            ${features.map(feature => `
              <div class="feature-card">
                <div class="feature-title">${feature.icon} ${feature.title}</div>
                <p style="color: #4b5563; margin: 0;">${feature.description}</p>
              </div>
            `).join('')}
            
            <div style="text-align: center;">
              <a href="${learnMoreUrl}" class="cta-button">Explore New Features →</a>
            </div>
            
            <p style="color: #6b7280; margin-top: 30px;">
              These features are available now in your dashboard. Start using them today to boost your productivity!
            </p>
          </div>
          
          <div class="footer">
            <p><strong>SAP Technologies</strong></p>
            <p>Professional Business Management Solutions</p>
            <p><a href="mailto:saptechnologies256@gmail.com">saptechnologies256@gmail.com</a></p>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
              © ${new Date().getFullYear()} SAP Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Custom message template
  customMessage: (recipientName, subject, message, senderName) => ({
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .logo { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .message-box { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
          .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
          .footer a { color: #60a5fa; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📧</div>
            <h1>SAP Business Management</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937;">Hello ${recipientName}! 👋</h2>
            
            <div class="message-box">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <p style="color: #6b7280; margin-top: 30px;">
              Best regards,<br>
              <strong>${senderName}</strong><br>
              SAP Technologies Team
            </p>
          </div>
          
          <div class="footer">
            <p><strong>SAP Technologies</strong></p>
            <p>Professional Business Management Solutions</p>
            <p><a href="mailto:saptechnologies256@gmail.com">saptechnologies256@gmail.com</a></p>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
              © ${new Date().getFullYear()} SAP Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function with fallback retry logic
export async function sendEmail(to, template) {
  let lastError;
  
  // Strategy 1: Try port 465 (SSL)
  try {
    console.log('📧 Attempting to send email via port 465 (SSL)...');
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'SAP Technologies',
        address: process.env.EMAIL_USER || 'saptechnologies256@gmail.com'
      },
      to: to,
      subject: template.subject,
      html: template.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via port 465:', info.messageId);
    return { success: true, messageId: info.messageId, method: 'port-465-ssl' };
  } catch (error) {
    console.error('⚠️ Port 465 (SSL) failed:', error.message);
    lastError = error;
  }
  
  // Strategy 2: Try port 587 (STARTTLS) as fallback
  try {
    console.log('📧 Attempting fallback: port 587 (STARTTLS)...');
    const fallbackTransporter = createFallbackTransporter();
    
    const mailOptions = {
      from: {
        name: 'SAP Technologies',
        address: process.env.EMAIL_USER || 'saptechnologies256@gmail.com'
      },
      to: to,
      subject: template.subject,
      html: template.html
    };
    
    const info = await fallbackTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via port 587:', info.messageId);
    return { success: true, messageId: info.messageId, method: 'port-587-starttls' };
  } catch (error) {
    console.error('⚠️ Port 587 (STARTTLS) failed:', error.message);
    lastError = error;
  }
  
  // All strategies failed
  console.error('❌ All email delivery strategies failed');
  console.error('Last error:', lastError);
  console.error('💡 Troubleshooting tips:');
  console.error('  1. Verify EMAIL_USER and EMAIL_PASSWORD environment variables are set');
  console.error('  2. Ensure you are using a Gmail App Password (not regular password)');
  console.error('  3. Check if hosting platform blocks SMTP ports (common on Render/Heroku)');
  console.error('  4. Consider using SendGrid, Mailgun, or AWS SES for production');
  
  return { 
    success: false, 
    error: lastError.message,
    code: lastError.code,
    troubleshooting: 'Check logs above for detailed troubleshooting steps'
  };
}

// Send bulk emails
export async function sendBulkEmails(recipients, template) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template);
    results.push({
      email: recipient,
      ...result
    });
    
    // Add delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
