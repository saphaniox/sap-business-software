import React from 'react'
import { Typography, Card, Divider, Button } from 'antd'
import { ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph } = Typography

function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/')}
          style={{ marginBottom: '20px' }}
        >
          Back to Home
        </Button>

        <Card>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={1}>Privacy Policy</Title>
            <Paragraph type="secondary">Last Updated: January 11, 2026</Paragraph>
          </div>

          <Divider />

          <Title level={2}>1. Introduction</Title>
          <Paragraph>
            SAP Business Management Software ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
            our business management platform. Please read this privacy policy carefully.
          </Paragraph>

          <Title level={2}>2. Information We Collect</Title>
          <Title level={3}>2.1 Personal Information</Title>
          <Paragraph>
            We collect information that you provide directly to us, including:
          </Paragraph>
          <ul>
            <li><strong>Business Information:</strong> Business name, industry type (16+ types), registration details</li>
            <li><strong>Contact Details:</strong> Administrator name, email address, phone number</li>
            <li><strong>User Accounts:</strong> Names, roles (Admin/Manager/Staff), contact details, profile pictures</li>
            <li><strong>Company Branding:</strong> Company logos uploaded for invoices, receipts, and PDF exports</li>
            <li><strong>Currency Settings:</strong> Selected currency from 15+ global currencies (UGX, USD, EUR, GBP, etc.)</li>
            <li><strong>Business Data:</strong> Customer and product data, sales records, expenses, invoices</li>
            <li><strong>Exported Data:</strong> Files you export to Excel, CSV, or PDF formats</li>
            <li><strong>Backup Files:</strong> Database backups you create or download</li>
            <li><strong>Notification Preferences:</strong> Settings for real-time alerts and notification center</li>
            <li><strong>Payment Information:</strong> (If applicable, processed securely through payment providers)</li>
          </ul>

          <Title level={3}>2.2 Automatically Collected Information</Title>
          <Paragraph>
            When you use our platform, we automatically collect:
          </Paragraph>
          <ul>
            <li><strong>Device Information:</strong> IP addresses, device type, operating system</li>
            <li><strong>Browser Data:</strong> Browser type, version, language preferences</li>
            <li><strong>Usage Analytics:</strong> Pages visited, features used, time spent on platform</li>
            <li><strong>Authentication Data:</strong> Login attempts, session tokens, authentication timestamps</li>
            <li><strong>Session Information:</strong> Session duration, last activity timestamps</li>
            <li><strong>Feature Usage:</strong> Export frequency, notification interactions, keyboard shortcut usage</li>
            <li><strong>Auto-Saved Drafts:</strong> Form data temporarily saved to your browser's localStorage</li>
            <li><strong>Performance Metrics:</strong> Page load times, API response times, error logs</li>
            <li><strong>Search Queries:</strong> Advanced search and filtering usage patterns</li>
          </ul>

          <Title level={2}>3. How We Use Your Information</Title>
          <Paragraph>
            We use the information we collect to:
          </Paragraph>
          <ul>
            <li><strong>Service Delivery:</strong> Provide, maintain, and improve our platform's core features</li>
            <li><strong>Data Management:</strong> Process transactions, manage business data, and generate reports</li>
            <li><strong>Multi-Currency Operations:</strong> Display prices and amounts in your selected currency</li>
            <li><strong>Export Functionality:</strong> Generate Excel, CSV, and PDF exports with your company branding</li>
            <li><strong>Notifications:</strong> Send real-time alerts for low stock, sales, expenses, and system events</li>
            <li><strong>Backup & Recovery:</strong> Create automated backups and enable one-click data restoration</li>
            <li><strong>Auto-Save:</strong> Preserve form drafts in localStorage to prevent data loss</li>
            <li><strong>Communications:</strong> Send administrative updates, security alerts, and feature announcements</li>
            <li><strong>Support:</strong> Respond to questions, comments, and technical support requests</li>
            <li><strong>Analytics:</strong> Monitor usage patterns, identify popular features, improve user experience</li>
            <li><strong>Security:</strong> Detect, prevent, and address technical issues, fraud, and security threats</li>
            <li><strong>Compliance:</strong> Comply with legal obligations and enforce our terms of service</li>
            <li><strong>Personalization:</strong> Remember preferences, keyboard shortcuts, and customization settings</li>
          </ul>

          <Title level={2}>4. Data Isolation and Security</Title>
          <Paragraph>
            We implement a multi-tenant architecture with complete data isolation:
          </Paragraph>
          <ul>
            <li>Each business operates in a completely isolated environment</li>
            <li>Your data cannot be accessed by other businesses using the platform</li>
            <li>We use industry-standard encryption for data in transit and at rest</li>
            <li>Regular security audits and penetration testing</li>
            <li>Role-based access control within your organization</li>
            <li>Account lockout protection after failed login attempts</li>
            <li>Secure JWT token-based authentication</li>
          </ul>

          <Title level={2}>5. Data Sharing and Disclosure</Title>
          <Paragraph>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </Paragraph>
          <ul>
            <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>Protection of Rights:</strong> To protect our rights, property, safety, or that of our users</li>
          </ul>

          <Title level={2}>6. Data Retention</Title>
          <Paragraph>
            We retain your information for as long as your account is active or as needed to provide you services. 
            You may request deletion of your data at any time by contacting our support team. However, we may retain 
            certain information as required by law or for legitimate business purposes.
          </Paragraph>

          <Title level={2}>7. Your Data Rights</Title>
          <Paragraph>
            You have the following rights regarding your data:
          </Paragraph>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Export:</strong> Download your business data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain data processing activities</li>
            <li><strong>Restriction:</strong> Request restriction of processing your data</li>
          </ul>

          <Title level={2}>8. Cookies and Tracking Technologies</Title>
          <Paragraph>
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
            Cookies are files with small amounts of data which may include an anonymous unique identifier. You can instruct 
            your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, 
            you may not be able to use some portions of our platform.
          </Paragraph>

          <Title level={2}>9. Data Backup and Recovery</Title>
          <Paragraph>
            We maintain automated backup systems to protect your data:
          </Paragraph>
          <ul>
            <li>Regular automated backups of all business data</li>
            <li>Secure backup storage with encryption</li>
            <li>Easy restore capabilities through the admin dashboard</li>
            <li>Point-in-time recovery options</li>
          </ul>

          <Title level={2}>10. International Data Transfers</Title>
          <Paragraph>
            Your information may be transferred to and maintained on computers located outside of your country where 
            data protection laws may differ. We ensure appropriate safeguards are in place to protect your information 
            in accordance with this Privacy Policy.
          </Paragraph>

          <Title level={2}>11. Children's Privacy</Title>
          <Paragraph>
            Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal 
            information from children. If you become aware that a child has provided us with personal information, 
            please contact us immediately.
          </Paragraph>

          <Title level={2}>12. Changes to This Privacy Policy</Title>
          <Paragraph>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
            Policy periodically for any changes.
          </Paragraph>

          <Title level={2}>13. Contact Us</Title>
          <Paragraph>
            If you have any questions about this Privacy Policy, please contact us:
          </Paragraph>
          <ul>
            <li><strong>Email:</strong> saptechnologies256@gmail.com</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li><strong>WhatsApp:</strong> +256 706 564 628</li>
          </ul>

          <Divider />

          <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: '40px' }}>
            © 2026 SAP Business Management Software. All rights reserved.
          </Paragraph>
        </Card>
      </div>
      <BackToTop />
    </div>
  )
}

export default PrivacyPolicy
