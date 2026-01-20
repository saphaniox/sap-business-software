import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

// Send account approval email
export async function sendAccountApprovalEmail(req, res) {
  try {
    const { companyId } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    // Get company details
    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const company = companies[0];
    
    // Get admin user for this company
    const [adminUsers] = await query(
      'SELECT * FROM users WHERE company_id = ? AND role = ?',
      [companyId, 'admin']
    );
    
    if (adminUsers.length === 0 || !adminUsers[0].email) {
      return res.status(404).json({ error: 'Company admin email not found' });
    }
    
    const adminUser = adminUsers[0];
    
    // Create email template
    const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173/login';
    const template = emailTemplates.accountApproved(
      company.business_name,
      adminUser.email,
      loginUrl
    );
    
    // Send email
    const result = await sendEmail(adminUser.email, template);
    
    if (result.success) {
      // Log email sent in database
      await query(
        `INSERT INTO email_logs 
        (id, recipient, company_id, type, sent_by, sent_at, success, message_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          adminUser.email,
          companyId,
          'account_approval',
          req.user.id,
          new Date(),
          1,
          result.messageId,
          new Date(),
          new Date()
        ]
      );
      
      res.json({ 
        message: 'Approval email sent successfully',
        recipient: adminUser.email
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error sending approval email:', error);
    res.status(500).json({ error: 'Failed to send approval email' });
  }
}

// Send account suspension email
export async function sendAccountSuspensionEmail(req, res) {
  try {
    const { companyId, reason } = req.body;
    
    if (!companyId || !reason) {
      return res.status(400).json({ error: 'Company ID and reason are required' });
    }
    
    // Get company details
    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const company = companies[0];
    
    // Get admin user
    const [adminUsers] = await query(
      'SELECT * FROM users WHERE company_id = ? AND role = ?',
      [companyId, 'admin']
    );
    
    if (adminUsers.length === 0 || !adminUsers[0].email) {
      return res.status(404).json({ error: 'Company admin email not found' });
    }
    
    const adminUser = adminUsers[0];
    
    // Create email template
    const contactEmail = process.env.EMAIL_USER || 'saptechnologies256@gmail.com';
    const template = emailTemplates.accountSuspended(
      company.business_name,
      reason,
      contactEmail
    );
    
    // Send email
    const result = await sendEmail(adminUser.email, template);
    
    if (result.success) {
      // Log email
      await query(
        `INSERT INTO email_logs 
        (id, recipient, company_id, type, sent_by, sent_at, success, message_id, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          adminUser.email,
          companyId,
          'account_suspension',
          req.user.id,
          new Date(),
          1,
          result.messageId,
          JSON.stringify({ reason }),
          new Date(),
          new Date()
        ]
      );
      
      res.json({ 
        message: 'Suspension email sent successfully',
        recipient: adminUser.email
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error sending suspension email:', error);
    res.status(500).json({ error: 'Failed to send suspension email' });
  }
}

// Send new features announcement
export async function sendNewFeaturesEmail(req, res) {
  try {
    const { recipientType, features, learnMoreUrl } = req.body;
    
    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Features array is required' });
    }
    
    let recipients = [];
    
    // Get recipients based on type
    if (recipientType === 'all') {
      // Send to all active companies
      const [companies] = await query(
        'SELECT * FROM companies WHERE status = ?',
        ['approved']
      );
      
      for (const company of companies) {
        const [adminUsers] = await query(
          'SELECT * FROM users WHERE company_id = ? AND role = ?',
          [company.id, 'admin']
        );
        
        if (adminUsers.length > 0 && adminUsers[0].email) {
          recipients.push({
            email: adminUsers[0].email,
            name: company.business_name,
            companyId: company.id
          });
        }
      }
    } else if (recipientType === 'specific') {
      // Specific companies from request body
      const { companyIds } = req.body;
      
      if (!companyIds || !Array.isArray(companyIds)) {
        return res.status(400).json({ error: 'Company IDs array is required for specific recipients' });
      }
      
      for (const companyId of companyIds) {
        const [companies] = await query(
          'SELECT * FROM companies WHERE id = ?',
          [companyId]
        );
        
        if (companies.length > 0) {
          const company = companies[0];
          const [adminUsers] = await query(
            'SELECT * FROM users WHERE company_id = ? AND role = ?',
            [companyId, 'admin']
          );
          
          if (adminUsers.length > 0 && adminUsers[0].email) {
            recipients.push({
              email: adminUsers[0].email,
              name: company.business_name,
              companyId: companyId
            });
          }
        }
      }
    }
    
    if (recipients.length === 0) {
      return res.status(404).json({ error: 'No valid recipients found' });
    }
    
    // Send emails
    const results = [];
    const defaultUrl = learnMoreUrl || process.env.CLIENT_URL || 'http://localhost:5173';
    
    for (const recipient of recipients) {
      const template = emailTemplates.newFeatures(
        recipient.name,
        features,
        defaultUrl
      );
      
      const result = await sendEmail(recipient.email, template);
      
      results.push({
        email: recipient.email,
        success: result.success
      });
      
      // Log email
      await query(
        `INSERT INTO email_logs 
        (id, recipient, company_id, type, sent_by, sent_at, success, message_id, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          recipient.email,
          recipient.companyId,
          'new_features',
          req.user.id,
          new Date(),
          result.success ? 1 : 0,
          result.messageId || null,
          JSON.stringify({ features }),
          new Date(),
          new Date()
        ]
      );
      
      // Delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      message: `Sent ${successCount} out of ${results.length} emails successfully`,
      results
    });
  } catch (error) {
    console.error('Error sending feature announcement:', error);
    res.status(500).json({ error: 'Failed to send feature announcement' });
  }
}

// Send custom message
export async function sendCustomEmail(req, res) {
  try {
    const { recipientEmails, subject, message } = req.body;
    
    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({ error: 'Recipient emails array is required' });
    }
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    
    // Get sender info
    const [senders] = await query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );
    
    const senderName = senders.length > 0 ? senders[0].username : 'SAP Admin';
    
    // Send emails
    const results = [];
    
    for (const email of recipientEmails) {
      // Get recipient name if they're in our system
      const [recipients] = await query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      const recipientName = recipients.length > 0 ? recipients[0].username : 'Valued Customer';
      
      const template = emailTemplates.customMessage(
        recipientName,
        subject,
        message,
        senderName
      );
      
      const result = await sendEmail(email, template);
      
      results.push({
        email: email,
        success: result.success
      });
      
      // Log email
      await query(
        `INSERT INTO email_logs 
        (id, recipient, type, sent_by, sent_at, success, message_id, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          email,
          'custom',
          req.user.id,
          new Date(),
          result.success ? 1 : 0,
          result.messageId || null,
          JSON.stringify({ subject, message }),
          new Date(),
          new Date()
        ]
      );
      
      // Delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      message: `Sent ${successCount} out of ${results.length} emails successfully`,
      results
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({ error: 'Failed to send custom email' });
  }
}

// Get email logs
export async function getEmailLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    // Filter by type if provided
    if (req.query.type) {
      whereClause = 'WHERE type = ?';
      params.push(req.query.type);
    }
    
    // Filter by success status
    if (req.query.success !== undefined) {
      const successValue = req.query.success === 'true' ? 1 : 0;
      if (whereClause) {
        whereClause += ' AND success = ?';
      } else {
        whereClause = 'WHERE success = ?';
      }
      params.push(successValue);
    }
    
    const [logs] = await query(
      `SELECT * FROM email_logs ${whereClause} ORDER BY sent_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    const [totalResult] = await query(
      `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
      params
    );
    
    const total = totalResult[0].count;
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
}

// Test email configuration
export async function testEmailConfig(req, res) {
  try {
    const testEmail = req.body.testEmail || req.user.email || 'saptechnologies256@gmail.com';
    
    const template = emailTemplates.customMessage(
      'System Administrator',
      '✅ Email Configuration Test',
      'This is a test email to verify your email configuration is working correctly.\n\nIf you receive this email, your email service is properly configured and ready to send professional emails to clients.',
      'SAP Technologies System'
    );
    
    const result = await sendEmail(testEmail, template);
    
    if (result.success) {
      res.json({ 
        message: 'Test email sent successfully',
        recipient: testEmail,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send test email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error testing email config:', error);
    res.status(500).json({ error: 'Failed to test email configuration' });
  }
}
